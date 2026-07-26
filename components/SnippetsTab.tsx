"use client";

import { useState } from "react";
import type { Data, Snippet } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { deleteEntry, patchForm, postForm } from "@/lib/client";
import Modal from "./Modal";
import PageHead from "./PageHead";
import EntryActions from "./EntryActions";
import RichTextEditor from "./RichTextEditor";

export default function SnippetsTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);

  async function remove(sn: Snippet) {
    if (!confirm(`„${sn.title}" wirklich löschen?`)) return;
    onData(await deleteEntry("snippets", sn.id));
  }

  return (
    <section className="page-section">
      <PageHead
        eyebrow="Kampagne · Iere"
        title="Snippets"
        sub="Regeln, Orte und lose Notizen — griffbereit für die nächste Sitzung."
        cta="+ SCHNIPSEL"
        onCta={() => setOpen(true)}
      />

      <div className="snippets-grid">
        {data.snippets.map((sn) => (
          <article className="snippet-card" key={sn.id} style={hueStyle(sn.hue)}>
            <EntryActions onEdit={() => setEditing(sn)} onDelete={() => remove(sn)} />
            <span className="snippet-tag">{sn.cat}</span>
            <h3 className="snippet-title">{sn.title}</h3>
            <div className="snippet-body rich" dangerouslySetInnerHTML={{ __html: sn.body }} />
          </article>
        ))}
        {data.snippets.length === 0 && <p className="empty-note">Noch keine Snippets notiert.</p>}
      </div>

      {open && <SnippetModal onClose={() => setOpen(false)} onData={onData} />}
      {editing && <SnippetModal entry={editing} onClose={() => setEditing(null)} onData={onData} />}
    </section>
  );
}

const CATS = ["Hausregel", "Ort", "Regel", "Fund", "Fraktion", "NSC-Notiz"];

function SnippetModal({
  entry,
  onClose,
  onData,
}: {
  entry?: Snippet;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title={entry ? "Schnipsel bearbeiten" : "Neuer Schnipsel"} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const fd = new FormData(e.currentTarget);
            const data = entry ? await patchForm("/api/entry", fd) : await postForm("/api/snippets", fd);
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        {entry && <input type="hidden" name="type" value="snippets" />}
        {entry && <input type="hidden" name="id" value={entry.id} />}
        <div className="field-row">
          <div className="field">
            <label>Kategorie</label>
            <select name="cat" defaultValue={entry?.cat ?? CATS[0]}>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Akzentfarbe</label>
            <select name="hue" defaultValue={entry?.hue ?? "gold"}>
              {HUE_LABELS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Titel</label>
          <input type="text" name="title" placeholder="Titel" defaultValue={entry?.title} required />
        </div>
        <div className="field">
          <label>Text</label>
          <RichTextEditor name="body" initialHTML={entry?.body ?? ""} placeholder="Details" />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Speichern…" : "Schnipsel speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
