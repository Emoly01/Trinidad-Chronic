"use client";

export type Tab = "diary" | "zitate" | "snippets" | "npcs" | "pcs" | "mood";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "diary",
    label: "DIARY",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
        <path d="M19 3v18" />
        <path d="M8 8h7" />
      </svg>
    ),
  },
  {
    id: "zitate",
    label: "ZITATE",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3l3-3V9a2 2 0 0 0-1-2z" />
        <path d="M20 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3l3-3V9a2 2 0 0 0-1-2z" />
      </svg>
    ),
  },
  {
    id: "snippets",
    label: "SNIPPETS",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4L8.5 15.5" />
        <path d="M20 20L8.5 8.5" />
      </svg>
    ),
  },
  {
    id: "npcs",
    label: "NPCS",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 11c0 4 2 6 4.5 6S11 15 11 12c0-2-1-4-4-4s-4 1-4 3z" />
        <path d="M13 12c0 3 1.5 5 3.5 5S21 15 21 11c0-2-1-3-4-3s-4 1-4 4z" />
      </svg>
    ),
  },
  {
    id: "pcs",
    label: "PLAYER CHARACTERS",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
      </svg>
    ),
  },
  {
    id: "mood",
    label: "MOODBOARD",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M4 18l5-5 4 4 3-3 4 4" />
      </svg>
    ),
  },
];

export default function Header({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <header className="site-header">
      <div className="header-top">
        <div className="brand">
          <div className="brand-badge">
            <svg viewBox="0 0 40 40" width="44" height="44" style={{ display: "block" }}>
              <defs>
                <clipPath id="rnd">
                  <circle cx="20" cy="20" r="19" />
                </clipPath>
              </defs>
              <circle cx="20" cy="20" r="19" fill="#e5342a" />
              <g clipPath="url(#rnd)">
                <path d="M4 30 L30 4" stroke="#fbf6ec" strokeWidth="10" />
                <path d="M4 30 L30 4" stroke="#12100e" strokeWidth="6" />
              </g>
              <circle cx="20" cy="20" r="13" fill="none" stroke="rgba(251,246,236,.35)" strokeWidth="1" />
              <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(251,246,236,.22)" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="brand-title">The Trinidad Diaries</div>
            <div className="brand-sub">
              Kampagnen-Chronik&ensp;<span style={{ color: "var(--gold)" }}>✦</span>&ensp;Gemeinsame Erinnerungen
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-ghost-pill">SL EINLOGGEN</button>
          <div className="user-tag">
            <span style={{ color: "var(--red)" }}>◆</span>&nbsp; MATTHIAS
          </div>
        </div>
      </div>

      <nav className="site-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-btn${tab === item.id ? " active" : ""}`}
            style={{ marginRight: item.id === "mood" ? 0 : 30 }}
            onClick={() => onTab(item.id)}
          >
            {item.icon}
            {item.label}
            {tab === item.id && <span className="nav-underline" />}
          </button>
        ))}
      </nav>
      <div className="header-gradient-bar" />
    </header>
  );
}
