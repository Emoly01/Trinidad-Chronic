import type { Data } from "./types";

async function send(url: string, method: string, body?: BodyInit): Promise<Data> {
  const res = await fetch(url, { method, body });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(j.error || "Etwas ist schiefgelaufen.");
  }
  return res.json();
}

export function postForm(url: string, form: FormData): Promise<Data> {
  return send(url, "POST", form);
}

export function patchForm(url: string, form: FormData): Promise<Data> {
  return send(url, "PATCH", form);
}

export type EntryCollection = "sessions" | "zitate" | "snippets" | "npcs" | "pcs" | "moods";

/** Deletes a top-level entry (session, quote, snippet, NSC, PC, moodboard tile). */
export function deleteEntry(type: EntryCollection, id: string): Promise<Data> {
  const q = new URLSearchParams({ type, id });
  return send(`/api/entry?${q}`, "DELETE");
}

/** Deletes a single NSC link from a player character. */
export function deletePcNpc(pcId: string, linkId: string): Promise<Data> {
  const q = new URLSearchParams({ linkId });
  return send(`/api/pcs/${pcId}/npcs?${q}`, "DELETE");
}

export function uploadTargetForm(
  file: File,
  target: Record<string, unknown>
): FormData {
  const fd = new FormData();
  fd.set("image", file);
  fd.set("target", JSON.stringify(target));
  return fd;
}

/** Same as uploadTargetForm, but points a slot at a pasted image link. */
export function linkTargetForm(
  url: string,
  target: Record<string, unknown>
): FormData {
  const fd = new FormData();
  fd.set("imageUrl", url);
  fd.set("target", JSON.stringify(target));
  return fd;
}
