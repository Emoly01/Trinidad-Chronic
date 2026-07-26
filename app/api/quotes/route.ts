import { NextResponse } from "next/server";
import { mutateData, newId } from "@/lib/store";
import { asHue, str } from "@/lib/hue";
import type { Quote } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const text = str(form.get("text"));
  const who = str(form.get("who"), "Unbekannt");
  const session = str(form.get("session"));
  const hue = asHue(form.get("hue"));
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const data = await mutateData((d) => {
    const quote: Quote = { id: newId("q"), text, who, session, hue };
    d.zitate.unshift(quote);
  });
  return NextResponse.json(data);
}
