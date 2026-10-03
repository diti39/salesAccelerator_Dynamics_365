# Problems I hit and how I fixed them

A log of real issues from building this project, each with the symptom, the root cause, the fix and what I took away from it. Ordered by area.

- [Environment and apps](#environment-and-apps) (1-3)
- [Client-side JavaScript](#client-side-javascript) (4-6)
- [Plugins and tooling](#plugins-and-tooling) (7-11)
- [Custom action and Web API](#custom-action-and-web-api) (12-15)
- [PCF](#pcf) (16-17)
- [Power Automate](#power-automate) (18-19)

---

## Environment and apps

### 1. Lead/Opportunity tables missing; Sales app wouldn't install
- **Symptom:** *Use existing table* didn't list Lead or Opportunity; the Sales app install failed repeatedly; I installed "Sales Productivity" and still had no tables. I had also created a custom table named "Lead" by mistake.
- **Cause:** The first environment appeared to be a bare Dataverse environment without the Sales tables. Sales Productivity is an add-on to the core Sales app and doesn't provide them.
- **Fix:** Worked in the **Sales Trial** environment, which already had the Sales Hub app and the standard tables, and abandoned the custom table.
- **Takeaway:** Check which tables and apps an environment actually has before building on it. Add-on apps are not the core app.

### 2. Two environments, and the plugin was in the wrong one
- **Symptom:** The Plugin Registration Tool didn't offer `lead` as a primary entity (but offered `account`), and no plugin trace ever appeared for my test records.
- **Cause:** I had two environments: *Sales Trial* (`org…crm4`, EU) and another (`org…crm17`, CH). The tool's login only lists one **region** at a time, so it was connected to the wrong one and I registered the plugin there.
- **Fix:** Compared **Settings > Session details > Instance url** with the org the tool was connected to, then reconnected selecting the right region and org and re-registered the assembly.
- **Takeaway:** When something "should work" but never fires, first confirm you are looking at the same environment everywhere (browser, CLI, registration tool).

### 3. Form changes never appeared
- **Symptom:** Columns I added to a form didn't show on records; later, a new record looked different from the form I'd edited.
- **Cause:** Opportunity had two Main forms (*Information* switched **Off**, *Lead qualification opportunity form* **On**), and I had been testing in an app named after the trial rather than **Sales Hub**. A column added to the table is not automatically on any form.
- **Fix:** Edited the active form, checked Form Order, and tested only in Sales Hub.
- **Takeaway:** Check form status and which app you are testing in before debugging your own code.

---

## Client-side JavaScript

### 4. Script error on load: `attributes.get(...) is null`
- **Symptom:** *"One of the scripts for this record has caused an error"*, with Show Details reading `can't access property "addOnChange", formContext.data.entity.attributes.get(...) is null`.
- **Cause:** My script looked up a sales-stage attribute (first as `salesstage`, then as `salesstagecode`) that isn't a field control on the form. `attributes.get()` only returns columns present on the **current form**. The stage is driven by a business process flow bar, and the active form had none.
- **Fix:** Removed the stage-based show/hide entirely (it solved a problem this form didn't have) and added defensive null checks everywhere else.
- **Takeaway:** In form scripting, assume lookups can return null. For process stages use the `formContext.data.process` API, and only if the form really has a process.

### 5. Validation message blocked saving even after I fixed the data
- **Symptom:** With discount 35 and a justification typed in Description, the form still refused to save.
- **Cause:** An error notification on a field blocks the save until it is cleared. My script only cleared it when the discount dropped to 15 or below, and never looked at Description.
- **Fix:** Show the notification only when `discount > 15` **and** Description is empty; run the check on load and on change of **both** fields (renamed the handler to `onFieldChange`, which meant updating the event registrations).
- **Takeaway:** Validation conditions should mirror the real rule exactly, and every field the rule reads needs an event handler.

### 6. Business rule and script both active
- **Symptom:** I couldn't tell whether my JavaScript was working because the same message appeared anyway.
- **Cause:** The earlier declarative business rule was still active and enforcing the same thing. The two had different message wording, which gave it away.
- **Fix:** Deactivated the business rule to test the script alone, then kept a single mechanism per behaviour.
- **Takeaway:** When replacing a mechanism, switch the old one off before testing the new one.

---

## Plugins and tooling

### 7. `Program does not contain a static 'Main' method`
- **Cause:** The project was a Console Application.
- **Fix:** Set **Output type** to *Class Library* (and use the *Class Library (.NET Framework)* template, 4.6.2).

### 8. Plugin Registration Tool would not sign in or launch
- **Symptoms:** `get_user_name_failed` from the old NuGet-distributed tool (legacy ADAL sign-in); the newer tool from `pac tool prt` launched and closed instantly; `pac` was "not recognized".
- **Causes and fixes:**
  - The modern tool crashed on startup. Event Viewer (**.NET Runtime** entry) showed `System.IO.FileLoadException`; `Unblock-File` didn't help. The NuGet tool (9.1.0.200) did launch and connect on retry, so I used that.
  - `pac` wasn't found because the winget ID was wrong (`Microsoft.PowerAppsCLI`, not `…PowerPlatformCLI`), and I had pasted a trailing em dash into the command.
- **Takeaway:** Event Viewer's .NET Runtime entry gives the real exception behind "the app just closes". Have a second tool option.

### 9. *"Invalid PrimaryEntity Name"*, and a step on "any entity"
- **Symptom:** Typing `Create` or `lead` into the step dialog was rejected; my first step showed as *"Create of any Entity"*.
- **Cause:** Those fields are autocomplete boxes, not free text, and the tool had no matching metadata (wrong environment, see #2). A step with Primary Entity *none* fires on every table.
- **Fix:** Pick values from the suggestion list; keep the Primary Entity filled in; delete the "any entity" step.

### 10. *"Message Create does not support this image type"*
- **Cause:** I attached a pre-image to the **Create** step. There is no "before" state on Create.
- **Fix:** Pre-image only on the **Update** step.

### 11. Plugin trace log was empty
- **Cause:** Trace logging not set to *All* (so successful runs aren't logged), plus looking in the wrong environment (#2).
- **Fix:** Set it to All in System Settings and checked the trace log of the right org; searched using the full type name `SalesAccelerator.Plugins.<Class>`.

---

## Custom action and Web API

### 12. Action "worked" but returned score 0 and no Opportunity; no trace entry
- **Symptom:** The button showed *"scored 0/10, no Opportunity created"* and no plugin trace appeared.
- **Cause:** The step was registered on message **`QualifyLead`**, but the action's real message is **`new_QualifyLead`**. Nothing was listening, so the platform ran the empty action and returned default outputs: no error at all.
- **Fix:** Opened the step (*Update Existing Step*) to read its Message, unregistered it, and registered a new step choosing `new_QualifyLead` from the autocomplete.
- **Takeaway:** "Succeeds with empty output and no trace" means the code never ran, so check the registration.

### 13. *"The specified field does not exist"*
- **Cause:** The plugin wrote `new_qualified` (Lead) and `new_sourceleadscore` (Opportunity), which I had never created.
- **Fix:** Created both columns.

### 14. *"Invalid Argument"* (the real error was in the trace log)
- **Symptom:** The UI dialog only said *Invalid Argument*.
- **Cause:** The Plugin Trace Log's **Exception Details** said `Incorrect attribute value type System.Boolean`. I had created `new_qualified` as **Whole Number** instead of **Yes/No**, so the boolean the plugin wrote was the wrong type.
- **Fix:** Deleted and recreated the column as Yes/No (data types can't be changed in place).
- **Takeaway:** UI error messages are often generic. Read the trace log's Exception Details.

### 15. Dialog said "below threshold" although an Opportunity had been created
- **Cause:** The JavaScript read `result.NewOpportunityId.id`, but the Web API serializes the lookup as `{ "@odata.type": "...opportunity", "opportunityid": "..." }`, so the check failed.
- **Fix:** Logged the response in the browser console (F12), then read `opportunityid`.
- **Takeaway:** Inspect the actual payload instead of assuming its shape.

---

## PCF

### 16. Build failed on lint; editor errors in VS Code
- **Symptom:** `npm run build` failed with `pcf-1065 ESLint ... no-inferrable-types`. VS Code also showed "Cannot find namespace 'ComponentFramework'" and a `moduleResolution=node10` deprecation notice.
- **Fix:** `private currentValue = 0;` instead of `private currentValue: number = 0;`. The other two are editor-only: the namespace comes from `generated/ManifestTypes.d.ts`, created by the first build (restart the TS server), and the deprecation notice is a warning in the generated tsconfig.

### 17. `pac pcf push` crashed with `System.Xml.XmlException`
- **Cause:** The manifest I started from had a comment block **after** `</manifest>`. XML allows nothing after the root element.
- **Fix:** Deleted everything after the closing tag. The manifest in this repo is clean.

---

## Power Automate

### 18. Outlook connector would not connect
- **Symptom:** After signing in, the *Send an email* step still said *"Connection not found"*.
- **Likely cause:** The trial tenant had no Exchange mailbox for the connector to attach to (I did not verify licensing).
- **Fix:** Used a Dataverse-only action instead (see #19). In a licensed tenant I'd use Outlook or Teams.

### 19. Avoided an infinite loop; understood the trigger scope
- **Risk:** *Add a new row* on Opportunities from a flow triggered by new Opportunities over 50,000 would create records that re-trigger the flow endlessly.
- **Fix:** Used *Update a row* targeting the **triggering** record, with the trigger set to **Added** only.
- **Consequence I tested:** raising an existing Opportunity from under to over 50,000 does *not* fire the flow, which matches the trigger design. Handling it would need *Added or Modified* plus an old/new value comparison.
