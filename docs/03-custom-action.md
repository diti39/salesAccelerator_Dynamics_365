# 03: Custom action `new_QualifyLead`

## Definition (maker portal > Solutions > New > Automation > Action, or Process of category *Action*)

- Display name: **Qualify Lead**, unique name **`new_QualifyLead`**
- Table / entity: **Lead** (bound action)
- Output arguments:
  - `QualifiedScore`: Integer
  - `NewOpportunityId`: **EntityReference** (Opportunity)
- **No steps** inside the action. The logic comes from the plugin.
- Save and **Activate**.

## Implementation

Register `LeadQualificationAction` on message **`new_QualifyLead`** (see [02-plugins](02-plugins.md)). The message name includes the prefix. Registering it as `QualifyLead` produces no error, and the action silently returns empty defaults (score 0, null Opportunity).

## Calling it from the client

`web-resources/lead_ribbon_button.js` uses `Xrm.WebApi.online.execute` with a bound-action request (`operationType: 0`, `operationName: "new_QualifyLead"`). The EntityReference output arrives as:

```json
{ "@odata.type": "#Microsoft.Dynamics.CRM.opportunity", "opportunityid": "..." }
```

so read `result.NewOpportunityId.opportunityid`, not `.id`.
