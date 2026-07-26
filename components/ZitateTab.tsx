"use client";

import { useState } from "react";
import type { Data, Quote } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { deleteEntry, patchForm, postForm } from "@/lib/client";
import Modal from "./Modal";
import PageHead from "./PageHead";
import EntryActions from "./EntryActions";

export default function ZitateTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);

  async function remove(q: Quote) {
    if (!confirm(`Zitat von ${q.who} wirklich löschen?`)) return;
    onData(await deleteEntry("zitate", q.id));
  }

  return (
    <section className="page-section">
      <PageHead
        eyebrow="Kampagne · Iere"
        title="Zitate"
        sub="Was am Tisch gesagt wurde und zu gut war, um es zu vergessen."
        cta="+ ZITAT"
        onCta={() => setOpen(true)}
      />

      <div className="quotes-grid">
        {data.zitate.map((q) => (
          <figure className="quote-card" key={q.id} style={hueStyle(q.hue)}>
            <EntryActions onEdit={() => setEditing(q)} onDelete={() => remove(q)} />
            <div aria-hidden="true" className="quote-mark">
              „
            </div>
            <blockquote className="quote-text">{q.text}</blockquote>
            <figcaption className="quote-caption">
              <span className="quote-caption-line" />
              {q.who}
              <span className="quote-caption-dash">·</span>
              {q.session}
            </figcaption>
          </figure>
        ))}
        {data.zitate.length === 0 && <p className="empty-note">Noch keine Zitate gesammelt.</p>}
      </div>

      {open && <QuoteModal onClose={() => setOpen(false)} onData={onData} />}
      {editing && <QuoteModal entry={editing} onClose={() => setEditing(null)} onData={onData} />}
    </section>
  );
}

function QuoteModal({
  entry,
  onClose,
  onData,
}: {
  entry?: Quote;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title={entry ? "Zitat bearbeiten" : "Neues Zitat"} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const fd = new FormData(e.currentTarget);
            const data = entry ? await patchForm("/api/entry", fd) : await postForm("/api/quotes", fd);
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        {entry && <input type="hidden" name="type" value="zitate" />}
        {entry && <input type="hidden" name="id" value={entry.id} />}
        <div className="field">
          <label>Zitat</label>
          <textarea name="text" className="large" placeholder="Was wurde gesagt?" defaultValue={entry?.text} required />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Von</label>
            <input type="text" name="who" placeholder="Name" defaultValue={entry?.who} required />
          </div>
          <div className="field">
            <label>Sitzung</label>
            <input type="text" name="session" placeholder="z. B. Sitzung 06" defaultValue={entry?.session} />
          </div>
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
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Speichern…" : "Zitat speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
