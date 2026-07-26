import { NextResponse } from "next/server";
import { mutateData, newId, uploadImage } from "@/lib/store";
import { str } from "@/lib/hue";
import { cleanImageUrl } from "../image/route";
import type { MoodItem } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const caption = str(form.get("caption"), "Ohne Titel");
  const image = form.get("image");
  const linkUrl = cleanImageUrl(form.get("imageUrl"));
  const hasFile = image instanceof File && image.size > 0;
  if (!hasFile && !linkUrl) {
    return NextResponse.json({ error: "Bild oder Bild-Link erforderlich." }, { status: 400 });
  }
  const id = newId("mood");
  const imageUrl = hasFile ? await uploadImage(image, id) : (linkUrl as string);

  const data = await mutateData((d) => {
    const mood: MoodItem = { id, caption, span: "", imageUrl };
    d.moods.unshift(mood);
  });
  return NextResponse.json(data);
}
