# 04: Web resources and command bar

## Upload

| File | Web resource name | Type |
|---|---|---|
| `web-resources/opportunity_form.js` | `new_opportunity_form` | JavaScript |
| `web-resources/lead_ribbon_button.js` | `new_lead_ribbon_button` | JavaScript |

Save and **Publish** after every change.

## Opportunity form (active form)

1. Form libraries: add `new_opportunity_form`.
2. Events:
   - Form **OnLoad** > `SalesAccelerator.Opportunity.onLoad`
   - **Discount Percent** OnChange > `SalesAccelerator.Opportunity.onFieldChange`
   - **Description** OnChange > `SalesAccelerator.Opportunity.onFieldChange`
3. Tick **Pass execution context as first parameter** on every handler.
4. Save and publish the form.

Behaviour: a field error appears on Description when the discount is over 15 and Description is empty, and clears as soon as a justification is entered. The guard `if (!discountAttr || !descAttr || !descControl) return;` means a wrong form or renamed field does nothing instead of throwing.

## Lead command bar

1. Lead form > Form libraries: add `new_lead_ribbon_button`.
2. Command designer, **Main form** command bar of Lead (not the grid): new command *Qualify Lead*, action **Run JavaScript**, library `new_lead_ribbon_button`, function `SalesAccelerator.Lead.qualify`, parameter **PrimaryControl**.
3. Save and publish. A button added to the grid/list bar will not appear on a record.
