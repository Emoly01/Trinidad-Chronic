import { NextResponse } from "next/server";
import { mutateData, newId } from "@/lib/store";
import { asHue, str } from "@/lib/hue";
import { sanitizeRichText } from "@/lib/sanitize";
import type { Snippet } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const cat = str(form.get("cat"), "Notiz");
  const title = str(form.get("title"), "Ohne Titel");
  const body = sanitizeRichText(str(form.get("body")));
  const hue = asHue(form.get("hue"));

  const data = await mutateData((d) => {
    const snippet: Snippet = { id: newId("sn"), cat, hue, title, body };
    d.snippets.unshift(snippet);
  });
  return NextResponse.json(data);
}
