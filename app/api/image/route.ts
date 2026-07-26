import { NextResponse } from "next/server";
import { mutateData, uploadImage } from "@/lib/store";

// Generic "drop a photo onto this slot" endpoint — used to fill or replace
// the hero image, an NPC portrait, a PC portrait, a PC's NPC-relation
// avatar, or a moodboard tile, anytime after creation (mirrors the
// prototype's image-slot: any slot, fillable at any time). Accepts either an
// uploaded file (`image`) or a pasted image link (`imageUrl`).
type Target =
  | { type: "hero" }
  | { type: "npc"; id: string }
  | { type: "pc"; id: string }
  | { type: "pcNpc"; pcId: string; linkId: string }
  | { type: "mood"; id: string };

/** Accepts an http(s) image link; returns it trimmed, or null if unusable. */
export function cleanImageUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("image");
  const linkUrl = cleanImageUrl(form.get("imageUrl"));
  const targetRaw = form.get("target");
  const hasFile = file instanceof File && file.size > 0;

  if (!hasFile && !linkUrl) {
    return NextResponse.json({ error: "Bild oder Bild-Link erforderlich." }, { status: 400 });
  }
  if (typeof targetRaw !== "string") {
    return NextResponse.json({ error: "target required" }, { status: 400 });
  }
  let target: Target;
  try {
    target = JSON.parse(targetRaw);
  } catch {
    return NextResponse.json({ error: "invalid target" }, { status: 400 });
  }

  const key =
    target.type === "hero"
      ? "hero"
      : target.type === "pcNpc"
        ? target.linkId
        : target.id;
  // A pasted link is stored as-is; an uploaded file goes to Blob/local storage.
  const url = hasFile ? await uploadImage(file, key) : (linkUrl as string);

  const data = await mutateData((d) => {
    switch (target.type) {
      case "hero":
        d.heroImageUrl = url;
        break;
      case "npc": {
        const n = d.npcs.find((x) => x.id === target.id);
        if (n) n.portraitUrl = url;
        break;
      }
      case "pc": {
        const p = d.pcs.find((x) => x.id === target.id);
        if (p) p.portraitUrl = url;
        break;
      }
      case "pcNpc": {
        const p = d.pcs.find((x) => x.id === target.pcId);
        const link = p?.npcs.find((x) => x.id === target.linkId);
        if (link) link.avatarUrl = url;
        break;
      }
      case "mood": {
        const m = d.moods.find((x) => x.id === target.id);
        if (m) m.imageUrl = url;
        break;
      }
    }
  });
  return NextResponse.json(data);
}
