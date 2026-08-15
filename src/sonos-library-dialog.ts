import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import { sharedStyles } from "./styles";

@customElement("sonos-library-dialog")
export class SonosLibraryDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public entityId?: string;

  public closeDialog() {
    this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  }

  private _selectFavorite(source: string) {
    if (!this.entityId) return;
    this.hass.callService("media_player", "select_source", {
      entity_id: this.entityId,
      source,
    });
    this.closeDialog();
  }

  protected render() {
    if (!this.hass) return nothing;

    const stateObj = this.entityId ? this.hass.states[this.entityId] : undefined;
    const favorites: string[] = stateObj?.attributes.source_list ?? [];

    return html`
      <ha-dialog open heading="Library" @closed=${this.closeDialog}>
        ${!this.entityId
          ? html`<div class="empty">No active speaker to play favourites on.</div>`
          : favorites.length === 0
          ? html`<div class="empty">No Sonos favourites found.</div>`
          : html`
              <mwc-list>
                ${favorites.map(
                  (source) => html`
                    <mwc-list-item @click=${() => this._selectFavorite(source)}>
                      ${source}
                    </mwc-list-item>
                  `
                )}
              </mwc-list>
            `}
      </ha-dialog>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .empty {
        padding: 16px 0;
        color: var(--secondary-text-color);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "sonos-library-dialog": SonosLibraryDialog;
  }
}
