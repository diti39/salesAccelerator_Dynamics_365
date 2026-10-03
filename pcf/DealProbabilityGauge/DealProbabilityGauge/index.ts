import { IInputs, IOutputs } from "./generated/ManifestTypes";

/**
 * DealProbabilityGauge — a simple SVG radial gauge bound to a Whole Number
 * field (0-100). Demonstrates the PCF lifecycle (init/updateView/getOutputs/
 * destroy) plus reading a bound value and writing back a notifyOutputChanged
 * when the user drags the gauge (click-to-set for simplicity here).
 */
export class DealProbabilityGauge implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private notifyOutputChanged: () => void;
    private currentValue = 0;
    private svgEl: SVGSVGElement;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        this.currentValue = context.parameters.probabilityValue.raw ?? 0;
        this.render();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.currentValue = context.parameters.probabilityValue.raw ?? 0;
        this.render();
    }

    public getOutputs(): IOutputs {
        return { probabilityValue: this.currentValue };
    }

    public destroy(): void {
        this.container.innerHTML = "";
    }

    private render(): void {
        this.container.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "gauge-wrapper";

        const label = document.createElement("div");
        label.className = "gauge-label";
        label.textContent = `${this.currentValue}%`;

        const track = document.createElement("div");
        track.className = "gauge-track";

        const fill = document.createElement("div");
        fill.className = "gauge-fill";
        fill.style.width = `${Math.min(100, Math.max(0, this.currentValue))}%`;
        fill.style.backgroundColor = this.colorForValue(this.currentValue);

        track.appendChild(fill);
        track.addEventListener("click", (e: MouseEvent) => this.handleTrackClick(e, track));

        wrapper.appendChild(label);
        wrapper.appendChild(track);
        this.container.appendChild(wrapper);
    }

    private handleTrackClick(e: MouseEvent, track: HTMLDivElement): void {
        const rect = track.getBoundingClientRect();
        const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        this.currentValue = Math.min(100, Math.max(0, pct));
        this.render();
        this.notifyOutputChanged();
    }

    private colorForValue(value: number): string {
        if (value < 33) return "#d13438";   // red
        if (value < 66) return "#ffb900";   // amber
        return "#107c10";                    // green
    }
}
