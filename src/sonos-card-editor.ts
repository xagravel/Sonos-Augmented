import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import type { SonosCardConfig } from "./types";

const SCHEMA = [
  {
    name: "entities",
    selector: {
      entity: {
        domain: "media_player",
        multiple: true,
      },
    },
  },
  {
    name: "volume_step",
    selector: {
      number: {
        min: 1,
        max: 20,
        mode: "box",
      },
    },
  },
] as const;

@customElement("sonos-card-editor")
export class SonosCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: SonosCardConfig;

  public setConfig(config: SonosCardConfig): void {
    this._config = config;
  }

  private _computeLabel = (schema: { name: string }): string => {
    switch (schema.name) {
      case "entities":
        return "Sonos speakers";
      case "volume_step":
        return "Volume step (%)";
      default:
        return schema.name;
    }
  };

  private _valueChanged(ev: CustomEvent<{ value: SonosCardConfig }>): void {
    const config = ev.detail.value;
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config } }));
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sonos-card-editor": SonosCardEditor;
  }
}
