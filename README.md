# Sales Accelerator: Dynamics 365 Sales & Power Platform

A hands-on Dynamics 365 Sales / Power Platform project covering lead qualification and discount governance. It was built end to end in a trial environment and uses Dataverse customization, C# plugins, a custom action, JavaScript web resources, a TypeScript PCF control and a Power Automate flow.

> **Status:** personal learning project, built and tested in a Dynamics 365 Sales trial environment. It is not client work and it is not production-hardened (see [Limitations](#limitations-and-next-steps)).

## What it does

1. **Qualify Lead button.** A command-bar button on the Lead form calls a custom action through the Web API. A C# plugin scores the lead (company size + budget + engagement) and, at a score of 6 or more, creates an Opportunity and opens it.
   ![QualifyLead](screenshots/qualifylead.png)
   ![QualifyLead](screenshots/qualifylead_dialog.png)

2. **Discount governance.** Discounts over 15% need a justification in the Description. JavaScript gives instant feedback on the form, and a server-side plugin enforces the same rule for any save, including API calls and imports.
   ![DiscountRule](screenshots/discountrule.png)

3. **Deal probability gauge.** A custom PCF control (TypeScript) replaces the plain number box for _Deal Probability_ with a clickable red/amber/green bar.
   ![DealGauge](screenshots/dealprobability_gauge.png)

4. **High-value deal flag.** A Power Automate flow fires when an Opportunity over 50,000 is created and writes an alert back onto the record.

![QualifyLead](screenshots/plugintrace.png)
![QualifyLead](screenshots/flowrun.png)

## Where each skill shows up

| Skill                                                                                | Where                                                                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Tables, columns, forms, business rules                                               | [docs/01-data-model.md](docs/01-data-model.md)                                         |
| C# plugins: Pre/PostOperation, pre-images, Sandbox, tracing                          | [plugins/](plugins/SalesAccelerator.Plugins), [docs/02-plugins.md](docs/02-plugins.md) |
| Custom action (definition + plugin implementation)                                   | [docs/03-custom-action.md](docs/03-custom-action.md)                                   |
| JavaScript web resources, form events, Web API from the client                       | [web-resources/](web-resources), [docs/04-web-resources.md](docs/04-web-resources.md)  |
| PCF control in TypeScript                                                            | [pcf/](pcf/DealProbabilityGauge), [docs/05-pcf-control.md](docs/05-pcf-control.md)     |
| Power Automate (Dataverse trigger, filter rows)                                      | [docs/06-power-automate-flow.md](docs/06-power-automate-flow.md)                       |
| Debugging: plugin trace log, Plugin Registration Tool, Event Viewer, browser console | [docs/PROBLEMS-AND-FIXES.md](docs/PROBLEMS-AND-FIXES.md)                               |

## Repository layout

````
.
├── docs/                         # setup notes + PROBLEMS-AND-FIXES.md
├── plugins/SalesAccelerator.Plugins/
│   ├── DiscountValidationPlugin.cs   # Opportunity Create/Update (PreOperation)
│   ├── LeadQualificationAction.cs    # new_QualifyLead custom action logic
│   └── HelloWorldPlugin.cs           # smoke test used to validate the registration pipeline
├── web-resources/
│   ├── opportunity_form.js           # discount justification warning
│   └── lead_ribbon_button.js         # calls the custom action
└── pcf/DealProbabilityGauge/         # PCF project (TypeScript)
```                                                                                           | -->

## Limitations and next steps

- Not exported as a solution file yet, and there is no ALM pipeline. Everything lives in one trial environment.
- No automated tests. Plugin logic could be covered with a mocking framework such as FakeXrmEasy.
- The qualify action isn't idempotent: running it twice on a qualifying lead creates two Opportunities.
- Scoring weights and the threshold (6) are hard-coded.
- The flow only handles _new_ Opportunities. Catching an existing one that crosses 50,000 on update would need "Added or Modified" plus old/new value comparison. It writes an alert to the record rather than sending email or a Teams message, because the trial tenant had no mailbox for the Outlook connector.
- The original declarative business rule ("Discount Justification Required") was deactivated once the JavaScript and plugin versions existed, so only one mechanism enforces each behaviour.
- Not covered: SharePoint, Business Central or Azure integrations, and the Customer Service, Field Service and Marketing modules.
````
