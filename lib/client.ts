import type { Data } from "./types";

export async function postForm(url: string, form: FormData): Promise<Data> {
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(j.error || "Etwas ist schiefgelaufen.");
  }
  return res.json();
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
