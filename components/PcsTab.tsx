"use client";

import { useState } from "react";
import type { Data, Pc } from "@/lib/types";
import { HUE_LABELS, hueGlowStyle, hueStyle } from "@/lib/ui";
import { deleteEntry, deletePcNpc, linkTargetForm, patchForm, postForm, uploadTargetForm } from "@/lib/client";
import ImageSlot from "./ImageSlot";
import Modal from "./Modal";
import PageHead from "./PageHead";
import EntryActions from "./EntryActions";
import RichTextEditor from "./RichTextEditor";

export default function PcsTab({ data, onData }: { data: Data; onData: (d: Data) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pc | null>(null);
  const [linkFor, setLinkFor] = useState<string | null>(null);

  async function remove(c: Pc) {
    if (!confirm(`Charakter „${c.name}" wirklich löschen?`)) return;
    onData(await deleteEntry("pcs", c.id));
  }

  async function removeLink(pcId: string, linkId: string, name: string) {
    if (!confirm(`Verknüpfung mit „${name}" entfernen?`)) return;
    onData(await deletePcNpc(pcId, linkId));
  }

  return (
    <section className="page-section">
      <PageHead title="Spielercharaktere" cta="+ CHARAKTER" onCta={() => setOpen(true)} />

      <div className="cards-grid-2">
        {data.pcs.map((c) => (
          <article className="portrait-card" key={c.id}>
            <EntryActions onEdit={() => setEditing(c)} onDelete={() => remove(c)} />
            <div className="portrait-banner tall" style={hueStyle(c.hue)}>
              <ImageSlot
                src={c.portraitUrl}
                placeholder="Portrait ablegen"
                onUpload={async (file) => {
                  const form = uploadTargetForm(file, { type: "pc", id: c.id });
                  onData(await postForm("/api/image", form));
                }}
                onUrl={async (url) => {
                  const form = linkTargetForm(url, { type: "pc", id: c.id });
                  onData(await postForm("/api/image", form));
                }}
              />
              <div className="portrait-overlay tall">
                <div className="portrait-eyebrow tall">{c.playbook}</div>
                <div className="portrait-name tall">{c.name}</div>
              </div>
            </div>
            <div className="card-body pc">
              <div>
                <div className="card-block-label">Hintergrund</div>
                <div className="card-backstory rich" dangerouslySetInnerHTML={{ __html: c.backstory }} />
              </div>
              <div className="npc-block">
                <div className="card-block-label">Wichtige NSCs</div>
                <div className="npc-link-list">
                  {c.npcs.map((rel) => (
                    <div className="npc-link-row" key={rel.id}>
                      <span className="npc-link-left">
                        <span className="npc-link-avatar" style={hueGlowStyle(c.hue)}>
                          <ImageSlot
                            src={rel.avatarUrl}
                            placeholder="Foto"
                            onUpload={async (file) => {
                              const form = uploadTargetForm(file, {
                                type: "pcNpc",
                                pcId: c.id,
                                linkId: rel.id,
                              });
                              onData(await postForm("/api/image", form));
                            }}
                            onUrl={async (url) => {
                              const form = linkTargetForm(url, {
                                type: "pcNpc",
                                pcId: c.id,
                                linkId: rel.id,
                              });
                              onData(await postForm("/api/image", form));
                            }}
                          />
                        </span>
                        <span className="npc-link-name">{rel.name}</span>
                      </span>
                      <span className="npc-link-right">
                        <span className="npc-link-rel">{rel.rel}</span>
                        <button
                          type="button"
                          className="npc-link-remove"
                          title="Verknüpfung entfernen"
                          aria-label="Verknüpfung entfernen"
                          onClick={() => removeLink(c.id, rel.id, rel.name)}
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
                <button type="button" className="npc-link-add" onClick={() => setLinkFor(c.id)}>
                  + NSC verknüpfen
                </button>
              </div>
            </div>
          </article>
        ))}
        {data.pcs.length === 0 && (
          <p className="empty-note">
            Noch keine Runde an Bord. Wer wagt sich als Erste:r hinaus auf Iere? Leg den ersten Charakter an und stich in See.
          </p>
        )}
      </div>

      {open && <PcModal onClose={() => setOpen(false)} onData={onData} />}
      {editing && <PcModal entry={editing} onClose={() => setEditing(null)} onData={onData} />}
      {linkFor && <AddPcNpcModal pcId={linkFor} onClose={() => setLinkFor(null)} onData={onData} />}
    </section>
  );
}

function PcModal({
  entry,
  onClose,
  onData,
}: {
  entry?: Pc;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(entry?.name ?? "");
  const [playbook, setPlaybook] = useState(entry?.playbook ?? "");
  const [backstory, setBackstory] = useState(entry?.backstory ?? "");
  const [hue, setHue] = useState<string>(entry?.hue ?? "gold");
  const [portrait, setPortrait] = useState<File | null>(null);
  const [portraitLink, setPortraitLink] = useState("");
  const [links, setLinks] = useState<{ name: string; rel: string }[]>([{ name: "", rel: "" }]);

  function updateLink(i: number, patch: Partial<{ name: string; rel: string }>) {
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <Modal title={entry ? "Charakter bearbeiten" : "Neuer Charakter"} onClose={onClose} wide>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const fd = new FormData();
            fd.set("name", name);
            fd.set("playbook", playbook);
            fd.set("backstory", backstory);
            fd.set("hue", hue);
            let data: Data;
            if (entry) {
              fd.set("type", "pcs");
              fd.set("id", entry.id);
              data = await patchForm("/api/entry", fd);
            } else {
              if (portrait) fd.set("portrait", portrait);
              else if (portraitLink.trim()) fd.set("portraitUrl", portraitLink.trim());
              fd.set("npcs", JSON.stringify(links.filter((l) => l.name.trim())));
              data = await postForm("/api/pcs", fd);
            }
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
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Playbook</label>
            <input type="text" value={playbook} onChange={(e) => setPlaybook(e.target.value)} placeholder="z. B. Der Barde" />
          </div>
        </div>
        <div className="field">
          <label>Hintergrund</label>
          <RichTextEditor
            initialHTML={entry?.backstory ?? ""}
            onChange={setBackstory}
            placeholder="Backstory — erzähl in Ruhe."
          />
        </div>
        <div className="field">
          <label>Akzentfarbe</label>
          <select value={hue} onChange={(e) => setHue(e.target.value)}>
            {HUE_LABELS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {!entry && (
          <>
            <div className="field">
              <label>Portrait hochladen (optional)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                onChange={(e) => setPortrait(e.target.files?.[0] || null)}
              />
            </div>
            <div className="field">
              <label>… oder Bild-Link einfügen</label>
              <input
                type="url"
                placeholder="https://…"
                value={portraitLink}
                onChange={(e) => setPortraitLink(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Wichtige NSCs (optional)</label>
            </div>
            {links.map((l, i) => (
              <div className="npc-link-fields" key={i}>
                <div className="field-row">
                  <input
                    type="text"
                    placeholder="NSC-Name"
                    value={l.name}
                    onChange={(e) => updateLink(i, { name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Beziehung"
                    value={l.rel}
                    onChange={(e) => updateLink(i, { rel: e.target.value })}
                  />
                </div>
                {links.length > 1 && (
                  <button type="button" className="remove-link-btn" onClick={() => setLinks((ls) => ls.filter((_, idx) => idx !== i))}>
                    Entfernen
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-link-btn" onClick={() => setLinks((ls) => [...ls, { name: "", rel: "" }])}>
              + Weiterer NSC
            </button>
          </>
        )}

        {entry && (
          <p className="field-hint">Portrait und NSC-Verknüpfungen bearbeitest du direkt auf der Karte.</p>
        )}

        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Speichern…" : "Charakter speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddPcNpcModal({
  pcId,
  onClose,
  onData,
}: {
  pcId: string;
  onClose: () => void;
  onData: (d: Data) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal title="NSC verknüpfen" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const data = await postForm(`/api/pcs/${pcId}/npcs`, new FormData(e.currentTarget));
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
            <label>NSC-Name</label>
            <input type="text" name="name" required />
          </div>
          <div className="field">
            <label>Beziehung</label>
            <input type="text" name="rel" placeholder="z. B. Alter Lehrer" />
          </div>
        </div>
        <div className="field">
          <label>Foto hochladen (optional)</label>
          <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" />
        </div>
        <div className="field">
          <label>… oder Bild-Link einfügen</label>
          <input type="url" name="avatarUrl" placeholder="https://…" />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn-pill-gold large" disabled={busy}>
            {busy ? "Speichern…" : "Verknüpfen"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
