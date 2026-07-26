import { newId } from "./id";
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
  opts: { hue?: Hue; avatarUrl?: string | null; id?: string } = {}
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
    id: opts.id ?? newId("npc"),
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

/** Stable id for a backfilled NSC, so every run produces the same one. */
function autoNpcId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `npc-auto-${slug || "unbenannt"}`;
}

/**
 * Gives NSC entries to character links that predate the auto-linking above
 * (or whose NSC was deleted since). Runs on every read and is idempotent:
 * once every link resolves to an existing NSC it changes nothing. Ids are
 * derived from the name, so the read path and the write path agree on them.
 * Returns whether anything changed.
 */
export function backfillNpcLinks(d: Data): boolean {
  let changed = false;
  for (const pc of d.pcs) {
    for (const link of pc.npcs) {
      if (link.npcId && d.npcs.some((n) => n.id === link.npcId)) continue;

      const before = d.npcs.length;
      const npc = findOrCreateNpc(d, link.name, {
        hue: pc.hue,
        avatarUrl: link.avatarUrl,
        id: autoNpcId(link.name),
      });
      if (!npc) continue;

      if (d.npcs.length !== before) changed = true;
      if (link.npcId !== npc.id) {
        link.npcId = npc.id;
        changed = true;
      }
      if (!link.avatarUrl && npc.portraitUrl) {
        link.avatarUrl = npc.portraitUrl;
        changed = true;
      }
    }
  }
  return changed;
}
