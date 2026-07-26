export type Hue = "gold" | "red" | "teal" | "ink";

export interface Session {
  id: string;
  n: string;
  date: string;
  place: string;
  hue: Hue;
  title: string;
  recap: string;
  tags: string[];
}

export interface PartyMember {
  id: string;
  name: string;
  role: string;
  hue: Hue;
  initial: string;
}

export interface Quote {
  id: string;
  text: string;
  who: string;
  session: string;
  hue: Hue;
}

export interface Snippet {
  id: string;
  cat: string;
  hue: Hue;
  title: string;
  body: string;
}

export interface Npc {
  id: string;
  name: string;
  faction: string;
  hue: Hue;
  desc: string;
  status: string;
  portraitUrl: string | null;
}

export interface PcNpcLink {
  id: string;
  name: string;
  rel: string;
  avatarUrl: string | null;
  /** The NSC entry this link points at, so it also shows up in the NSC tab. */
  npcId?: string;
}

export interface Pc {
  id: string;
  name: string;
  playbook: string;
  hue: Hue;
  backstory: string;
  portraitUrl: string | null;
  npcs: PcNpcLink[];
}

export interface MoodItem {
  id: string;
  caption: string;
  span: string;
  imageUrl: string | null;
}

export interface QuoteOfWeek {
  text: string;
  who: string;
}

export interface Data {
  heroImageUrl: string | null;
  sessions: Session[];
  party: PartyMember[];
  zitate: Quote[];
  snippets: Snippet[];
  npcs: Npc[];
  pcs: Pc[];
  moods: MoodItem[];
  quoteOfWeek: QuoteOfWeek;
}
