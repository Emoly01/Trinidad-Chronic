import { NextResponse } from "next/server";
import { mutateData, newId, uploadImage } from "@/lib/store";
import { asHue, str } from "@/lib/hue";
import { sanitizeRichText } from "@/lib/sanitize";
import { cleanImageUrl } from "@/lib/image";
import type { Pc, PcNpcLink } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = str(form.get("name"), "Unbenannter Charakter");
  const playbook = str(form.get("playbook"));
  const backstory = sanitizeRichText(str(form.get("backstory")));
  const hue = asHue(form.get("hue"));
  const id = newId("pc");

  let npcs: PcNpcLink[] = [];
  const npcsRaw = form.get("npcs");
  if (typeof npcsRaw === "string" && npcsRaw.trim()) {
    try {
      const parsed = JSON.parse(npcsRaw) as Array<{ name?: string; rel?: string }>;
      npcs = parsed
        .filter((r) => r && (r.name || "").trim())
        .map((r, i) => ({
          id: `${id}-npc-${i}`,
          name: (r.name || "").trim(),
          rel: (r.rel || "").trim(),
          avatarUrl: null,
        }));
    } catch {
      // ignore malformed npcs payload — pc is still created without links
    }
  }

  const portrait = form.get("portrait");
  const portraitLink = cleanImageUrl(form.get("portraitUrl"));
  let portraitUrl: string | null = null;
  if (portrait instanceof File && portrait.size > 0) {
    portraitUrl = await uploadImage(portrait, id);
  } else if (portraitLink) {
    portraitUrl = portraitLink;
  }

  const data = await mutateData((d) => {
    const pc: Pc = { id, name, playbook, hue, backstory, portraitUrl, npcs };
    d.pcs.unshift(pc);
  });
  return NextResponse.json(data);
}
