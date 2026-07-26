import sanitizeHtml from "sanitize-html";

// Rich-text fields (session recaps, backstories, snippet bodies, NSC
// descriptions) are stored as HTML produced by the in-app editor. Anyone at the
// table can edit, and the page is public, so every value is run through this
// allowlist before it is stored — the stored HTML is then safe to render.
const MAX_LEN = 40000;

export function sanitizeRichText(dirty: string): string {
  if (!dirty) return "";
  const clean = sanitizeHtml(dirty.slice(0, MAX_LEN), {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a",
    ],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  }).trim();
  // Treat "empty" markup (e.g. a lone <p></p> or <br>) as no content.
  return sanitizeHtml(clean, { allowedTags: [], allowedAttributes: {} }).trim() ? clean : "";
}
