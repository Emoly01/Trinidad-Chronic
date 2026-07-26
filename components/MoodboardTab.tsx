"use client";

import { useState } from "react";
import type { Data } from "@/lib/types";
import { postForm, uploadTargetForm } from "@/lib/client";
import ImageSlot from "./ImageSlot";
import Modal from "./Modal";
import PageHead from "./PageHead";

export default function MoodboardTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="page-section">
      <PageHead
        eyebrow="Kampagne · Iere"
        title="Moodboard"
        sub="Farben, Bilder und Stimmungen der Kampagne."
        cta="+ BILD"
        onCta={() => setOpen(true)}
      />

      <div className="mood-grid">
        {data.moods.map((m) => (
          <div className={`mood-tile${m.span ? " " + m.span : ""}`} key={m.id}>
            <ImageSlot
              src={m.imageUrl}
              placeholder="Bild ablegen"
              onUpload={async (file) => {
                const form = uploadTargetForm(file, { type: "mood", id: m.id });
                onData(await postForm("/api/image", form));
              }}
            />
            <div className="mood-caption">{m.caption}</div>
          </div>
        ))}
        {data.moods.length === 0 && <p className="empty-note">Noch keine Bilder gesammelt.</p>}
      </div>

      {open && <AddMoodModal onClose={() => setOpen(false)} onData={onData} />}
    </section>
  );
}

function AddMoodModal({ onClose, onData }: { onClose: () => void; onData: (d: Data) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title="Neues Bild" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const data = await postForm("/api/moodboard", new FormData(e.currentTarget));
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
          <label>Bildunterschrift</label>
          <input type="text" name="caption" placeholder="z. B. J’ouvert · Morgengrauen" required />
        </div>
        <div className="field">
          <label>Bild</label>
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" required />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Hochladen…" : "Bild speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
