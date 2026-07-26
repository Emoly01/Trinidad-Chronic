import { NextResponse } from "next/server";
import { mutateData, newId } from "@/lib/store";
import { asHue, str } from "@/lib/hue";
import { sanitizeRichText } from "@/lib/sanitize";
import type { Session } from "@/lib/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const date = str(form.get("date"), "Unbekanntes Datum");
  const place = str(form.get("place"), "Iere");
  const title = str(form.get("title"), "Neue Sitzung");
  const recap = sanitizeRichText(str(form.get("recap")));
  const tags = str(form.get("tags"))
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const hue = asHue(form.get("hue"));

  const data = await mutateData((d) => {
    const maxN = d.sessions.reduce((m, s) => Math.max(m, parseInt(s.n, 10) || 0), 0);
    const n = String(maxN + 1).padStart(2, "0");
    const session: Session = { id: newId("s"), n, date, place, hue, title, recap, tags };
    d.sessions.unshift(session);
  });
  return NextResponse.json(data);
}
