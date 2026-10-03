# 06: Power Automate flow: High Value Opportunity Alert

Cloud flow, built in the designer.

## Trigger: Microsoft Dataverse, *When a row is added, modified or deleted*

| Setting | Value |
|---|---|
| Change type | **Added** |
| Table name | Opportunities |
| Scope | Organization |
| Filter rows | `estimatedvalue gt 50000` |

The filter runs at the trigger, so the flow doesn't start at all for small deals.

## Action: Dataverse, *Update a row*

| Setting | Value |
|---|---|
| Table name | Opportunities |
| Row ID | the triggering Opportunity's ID (dynamic content from the trigger) |
| Customer Need | `ALERT: High-value opportunity flagged by automated flow.` |

## Why this shape

- **Update the triggering row, don't "Add a new row".** Creating an Opportunity over 50,000 from a flow that triggers on new Opportunities over 50,000 loops forever.
- **No email/Teams step.** The Office 365 Outlook connection would not establish in the trial tenant (no mailbox), so a Dataverse-only action was used. In a licensed tenant, swap in *Send an email (V2)* or a Teams post.
- **Limitation:** only fires on creation. A record edited from below to above 50,000 is not flagged.

## Testing

Create an Opportunity with Est. Revenue over 50,000 and wait 10-30 seconds; Customer Need is filled in. Check *Run history* in Power Automate if it isn't.
