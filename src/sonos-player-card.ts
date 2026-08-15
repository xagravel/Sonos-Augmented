import { LitElement, html, css, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import type { SonosCardConfig } from "./types";
import { friendlyName, getActiveEntity } from "./sonos-state";
import { sharedStyles } from "./styles";
import "./sonos-zones-dialog";
import "./sonos-library-dialog";

const CARD_TAG = "sonos-player-card";

@customElement(CARD_TAG)
export class SonosPlayerCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: SonosCardConfig;
  @state() private _showZones = false;
  @state() private _showLibrary = false;

  // No GUI editor yet — configure via YAML (`entities: [media_player....]`).
  public static getStubConfig(): Partial<SonosCardConfig> {
    return { entities: [] };
  }

  public setConfig(config: SonosCardConfig): void {
    if (!config.entities || !Array.isArray(config.entities) || !config.entities.length) {
      throw new Error("sonos-player-card: `entities` must be a non-empty list of media_player entity ids");
    }
    this._config = { volume_step: 2, ...config };
  }

  public getCardSize(): number {
    return 4;
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    return changed.has("_config") || changed.has("_showZones") || changed.has("_showLibrary") || changed.has("hass");
  }

  private get _activeEntityId(): string | undefined {
    if (!this.hass || !this._config) return undefined;
    return getActiveEntity(this.hass, this._config.entities);
  }

  private _togglePlay() {
    const entityId = this._activeEntityId;
    if (!entityId) return;
    this.hass.callService("media_player", "media_play_pause", { entity_id: entityId });
  }

  private _adjustVolume(delta: number) {
    const entityId = this._activeEntityId;
    if (!entityId) return;
    const stateObj = this.hass.states[entityId];
    const current = stateObj?.attributes.volume_level ?? 0;
    const next = Math.min(1, Math.max(0, current + delta / 100));
    this.hass.callService("media_player", "volume_set", {
      entity_id: entityId,
      volume_level: Math.round(next * 100) / 100,
    });
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;

    const entityId = this._activeEntityId;
    const stateObj = entityId ? this.hass.states[entityId] : undefined;
    const title = stateObj?.attributes.media_title ?? "Nothing playing";
    const artist = stateObj?.attributes.media_artist ?? (entityId ? friendlyName(this.hass, entityId) : "No active speaker");
    const artwork = stateObj?.attributes.entity_picture;
    const isPlaying = stateObj?.state === "playing";
    const volumePct = Math.round((stateObj?.attributes.volume_level ?? 0) * 100);

    return html`
      <ha-card>
        <div class="content">
          <div class="now-playing">
            <div class="art" style=${artwork ? `background-image:url(${artwork})` : ""}>
              ${artwork ? nothing : html`<ha-icon icon="mdi:speaker"></ha-icon>`}
            </div>
            <div class="meta">
              <div class="title">${title}</div>
              <div class="artist">${artist}</div>
            </div>
          </div>

          <div class="controls">
            <button class="pill-button" @click=${this._togglePlay} ?disabled=${!entityId}>
              <ha-icon icon=${isPlaying ? "mdi:pause" : "mdi:play"}></ha-icon>
            </button>

            <div class="volume-row">
              <button class="pill-button" @click=${() => this._adjustVolume(-this._config.volume_step!)} ?disabled=${!entityId}>
                −
              </button>
              <span class="volume-value">${entityId ? `${volumePct}%` : "--"}</span>
              <button class="pill-button" @click=${() => this._adjustVolume(this._config.volume_step!)} ?disabled=${!entityId}>
                +
              </button>
            </div>
          </div>

          <div class="actions">
            <mwc-button @click=${() => (this._showZones = true)}>Zones</mwc-button>
            <mwc-button @click=${() => (this._showLibrary = true)}>Library</mwc-button>
          </div>
        </div>
      </ha-card>

      ${this._showZones
        ? html`
            <sonos-zones-dialog
              .hass=${this.hass}
              .entities=${this._config.entities}
              .volumeStep=${this._config.volume_step}
              @closed=${() => (this._showZones = false)}
            ></sonos-zones-dialog>
          `
        : nothing}
      ${this._showLibrary
        ? html`
            <sonos-library-dialog
              .hass=${this.hass}
              .entityId=${entityId}
              @closed=${() => (this._showLibrary = false)}
            ></sonos-library-dialog>
          `
        : nothing}
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .now-playing {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .art {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        background-color: var(--secondary-background-color);
        background-size: cover;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .meta {
        min-width: 0;
      }

      .title {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .artist {
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .volume-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .volume-value {
        min-width: 3em;
        text-align: center;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .pill-button:disabled {
        opacity: 0.4;
        cursor: default;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    [CARD_TAG]: SonosPlayerCard;
  }
  interface Window {
    customCards: unknown[];
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TAG,
  name: "Sonos Player",
  description: "Multi-room Sonos player with zone grouping and favourites.",
  preview: true,
});
