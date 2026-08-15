# Sonos Augmented Card

A Home Assistant Lovelace card for multi-room Sonos control: a compact player
(cover art, play/pause, master volume) plus a "Zones" popup for joining and
unjoining speakers with per-speaker volume, and a "Library" popup for Sonos
Favourites.

Frontend-only — no custom integration required. It drives the entities and
services already provided by Home Assistant's built-in **Sonos** integration.

## Install

### HACS (custom repository)
1. HACS → Frontend → ⋮ → Custom repositories → add this repo as type "Lovelace".
2. Install "Sonos Augmented Card", then add the resource if HACS doesn't do it automatically.

### Manual
1. Copy `sonos-augmented-card.js` to `<config>/www/sonos-augmented-card.js`.
2. Add it as a Lovelace resource:
   ```yaml
   resources:
     - url: /local/sonos-augmented-card.js
       type: module
   ```

## Configuration

Add the card via the dashboard UI's "Add Card" button and pick **Sonos Player**
to use the visual editor (pick speakers from a filtered `media_player` list,
set the volume step), or configure it directly in YAML:

```yaml
type: custom:sonos-player-card
entities:
  - media_player.kitchen
  - media_player.living_room
  - media_player.office
volume_step: 2
```

| Option        | Required | Description                                              |
|---------------|----------|------------------------------------------------------------|
| `entities`    | yes      | All Sonos zone `media_player` entities to manage.          |
| `volume_step` | no       | Volume +/- step in percent (default `2`).                  |

## Development

```bash
npm install
npm run build   # bundles src/ -> sonos-augmented-card.js
npm run watch   # rebuild on change
```
