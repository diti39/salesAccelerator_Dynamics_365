# 05: PCF control: Deal Probability Gauge

A bar gauge bound to a Whole Number field (0-100). Colour changes at 33 and 66; clicking the bar sets the value.

## Project layout

`pac pcf init` creates a project folder (with `package.json`, `tsconfig.json`, a `.pcfproj`) and a control subfolder. This repo contains the control sources under `pcf/DealProbabilityGauge/DealProbabilityGauge/`. If you rebuild from scratch, scaffold first and then replace the generated manifest and `index.ts`:

```powershell
pac pcf init --namespace SalesAccelerator --name DealProbabilityGauge --template field
npm install
# copy ControlManifest.Input.xml, index.ts and css/ over the generated ones
npm run build
pac auth create --environment https://<your-org>.crm4.dynamics.com
pac pcf push --publisher-prefix new
```

## Bind it

Opportunity form designer > select **Deal Probability** > Components > add **DealProbabilityGauge**, bind `probabilityValue` > save and publish.

## Notes

- The manifest must be valid XML with nothing after `</manifest>`.
- The linter rejects `private x: number = 0;` (`no-inferrable-types`); write `private x = 0;`.
- VS Code may show "Cannot find namespace 'ComponentFramework'" until the first build generates `generated/ManifestTypes.d.ts`. Restart the TS server after building.
