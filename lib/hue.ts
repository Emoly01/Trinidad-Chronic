import type { Hue } from "./types";

const HUES: Hue[] = ["gold", "red", "teal", "ink"];

export function asHue(v: FormDataEntryValue | null): Hue {
  const s = typeof v === "string" ? v : "";
  return (HUES as string[]).includes(s) ? (s as Hue) : "gold";
}

export function str(v: FormDataEntryValue | null, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
