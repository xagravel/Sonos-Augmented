import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import {
  friendlyName,
  getActiveGroupMembers,
  getCoordinator,
  isEntityActive,
} from "./sonos-state";
import { sharedStyles } from "./styles";

@customElement("sonos-zones-dialog")
export class SonosZonesDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public entities: string[] = [];
  @property({ attribute: false }) public volumeStep = 2;

  public closeDialog() {
    this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  }

  private _toggleZone(entityId: string) {
    const active = isEntityActive(this.hass, entityId, this.entities);

    if (active) {
      this.hass.callService("media_player", "unjoin", { entity_id: entityId });
      this.hass.callService("media_player", "media_stop", { entity_id: entityId });
      return;
    }

    const activeMembers = getActiveGroupMembers(this.hass, this.entities);
    if (!activeMembers.length) {
      // No group playing anywhere yet: this speaker becomes its own coordinator.
      return;
    }
    const coordinator = getCoordinator(this.hass, activeMembers[0]);
    this.hass.callService("media_player", "join", {
      entity_id: coordinator,
      group_members: [entityId],
    });
  }

  private _adjustVolume(entityId: string, delta: number, ev: Event) {
    ev.stopPropagation();
    const stateObj = this.hass.states[entityId];
    const current = stateObj?.attributes.volume_level ?? 0;
    const next = Math.min(1, Math.max(0, current + delta / 100));
    this.hass.callService("media_player", "volume_set", {
      entity_id: entityId,
      volume_level: Math.round(next * 100) / 100,
    });
  }

  protected render() {
    if (!this.hass) return nothing;

    return html`
      <ha-dialog open heading="Speakers" @closed=${this.closeDialog}>
        <div class="grid">
          ${this.entities.map((entityId) => this._renderZoneCard(entityId))}
        </div>
      </ha-dialog>
    `;
  }

  private _renderZoneCard(entityId: string) {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return nothing;

    const active = isEntityActive(this.hass, entityId, this.entities);
    const volumePct = Math.round((stateObj.attributes.volume_level ?? 0) * 100);

    return html`
      <div
        class="zone ${active ? "active" : ""}"
        @click=${() => this._toggleZone(entityId)}
      >
        <div class="name">${friendlyName(this.hass, entityId)}</div>
        ${active
          ? html`
              <div class="volume-row">
                <button
                  class="pill-button"
                  @click=${(ev: Event) => this._adjustVolume(entityId, -this.volumeStep, ev)}
                >
                  −
                </button>
                <span class="volume-value">${volumePct}%</span>
                <button
                  class="pill-button"
                  @click=${(ev: Event) => this._adjustVolume(entityId, this.volumeStep, ev)}
                >
                  +
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 8px 0;
      }

      .zone {
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 12px;
        cursor: pointer;
        min-height: 72px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      .zone.active {
        background: var(--sonos-active-bg);
        color: var(--sonos-active-fg);
        border-color: transparent;
      }

      .name {
        font-weight: 500;
      }

      .volume-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .volume-value {
        min-width: 2.5em;
        text-align: center;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "sonos-zones-dialog": SonosZonesDialog;
  }
}
