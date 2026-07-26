"use client";

import { useState } from "react";
import type { Data } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { postForm, uploadTargetForm } from "@/lib/client";
import ImageSlot from "./ImageSlot";
import Modal from "./Modal";
import PageHead from "./PageHead";

const STATUSES = ["Verbündet", "Neutral", "Feind", "Unbekannt"];

export default function NpcsTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="page-section">
      <PageHead
        eyebrow="Kampagne · Iere"
        title="NSCs"
        sub="Die Gesichter der Insel — Verbündete, Rätsel und Gefahren."
        cta="+ NSC"
        onCta={() => setOpen(true)}
      />

      <div className="cards-grid-3">
        {data.npcs.map((n) => (
          <article className="portrait-card" key={n.id}>
            <div className="portrait-banner" style={hueStyle(n.hue)}>
              <ImageSlot
                src={n.portraitUrl}
                placeholder="Portrait ablegen"
                onUpload={async (file) => {
                  const form = uploadTargetForm(file, { type: "npc", id: n.id });
                  onData(await postForm("/api/image", form));
                }}
              />
              <div className="portrait-overlay">
                <div className="portrait-eyebrow">{n.faction}</div>
                <div className="portrait-name">{n.name}</div>
              </div>
            </div>
            <div className="card-body">
              <p className="card-desc">{n.desc}</p>
              <span className="status-chip" style={hueStyle(n.hue)}>
                {n.status}
              </span>
            </div>
          </article>
        ))}
        {data.npcs.length === 0 && <p className="empty-note">Noch keine NSCs eingetragen.</p>}
      </div>

      {open && <AddNpcModal onClose={() => setOpen(false)} onData={onData} />}
    </section>
  );
}

function AddNpcModal({ onClose, onData }: { onClose: () => void; onData: (d: Data) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title="Neuer NSC" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const data = await postForm("/api/npcs", new FormData(e.currentTarget));
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
            <label>Name</label>
            <input type="text" name="name" placeholder="Name" required />
          </div>
          <div className="field">
            <label>Fraktion</label>
            <input type="text" name="faction" placeholder="z. B. Hüterin der Flüsse" />
          </div>
        </div>
        <div className="field">
          <label>Beschreibung</label>
          <textarea name="desc" placeholder="Wer ist diese Person?" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Status</label>
            <select name="status" defaultValue={STATUSES[0]}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Akzentfarbe</label>
            <select name="hue" defaultValue="teal">
              {HUE_LABELS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Portrait (optional)</label>
          <input type="file" name="portrait" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" />
        </div>
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
