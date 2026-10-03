// ============================================================================
// opportunity_form.js (v3)
//
// Web resource name: new_opportunity_form
// Attach to: "Lead qualification opportunity form"
//   OnLoad                              -> SalesAccelerator.Opportunity.onLoad
//   OnChange (Discount Percent)         -> SalesAccelerator.Opportunity.onFieldChange
//   OnChange (Description)              -> SalesAccelerator.Opportunity.onFieldChange
// Tick "Pass execution context as first parameter" on each handler.
// ============================================================================

var SalesAccelerator = SalesAccelerator || {};
SalesAccelerator.Opportunity = (function () {

    const DISCOUNT_JUSTIFICATION_THRESHOLD = 15;

    function onLoad(executionContext) {
        checkDiscountJustification(executionContext.getFormContext());
    }

    function onFieldChange(executionContext) {
        checkDiscountJustification(executionContext.getFormContext());
    }

    function checkDiscountJustification(formContext) {
        const discountAttr = formContext.getAttribute("new_discountpercent");
        const descAttr = formContext.getAttribute("description");
        const descControl = formContext.getControl("description");

        if (!discountAttr || !descAttr || !descControl) {
            return; // wrong form or field renamed: do nothing rather than throw
        }

        const discount = discountAttr.getValue() || 0;
        const description = (descAttr.getValue() || "").trim();

        // Only complain when the discount is high AND there is no justification.
        if (discount > DISCOUNT_JUSTIFICATION_THRESHOLD && description === "") {
            descControl.setNotification(
                "Discounts over " + DISCOUNT_JUSTIFICATION_THRESHOLD + "% require a justification note.",
                "discount-warning"
            );
        } else {
            descControl.clearNotification("discount-warning");
        }
    }

    return {
        onLoad: onLoad,
        onFieldChange: onFieldChange
    };
})();
