"use client";

import { useState } from "react";
import type { Data } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { postForm } from "@/lib/client";
import Modal from "./Modal";
import PageHead from "./PageHead";

export default function SnippetsTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);

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
            <span className="snippet-tag">{sn.cat}</span>
            <h3 className="snippet-title">{sn.title}</h3>
            <p className="snippet-body">{sn.body}</p>
          </article>
        ))}
        {data.snippets.length === 0 && <p className="empty-note">Noch keine Snippets notiert.</p>}
      </div>

      {open && <AddSnippetModal onClose={() => setOpen(false)} onData={onData} />}
    </section>
  );
}

const CATS = ["Hausregel", "Ort", "Regel", "Fund", "Fraktion", "NSC-Notiz"];

function AddSnippetModal({ onClose, onData }: { onClose: () => void; onData: (d: Data) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title="Neuer Schnipsel" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const data = await postForm("/api/snippets", new FormData(e.currentTarget));
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="field-row">
          <div className="field">
            <label>Kategorie</label>
            <select name="cat" defaultValue={CATS[0]}>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
        </div>
        <div className="field">
          <label>Titel</label>
          <input type="text" name="title" placeholder="Titel" required />
        </div>
        <div className="field">
          <label>Text</label>
          <textarea name="body" placeholder="Details" />
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
