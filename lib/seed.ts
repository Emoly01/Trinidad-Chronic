import type { Data } from "./types";

// A blank chronicle. Every list starts empty so the table fills it with their
// own campaign — sessions, quotes, snippets, NPCs, PCs and moodboard are all
// added through the app. (The hero image is still seeded by lib/store.ts.)
export const SEED_DATA: Data = {
  heroImageUrl: null, // filled in by lib/store.ts on first read (public/seed/hero-chaconia.png)
  sessions: [],
  party: [],
  zitate: [],
  snippets: [],
  npcs: [],
  pcs: [],
  moods: [],
  quoteOfWeek: {
    text: "",
    who: "",
  },
};
