import { NextResponse } from "next/server";
import { mutateData, uploadImage } from "@/lib/store";
import { str } from "@/lib/hue";
import { cleanImageUrl } from "@/lib/image";
import type { PcNpcLink } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pcId } = await params;
  const form = await request.formData();
  const name = str(form.get("name"));
  const rel = str(form.get("rel"));
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const linkId = `${pcId}-npc-${Date.now().toString(36)}`;
  const avatar = form.get("avatar");
  const avatarLink = cleanImageUrl(form.get("avatarUrl"));
  let avatarUrl: string | null = null;
  if (avatar instanceof File && avatar.size > 0) {
    avatarUrl = await uploadImage(avatar, linkId);
  } else if (avatarLink) {
    avatarUrl = avatarLink;
  }

  const data = await mutateData((d) => {
    const pc = d.pcs.find((p) => p.id === pcId);
    if (!pc) return;
    const link: PcNpcLink = { id: linkId, name, rel, avatarUrl };
    pc.npcs.push(link);
  });
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pcId } = await params;
  const linkId = new URL(request.url).searchParams.get("linkId") || "";
  if (!linkId) return NextResponse.json({ error: "linkId required" }, { status: 400 });

  const data = await mutateData((d) => {
    const pc = d.pcs.find((p) => p.id === pcId);
    if (!pc) return;
    const idx = pc.npcs.findIndex((l) => l.id === linkId);
    if (idx >= 0) pc.npcs.splice(idx, 1);
  });
  return NextResponse.json(data);
}
