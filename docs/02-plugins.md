# 02: Plugins

Project: **.NET Framework 4.6.2 Class Library** (not a Console App, not .NET Core), signed with a strong-name key (`Project > Properties > Signing`). NuGet: `Microsoft.CrmSdk.CoreAssemblies`.

> The `.sln`/`.csproj` and the signing key are not included here. Create the project in Visual Studio, add the three `.cs` files, and keep the `.snk` file out of source control (see `.gitignore`).

## Registration (Plugin Registration Tool, Isolation Mode: Sandbox)

| Plugin class | Message | Primary entity | Stage | Mode | Extras |
|---|---|---|---|---|---|
| `DiscountValidationPlugin` | `Create` | `opportunity` | PreOperation | Synchronous | none. **No image** (a Create has no pre-image) |
| `DiscountValidationPlugin` | `Update` | `opportunity` | PreOperation | Synchronous | Filtering attributes: `new_discountpercent`, `description`. Pre-image named `PreImage` containing both columns |
| `LeadQualificationAction` | `new_QualifyLead` | `lead` | PostOperation | Synchronous | none |
| `HelloWorldPlugin` | `Create` | `lead` | PostOperation | Synchronous | Smoke test only; unregister after use |

Tips:
- *Message* and *Primary Entity* are **autocomplete** fields: type a few letters and click a suggestion.
- To publish a new build, right-click the assembly and choose **Update**. Keep every plugin ticked or the unticked ones are removed with their steps.

## Behaviour

**DiscountValidationPlugin.** Throws an `InvalidPluginExecutionException` if `new_discountpercent > 15` and Description is empty. On Update, values missing from `Target` are read from `PreImage`.

**LeadQualificationAction.** Score = company size (0-3) + budget (0-3) + engagement (count of completed activities regarding the lead, capped at 4), capped at 10. Writes `new_leadscore` and `new_qualified` to the Lead. If the score is 6 or more, creates an Opportunity (with `new_sourceleadscore` and `originatingleadid`). Always returns both output parameters.

## Debugging

Enable *Settings > Administration > System Settings > Customization > Enable logging to plug-in trace log = All*, then read **Plugin Trace Logs**: the *Message Block* shows your `tracing.Trace` lines and *Exception Details* shows the real error behind generic UI messages.
