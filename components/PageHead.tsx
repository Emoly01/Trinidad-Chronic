"use client";

export default function PageHead({
  eyebrow,
  title,
  sub,
  cta,
  onCta,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="page-head">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{sub}</p>
      </div>
      <button className="btn-pill-gold large" onClick={onCta}>
        {cta}
      </button>
    </div>
  );
}
