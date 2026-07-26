import { NextResponse } from "next/server";
import { mutateData, newId, uploadImage } from "@/lib/store";
import { str } from "@/lib/hue";
import type { MoodItem } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const caption = str(form.get("caption"), "Ohne Titel");
  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "image required" }, { status: 400 });
  }
  const id = newId("mood");
  const imageUrl = await uploadImage(image, id);

  const data = await mutateData((d) => {
    const mood: MoodItem = { id, caption, span: "", imageUrl };
    d.moods.unshift(mood);
  });
  return NextResponse.json(data);
}
