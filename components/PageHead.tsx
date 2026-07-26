"use client";

export default function PageHead({
  title,
  cta,
  onCta,
}: {
  title: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
      </div>
      <button className="btn-pill-gold large" onClick={onCta}>
        {cta}
      </button>
    </div>
  );
}
