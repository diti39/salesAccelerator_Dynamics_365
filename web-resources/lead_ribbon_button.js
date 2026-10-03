// ============================================================================
// lead_ribbon_button.js
//
// Web resource name: new_lead_ribbon_button
// Wired to a command bar button on the Lead form, calling
// SalesAccelerator.Lead.qualify(primaryControl) where primaryControl is
// passed by the command bar's "PrimaryControl" parameter.
// ============================================================================

var SalesAccelerator = SalesAccelerator || {};
SalesAccelerator.Lead = (function () {

    function qualify(primaryControl) {
        const formContext = primaryControl;
        const leadId = formContext.data.entity.getId().replace(/[{}]/g, "");

        const request = {
            entity: { entityType: "lead", id: leadId },
            getMetadata: function () {
                return {
                    boundParameter: "entity",
                    parameterTypes: {
                        entity: { typeName: "mscrm.lead", structuralProperty: 5 }
                    },
                    operationType: 0, // Action
                    operationName: "new_QualifyLead"
                };
            }
        };

        Xrm.WebApi.online.execute(request).then(
            function (response) {
                if (!response.ok) return;
                response.json().then(function (result) {
                    const score = result.QualifiedScore;
                    const opp = result.NewOpportunityId; // EntityReference or null
                    const oppId = opp && opp.opportunityid;

                    if (oppId) {
                        Xrm.Navigation.openAlertDialog({
                            text: "Lead qualified with score " + score + "/10. An Opportunity has been created."
                        }).then(function () {
                            Xrm.Navigation.navigateTo(
                                { pageType: "entityrecord", entityName: "opportunity", entityId: oppId },
                                { target: 1 }
                            );
                        });
                    } else {
                        Xrm.Navigation.openAlertDialog({
                            text: "Lead scored " + score + "/10 — below the qualification threshold. No Opportunity created."
                        });
                    }
                });
            },
            function (error) {
                Xrm.Navigation.openErrorDialog({ message: error.message });
            }
        );
    }

    return { qualify: qualify };
})();
