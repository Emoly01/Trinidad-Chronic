"use client";

import { useState } from "react";
import type { Data, Session } from "@/lib/types";
import { HUE_LABELS, hueStyle } from "@/lib/ui";
import { deleteEntry, patchForm, postForm, uploadTargetForm } from "@/lib/client";
import ImageSlot from "./ImageSlot";
import Modal from "./Modal";
import EntryActions from "./EntryActions";
import RichTextEditor from "./RichTextEditor";

export default function DiaryTab({
  data,
  onData,
}: {
  data: Data;
  onData: (d: Data) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);

  async function remove(s: Session) {
    if (!confirm(`Sitzung „${s.title}" wirklich löschen?`)) return;
    onData(await deleteEntry("sessions", s.id));
  }

  return (
    <div>
      <section className="hero-section">
        <div className="hero-orb">
          <div className="hero-orb-frame">
            <ImageSlot
              src={data.heroImageUrl}
              placeholder="Foto der Chaconia einfügen"
              onUpload={async (file) => {
                const form = uploadTargetForm(file, { type: "hero" });
                onData(await postForm("/api/image", form));
              }}
            />
          </div>
          <div className="hero-orb-shine" />
        </div>
        <h1 className="hero-title">Chronik</h1>
        <p className="hero-sub">
          Alles, was auf der Insel geschah — Sitzung für Sitzung, festgehalten bevor die Erinnerung im Nebel von{" "}
          <span style={{ color: "var(--ink)" }}>J&apos;ouvert</span> verschwindet.
        </p>
      </section>

      <div className="content-grid">
        <main>
          <div className="section-head">
            <div className="eyebrow">Sitzungen — Neueste zuerst</div>
            <button className="btn-pill-gold" onClick={() => setOpen(true)}>
              <span style={{ fontSize: 14, lineHeight: 0 }}>+</span> NEUE SITZUNG
            </button>
          </div>

          <div className="session-list">
            {data.sessions.map((s) => (
              <article className="session-card" key={s.id} style={hueStyle(s.hue)}>
                <EntryActions onEdit={() => setEditing(s)} onDelete={() => remove(s)} />
                <div className="session-num-col">
                  <div className="session-label">Sitzung</div>
                  <div className="session-num">{s.n}</div>
                  <div className="session-date">{s.date}</div>
                </div>
                <div>
                  <div className="session-place-row">
                    <span className="session-dot" />
                    <span className="session-place">{s.place}</span>
                  </div>
                  <h3 className="session-title">{s.title}</h3>
                  <div className="session-recap rich" dangerouslySetInnerHTML={{ __html: s.recap }} />
                  <div className="tag-row">
                    {s.tags.map((t, i) => (
                      <span className="tag-chip" key={i}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
            {data.sessions.length === 0 && <p className="empty-note">Noch keine Sitzungen festgehalten.</p>}
          </div>
        </main>

        <aside className="rail">
          <div className="rail-card">
            <div className="rail-heading">Die Runde</div>
            <div className="party-list">
              {data.party.map((p) => (
                <div className="party-row" key={p.id}>
                  <span className="party-avatar" style={hueStyle(p.hue)}>
                    {p.initial}
                  </span>
                  <div>
                    <div className="party-name">{p.name}</div>
                    <div className="party-role">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.quoteOfWeek.text && (
            <div className="rail-quote-card">
              <div className="rail-quote-heading">Zitat der Woche</div>
              <p className="rail-quote-text">„{data.quoteOfWeek.text}“</p>
              <div className="rail-quote-who">— {data.quoteOfWeek.who}</div>
            </div>
          )}
        </aside>
      </div>

      {open && <SessionModal onClose={() => setOpen(false)} onData={onData} />}
      {editing && <SessionModal entry={editing} onClose={() => setEditing(null)} onData={onData} />}
    </div>
  );
}

function SessionModal({
  entry,
  onClose,
  onData,
}: {
  entry?: Session;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title={entry ? "Sitzung bearbeiten" : "Neue Sitzung"} onClose={onClose} wide>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const fd = new FormData(e.currentTarget);
            const data = entry ? await patchForm("/api/entry", fd) : await postForm("/api/sessions", fd);
            onData(data);
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler");
          } finally {
            setBusy(false);
          }
        }}
      >
        {entry && <input type="hidden" name="type" value="sessions" />}
        {entry && <input type="hidden" name="id" value={entry.id} />}
        <div className="field-row">
          <div className="field">
            <label>Datum</label>
            <input type="text" name="date" placeholder="z. B. 28. Trockenmond" defaultValue={entry?.date} required />
          </div>
          <div className="field">
            <label>Ort</label>
            <input type="text" name="place" placeholder="z. B. La Brea" defaultValue={entry?.place} required />
          </div>
        </div>
        <div className="field">
          <label>Titel</label>
          <input type="text" name="title" placeholder="Titel der Sitzung" defaultValue={entry?.title} required />
        </div>
        <div className="field">
          <label>Rückblick</label>
          <RichTextEditor name="recap" initialHTML={entry?.recap ?? ""} placeholder="Was geschah? Erzähl die ganze Sitzung…" />
        </div>
        <div className="field">
          <label>Tags (kommagetrennt)</label>
          <input type="text" name="tags" placeholder="z. B. Dungeon, Neu: NSC" defaultValue={entry?.tags.join(", ")} />
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
            {busy ? "Speichern…" : "Sitzung speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
