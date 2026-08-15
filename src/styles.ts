import { css } from "lit";

export const sharedStyles = css`
  :host {
    --sonos-active-bg: var(--primary-color);
    --sonos-active-fg: var(--text-primary-color, #fff);
  }

  ha-dialog {
    --mdc-dialog-min-width: min(90vw, 640px);
    --mdc-dialog-max-width: min(90vw, 640px);
  }

  .pill-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: rgba(127, 127, 127, 0.25);
    color: inherit;
    border: none;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
  }

  .pill-button:active {
    background: rgba(127, 127, 127, 0.4);
  }
`;
