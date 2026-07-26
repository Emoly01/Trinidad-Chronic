import { NextResponse } from "next/server";
import { mutateData, newId, uploadImage } from "@/lib/store";
import { asHue, str } from "@/lib/hue";
import type { Npc } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = str(form.get("name"), "Unbenannter NSC");
  const faction = str(form.get("faction"));
  const desc = str(form.get("desc"));
  const status = str(form.get("status"), "Unbekannt");
  const hue = asHue(form.get("hue"));
  const id = newId("npc");

  const portrait = form.get("portrait");
  let portraitUrl: string | null = null;
  if (portrait instanceof File && portrait.size > 0) {
    portraitUrl = await uploadImage(portrait, id);
  }

  const data = await mutateData((d) => {
    const npc: Npc = { id, name, faction, hue, desc, status, portraitUrl };
    d.npcs.unshift(npc);
  });
  return NextResponse.json(data);
}
