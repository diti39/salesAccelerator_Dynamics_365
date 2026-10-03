using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace SalesAccelerator.Plugins
{
    /// <summary>
    /// Executes the logic behind the new_QualifyLead custom action.
    ///
    /// Registration (Plugin Registration Tool):
    ///   Message:        new_QualifyLead
    ///   Primary Entity: lead
    ///   Stage:          PostOperation
    ///   Mode:           Synchronous
    /// </summary>
    public class LeadQualificationAction : IPlugin
    {
        private const int QualificationThreshold = 6;

        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            if (!(context.InputParameters["Target"] is EntityReference targetRef))
            {
                throw new InvalidPluginExecutionException("Target must be a Lead reference.");
            }

            tracing.Trace("Qualifying lead {0}", targetRef.Id);

            var lead = service.Retrieve("lead", targetRef.Id, new ColumnSet(
                "new_companysizescore", "new_budgetscore", "fullname"));

            int companyScore = lead.GetAttributeValue<int?>("new_companysizescore") ?? 0;
            int budgetScore = lead.GetAttributeValue<int?>("new_budgetscore") ?? 0;
            int engagementScore = CountEngagementActivities(service, targetRef.Id);

            int totalScore = Math.Min(10, companyScore + budgetScore + engagementScore);
            tracing.Trace("Total score: {0}", totalScore);

            var leadUpdate = new Entity("lead", targetRef.Id);
            leadUpdate["new_leadscore"] = totalScore;
            leadUpdate["new_qualified"] = totalScore >= QualificationThreshold;
            service.Update(leadUpdate);

            EntityReference newOpportunityRef = null;

            if (totalScore >= QualificationThreshold)
            {
                var opportunity = new Entity("opportunity");
                opportunity["name"] = $"{lead.GetAttributeValue<string>("fullname")} - Opportunity";
                opportunity["new_sourceleadscore"] = totalScore;
                opportunity["originatingleadid"] = targetRef;

                Guid newOppId = service.Create(opportunity);
                newOpportunityRef = new EntityReference("opportunity", newOppId);
                tracing.Trace("Created opportunity {0}", newOppId);
            }

            context.OutputParameters["NewOpportunityId"] = newOpportunityRef;
            context.OutputParameters["QualifiedScore"] = totalScore;
        }

        private static int CountEngagementActivities(IOrganizationService service, Guid leadId)
        {
            var query = new QueryExpression("activitypointer")
            {
                ColumnSet = new ColumnSet(false),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("regardingobjectid", ConditionOperator.Equal, leadId),
                        new ConditionExpression("statecode", ConditionOperator.Equal, 1)
                    }
                }
            };

            int count = service.RetrieveMultiple(query).Entities.Count;
            return Math.Min(4, count);
        }
    }
}
