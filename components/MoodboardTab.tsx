"use client";

import { useState } from "react";
import type { Data, MoodItem } from "@/lib/types";
import { deleteEntry, linkTargetForm, patchForm, postForm, uploadTargetForm } from "@/lib/client";
import ImageSlot from "./ImageSlot";
import Modal from "./Modal";
import PageHead from "./PageHead";
import EntryActions from "./EntryActions";

export default function MoodboardTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MoodItem | null>(null);

  async function remove(m: MoodItem) {
    if (!confirm(`Bild „${m.caption}" wirklich löschen?`)) return;
    onData(await deleteEntry("moods", m.id));
  }

  return (
    <section className="page-section">
      <PageHead title="Moodboard" cta="+ BILD" onCta={() => setOpen(true)} />

      <div className="mood-grid">
        {data.moods.map((m) => (
          <div className={`mood-tile${m.span ? " " + m.span : ""}`} key={m.id}>
            <EntryActions onEdit={() => setEditing(m)} onDelete={() => remove(m)} />
            <ImageSlot
              src={m.imageUrl}
              placeholder="Bild ablegen"
              onUpload={async (file) => {
                const form = uploadTargetForm(file, { type: "mood", id: m.id });
                onData(await postForm("/api/image", form));
              }}
              onUrl={async (url) => {
                const form = linkTargetForm(url, { type: "mood", id: m.id });
                onData(await postForm("/api/image", form));
              }}
            />
            <div className="mood-caption">{m.caption}</div>
          </div>
        ))}
        {data.moods.length === 0 && (
          <p className="empty-note">
            Noch keine Bilder gesammelt. Fang die Farben der Insel ein — zieh ein Foto herein oder füg einfach einen Link ein.
          </p>
        )}
      </div>

      {open && <AddMoodModal onClose={() => setOpen(false)} onData={onData} />}
      {editing && <EditMoodModal entry={editing} onClose={() => setEditing(null)} onData={onData} />}
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
          <label>Bild hochladen</label>
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" />
        </div>
        <div className="field">
          <label>… oder Bild-Link einfügen</label>
          <input type="url" name="imageUrl" placeholder="https://…" />
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

function EditMoodModal({
  entry,
  onClose,
  onData,
}: {
  entry: MoodItem;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title="Bild bearbeiten" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const data = await patchForm("/api/entry", new FormData(e.currentTarget));
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input type="hidden" name="type" value="moods" />
        <input type="hidden" name="id" value={entry.id} />
        <div className="field">
          <label>Bildunterschrift</label>
          <input type="text" name="caption" defaultValue={entry.caption} required />
        </div>
        <p className="field-hint">Das Bild selbst änderst du direkt über die Kachel.</p>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
