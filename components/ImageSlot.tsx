"use client";

import { useRef, useState } from "react";

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif";

function firstUrl(text: string): string | null {
  const trimmed = text.trim();
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    // not a URL
  }
  return null;
}

export default function ImageSlot({
  src,
  placeholder,
  onUpload,
  onUrl,
  className,
}: {
  src: string | null;
  placeholder: string;
  onUpload: (file: File) => Promise<void>;
  /** Point the slot at a pasted/entered image link. */
  onUrl?: (url: string) => Promise<void>;
  className?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function flash(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  }

  async function ingest(file: File | undefined | null) {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      flash("Bitte PNG, JPEG, WebP, AVIF oder GIF verwenden.");
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  async function ingestUrl(raw: string) {
    if (!onUrl) return;
    const url = firstUrl(raw);
    if (!url) {
      flash("Das sieht nicht nach einem Bild-Link aus.");
      return;
    }
    setUploading(true);
    try {
      await onUrl(url);
    } finally {
      setUploading(false);
    }
  }

  function promptForLink(e: React.MouseEvent) {
    e.stopPropagation();
    const entered = window.prompt("Bild-Link einfügen (https://…):");
    if (entered) ingestUrl(entered);
  }

  return (
    <div
      className={`image-slot${dragOver ? " over" : ""}${uploading ? " loading" : ""}${className ? " " + className : ""}`}
      onClick={() => inputRef.current?.click()}
      onPaste={(e) => {
        const file = e.clipboardData.files?.[0];
        if (file) {
          e.preventDefault();
          ingest(file);
          return;
        }
        const text = e.clipboardData.getData("text");
        if (text && onUrl && firstUrl(text)) {
          e.preventDefault();
          ingestUrl(text);
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          ingest(file);
          return;
        }
        const text = e.dataTransfer.getData("text");
        if (text) ingestUrl(text);
      }}
    >
      {src && <img src={src} alt="" />}
      {!src && (
        <div className="slot-empty">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <div className="cap">{placeholder}</div>
          {onUrl && (
            <button type="button" className="slot-link-btn" onClick={promptForLink}>
              oder Link einfügen
            </button>
          )}
        </div>
      )}
      <div className="slot-ring" />
      {src && (
        <div className="slot-actions">
          <button
            type="button"
            className="slot-replace"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Ersetzen
          </button>
          {onUrl && (
            <button type="button" className="slot-replace" onClick={promptForLink}>
              Link
            </button>
          )}
        </div>
      )}
      <div className="slot-spinner" />
      {error && <div className="slot-error">{error}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          ingest(f);
        }}
      />
    </div>
  );
}
