import { newId } from "./store";
import type { Data, Hue, Npc } from "./types";

/**
 * Returns the NSC entry for `name`, creating a stub in the NSC tab if none
 * exists yet — so an NSC linked to a player character shows up there
 * automatically instead of having to be typed in twice. Matching is by name
 * (trimmed, case-insensitive), so linking a name that already exists reuses
 * that entry rather than duplicating it.
 */
export function findOrCreateNpc(
  d: Data,
  name: string,
  opts: { hue?: Hue; avatarUrl?: string | null } = {}
): Npc | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const key = trimmed.toLowerCase();
  const existing = d.npcs.find((n) => n.name.trim().toLowerCase() === key);
  if (existing) {
    // A photo added on the character card fills an empty NSC portrait too.
    if (!existing.portraitUrl && opts.avatarUrl) existing.portraitUrl = opts.avatarUrl;
    return existing;
  }

  const npc: Npc = {
    id: newId("npc"),
    name: trimmed,
    faction: "",
    hue: opts.hue ?? "teal",
    desc: "",
    status: "Unbekannt",
    portraitUrl: opts.avatarUrl ?? null,
  };
  d.npcs.unshift(npc);
  return npc;
}
