import { NextResponse } from "next/server";
import { mutateData } from "@/lib/store";
import { asHue, str } from "@/lib/hue";
import type { Data } from "@/lib/types";

// One endpoint for editing and deleting any top-level entry, keyed by the
// collection it lives in. Images are still edited by clicking the image slot
// (see /api/image), so this only touches text/scalar fields.
type Coll = "sessions" | "zitate" | "snippets" | "npcs" | "pcs" | "moods";
const COLLS: Coll[] = ["sessions", "zitate", "snippets", "npcs", "pcs", "moods"];
const isColl = (v: string): v is Coll => (COLLS as string[]).includes(v);

/** Raw trimmed value that is allowed to be empty (for optional long-text fields). */
function raw(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function PATCH(request: Request) {
  const form = await request.formData();
  const type = str(form.get("type"));
  const id = str(form.get("id"));
  if (!isColl(type) || !id) {
    return NextResponse.json({ error: "type and id required" }, { status: 400 });
  }

  const data = await mutateData((d) => applyPatch(d, type, id, form));
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "";
  const id = url.searchParams.get("id") || "";
  if (!isColl(type) || !id) {
    return NextResponse.json({ error: "type and id required" }, { status: 400 });
  }

  const data = await mutateData((d) => {
    const arr = d[type] as Array<{ id: string }>;
    const idx = arr.findIndex((it) => it.id === id);
    if (idx >= 0) arr.splice(idx, 1);
  });
  return NextResponse.json(data);
}

function applyPatch(d: Data, type: Coll, id: string, form: FormData): void {
  switch (type) {
    case "sessions": {
      const s = d.sessions.find((x) => x.id === id);
      if (!s) return;
      s.date = str(form.get("date"), s.date);
      s.place = str(form.get("place"), s.place);
      s.title = str(form.get("title"), s.title);
      s.recap = raw(form, "recap");
      s.hue = asHue(form.get("hue"));
      s.tags = raw(form, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return;
    }
    case "zitate": {
      const q = d.zitate.find((x) => x.id === id);
      if (!q) return;
      q.text = str(form.get("text"), q.text);
      q.who = str(form.get("who"), q.who);
      q.session = raw(form, "session");
      q.hue = asHue(form.get("hue"));
      return;
    }
    case "snippets": {
      const sn = d.snippets.find((x) => x.id === id);
      if (!sn) return;
      sn.cat = str(form.get("cat"), sn.cat);
      sn.title = str(form.get("title"), sn.title);
      sn.body = raw(form, "body");
      sn.hue = asHue(form.get("hue"));
      return;
    }
    case "npcs": {
      const n = d.npcs.find((x) => x.id === id);
      if (!n) return;
      n.name = str(form.get("name"), n.name);
      n.faction = raw(form, "faction");
      n.desc = raw(form, "desc");
      n.status = str(form.get("status"), n.status);
      n.hue = asHue(form.get("hue"));
      return;
    }
    case "pcs": {
      const pc = d.pcs.find((x) => x.id === id);
      if (!pc) return;
      pc.name = str(form.get("name"), pc.name);
      pc.playbook = raw(form, "playbook");
      pc.backstory = raw(form, "backstory");
      pc.hue = asHue(form.get("hue"));
      return;
    }
    case "moods": {
      const m = d.moods.find((x) => x.id === id);
      if (!m) return;
      m.caption = str(form.get("caption"), m.caption);
      return;
    }
  }
}
