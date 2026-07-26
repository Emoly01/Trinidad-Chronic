"use client";

import { useState } from "react";
import type { Data, Npc } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { deleteEntry, linkTargetForm, patchForm, postForm, uploadTargetForm } from "@/lib/client";
import ImageSlot from "./ImageSlot";
import Modal from "./Modal";
import PageHead from "./PageHead";
import EntryActions from "./EntryActions";
import RichTextEditor from "./RichTextEditor";

const STATUSES = ["Verbündet", "Neutral", "Feind", "Unbekannt"];

export default function NpcsTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Npc | null>(null);

  async function remove(n: Npc) {
    if (!confirm(`NSC „${n.name}" wirklich löschen?`)) return;
    onData(await deleteEntry("npcs", n.id));
  }

  return (
    <section className="page-section">
      <PageHead title="NSCs" cta="+ NSC" onCta={() => setOpen(true)} />

      <div className="cards-grid-3">
        {data.npcs.map((n) => (
          <article className="portrait-card" key={n.id}>
            <EntryActions onEdit={() => setEditing(n)} onDelete={() => remove(n)} />
            <div className="portrait-banner npc" style={hueStyle(n.hue)}>
              <ImageSlot
                src={n.portraitUrl}
                className="contain"
                placeholder="Portrait ablegen"
                onUpload={async (file) => {
                  const form = uploadTargetForm(file, { type: "npc", id: n.id });
                  onData(await postForm("/api/image", form));
                }}
                onUrl={async (url) => {
                  const form = linkTargetForm(url, { type: "npc", id: n.id });
                  onData(await postForm("/api/image", form));
                }}
              />
              <div className="portrait-overlay">
                <div className="portrait-eyebrow">{n.faction}</div>
                <div className="portrait-name">{n.name}</div>
              </div>
            </div>
            <div className="card-body">
              <div className="card-desc rich" dangerouslySetInnerHTML={{ __html: n.desc }} />
              <span className="status-chip" style={hueStyle(n.hue)}>
                {n.status}
              </span>
            </div>
          </article>
        ))}
        {data.npcs.length === 0 && (
          <p className="empty-note">
            Noch niemand aus dem Nebel getreten. Die Insel ist voller Gesichter — Verbündete, Jumbies und Gefahren. Trag das erste ein.
          </p>
        )}
      </div>

      {open && <NpcModal onClose={() => setOpen(false)} onData={onData} />}
      {editing && <NpcModal entry={editing} onClose={() => setEditing(null)} onData={onData} />}
    </section>
  );
}

function NpcModal({
  entry,
  onClose,
  onData,
}: {
  entry?: Npc;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title={entry ? "NSC bearbeiten" : "Neuer NSC"} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const fd = new FormData(e.currentTarget);
            const data = entry ? await patchForm("/api/entry", fd) : await postForm("/api/npcs", fd);
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        {entry && <input type="hidden" name="type" value="npcs" />}
        {entry && <input type="hidden" name="id" value={entry.id} />}
        <div className="field-row">
          <div className="field">
            <label>Name</label>
            <input type="text" name="name" placeholder="Name" defaultValue={entry?.name} required />
          </div>
          <div className="field">
            <label>Fraktion</label>
            <input type="text" name="faction" placeholder="z. B. Hüterin der Flüsse" defaultValue={entry?.faction} />
          </div>
        </div>
        <div className="field">
          <label>Beschreibung</label>
          <RichTextEditor name="desc" initialHTML={entry?.desc ?? ""} placeholder="Wer ist diese Person?" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Status</label>
            <select name="status" defaultValue={entry?.status ?? STATUSES[0]}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Akzentfarbe</label>
            <select name="hue" defaultValue={entry?.hue ?? "teal"}>
              {HUE_LABELS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!entry && (
          <>
            <div className="field">
              <label>Portrait hochladen (optional)</label>
              <input type="file" name="portrait" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" />
            </div>
            <div className="field">
              <label>… oder Bild-Link einfügen</label>
              <input type="url" name="portraitUrl" placeholder="https://…" />
            </div>
          </>
        )}
        {entry && (
          <p className="field-hint">Portrait änderst du direkt über das Bild auf der Karte.</p>
        )}
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Speichern…" : "NSC speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
