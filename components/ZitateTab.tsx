"use client";

import { useState } from "react";
import type { Data } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { postForm } from "@/lib/client";
import Modal from "./Modal";
import PageHead from "./PageHead";

export default function ZitateTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);

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

      {open && <AddQuoteModal onClose={() => setOpen(false)} onData={onData} />}
    </section>
  );
}

function AddQuoteModal({ onClose, onData }: { onClose: () => void; onData: (d: Data) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title="Neues Zitat" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const data = await postForm("/api/quotes", new FormData(e.currentTarget));
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="field">
          <label>Zitat</label>
          <textarea name="text" placeholder="Was wurde gesagt?" required />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Von</label>
            <input type="text" name="who" placeholder="Name" required />
          </div>
          <div className="field">
            <label>Sitzung</label>
            <input type="text" name="session" placeholder="z. B. Sitzung 06" />
          </div>
        </div>
        <div className="field">
          <label>Akzentfarbe</label>
          <select name="hue" defaultValue="gold">
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
