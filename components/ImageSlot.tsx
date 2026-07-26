"use client";

import { useRef, useState } from "react";

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif";

export default function ImageSlot({
  src,
  placeholder,
  onUpload,
  className,
}: {
  src: string | null;
  placeholder: string;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ingest(file: File | undefined | null) {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Bitte PNG, JPEG, WebP, AVIF oder GIF verwenden.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={`image-slot${dragOver ? " over" : ""}${uploading ? " loading" : ""}${className ? " " + className : ""}`}
      onClick={() => inputRef.current?.click()}
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
        ingest(e.dataTransfer.files?.[0]);
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
        </div>
      )}
      <div className="slot-ring" />
      {src && (
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
      )}
      <div className="slot-spinner" />
      {error && (
        <div style={{ position: "absolute", left: 6, right: 6, bottom: 6, fontSize: 11, color: "#ffb4ab", background: "rgba(0,0,0,.6)", padding: "4px 6px", borderRadius: 5 }}>
          {error}
        </div>
      )}
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
