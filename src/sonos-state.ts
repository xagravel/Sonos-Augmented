import type { HomeAssistant } from "custom-card-helpers";

// A Sonos media_player's `group_members` attribute lists every entity_id
// currently synced together, with the group coordinator first.
export function getGroupMembers(hass: HomeAssistant, entityId: string): string[] {
  const stateObj = hass.states[entityId];
  const members = stateObj?.attributes.group_members;
  return Array.isArray(members) && members.length ? members : [entityId];
}

export function getCoordinator(hass: HomeAssistant, entityId: string): string {
  return getGroupMembers(hass, entityId)[0];
}

// Distinct groups among the configured entities, keyed by membership set.
function getDistinctGroups(hass: HomeAssistant, entityIds: string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const id of entityIds) {
    const members = getGroupMembers(hass, id);
    const key = [...members].sort().join(",");
    if (!groups.has(key)) groups.set(key, members);
  }
  return [...groups.values()];
}

// The group currently relevant to the main player: prefer a playing group,
// then a paused one, then the largest multi-speaker group, else none.
export function getActiveGroupMembers(hass: HomeAssistant, entityIds: string[]): string[] {
  const groups = getDistinctGroups(hass, entityIds);

  const playing = groups.find((members) =>
    members.some((id) => hass.states[id]?.state === "playing")
  );
  if (playing) return playing;

  const paused = groups.find((members) =>
    members.some((id) => hass.states[id]?.state === "paused")
  );
  if (paused) return paused;

  const grouped = groups
    .filter((members) => members.length > 1)
    .sort((a, b) => b.length - a.length)[0];
  if (grouped) return grouped;

  return [];
}

// entity_id of the coordinator for the currently active group, if any.
export function getActiveEntity(hass: HomeAssistant, entityIds: string[]): string | undefined {
  const members = getActiveGroupMembers(hass, entityIds);
  return members.length ? members[0] : undefined;
}

export function isEntityActive(hass: HomeAssistant, entityId: string, entityIds: string[]): boolean {
  return getActiveGroupMembers(hass, entityIds).includes(entityId);
}

export function friendlyName(hass: HomeAssistant, entityId: string): string {
  const stateObj = hass.states[entityId];
  return stateObj?.attributes.friendly_name ?? entityId;
}
