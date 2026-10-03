using System;
using Microsoft.Xrm.Sdk;

namespace SalesAccelerator.Plugins
{
    /// <summary>
    /// Blocks saving an Opportunity when the discount exceeds 15% and there is
    /// no justification in the Description field.
    ///
    /// Registration (Plugin Registration Tool), create TWO steps:
    ///   1) Message: Create | Primary Entity: opportunity | Stage: PreOperation | Mode: Synchronous
    ///   2) Message: Update | Primary Entity: opportunity | Stage: PreOperation | Mode: Synchronous
    ///      Filtering Attributes: new_discountpercent, description
    ///      Pre-Image: alias "PreImage", attributes: new_discountpercent, description
    /// </summary>
    public class DiscountValidationPlugin : IPlugin
    {
        private const decimal Threshold = 15m;

        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            if (!(context.InputParameters["Target"] is Entity target) || target.LogicalName != "opportunity")
            {
                return;
            }

            // On Update, Target only holds the fields that changed. If the user
            // changed the discount but not the description, we read the old
            // description from the pre-image.
            Entity preImage = context.PreEntityImages.Contains("PreImage")
                ? context.PreEntityImages["PreImage"]
                : null;

            decimal discount = GetValue<decimal>(target, preImage, "new_discountpercent");
            string description = GetValue<string>(target, preImage, "description");

            tracing.Trace("Discount: {0}, has description: {1}", discount, !string.IsNullOrWhiteSpace(description));

            if (discount > Threshold && string.IsNullOrWhiteSpace(description))
            {
                throw new InvalidPluginExecutionException(
                    $"A discount of {discount}% exceeds {Threshold}% and requires a justification in the Description field.");
            }
        }

        private static T GetValue<T>(Entity target, Entity preImage, string attribute)
        {
            if (target.Contains(attribute))
            {
                return target.GetAttributeValue<T>(attribute);
            }

            if (preImage != null && preImage.Contains(attribute))
            {
                return preImage.GetAttributeValue<T>(attribute);
            }

            return default(T);
        }
    }
}
