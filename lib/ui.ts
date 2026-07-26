import type { CSSProperties } from "react";
import type { Hue } from "./types";

export const HUE_HEX: Record<Hue, string> = {
  gold: "#ffb400",
  red: "#ff2b1c",
  teal: "#12e0b6",
  ink: "#f4ead6",
};

export const HUE_LABELS: { value: Hue; label: string }[] = [
  { value: "gold", label: "Steelpan-Gold" },
  { value: "red", label: "Scarlet Ibis" },
  { value: "teal", label: "Kolibri-Türkis" },
  { value: "ink", label: "Elfenbein" },
];

/** Sets the --hue custom property an element's CSS reads (session-card border, quote-card rule, etc). */
export function hueStyle(hue: Hue): CSSProperties {
  return { "--hue": HUE_HEX[hue] } as CSSProperties;
}

/** Sets both --hue and the translucent --hue-glow ring color used by NPC-link avatars. */
export function hueGlowStyle(hue: Hue): CSSProperties {
  return { "--hue": HUE_HEX[hue], "--hue-glow": HUE_HEX[hue] + "33" } as CSSProperties;
}
