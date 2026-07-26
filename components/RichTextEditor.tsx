"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Submitted as a hidden input with this name (for plain <form> FormData). */
  name?: string;
  initialHTML?: string;
  placeholder?: string;
  /** Called with the current HTML on every edit (for controlled forms). */
  onChange?: (html: string) => void;
};

function ToolButton({
  title,
  onRun,
  children,
}: {
  title: string;
  onRun: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="rte-btn"
      title={title}
      aria-label={title}
      // mousedown-preventDefault keeps the text selection while clicking a tool.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onRun}
    >
      {children}
    </button>
  );
}

// A small rich-text editor: bold / italic / underline, two heading levels and
// bullet + numbered lists. It edits a contentEditable region and mirrors the
// resulting HTML into a hidden input (and/or an onChange callback). The HTML is
// sanitized on the server before it is stored (see lib/sanitize.ts).
export default function RichTextEditor({ name, initialHTML = "", placeholder, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialHTML);

  // Seed the editable region once, on mount. We deliberately do NOT keep the
  // DOM in sync with `html` afterwards — writing innerHTML on every keystroke
  // would reset the caret to the start.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHTML;
    // Normalize Enter to produce <p> blocks rather than <div>s.
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      // Older engines: harmless if unsupported.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only seed
  }, []);

  function sync() {
    const v = ref.current?.innerHTML ?? "";
    setHtml(v);
    onChange?.(v);
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    sync();
  }

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <ToolButton title="Fett" onRun={() => exec("bold")}>
          <strong>B</strong>
        </ToolButton>
        <ToolButton title="Kursiv" onRun={() => exec("italic")}>
          <em>I</em>
        </ToolButton>
        <ToolButton title="Unterstrichen" onRun={() => exec("underline")}>
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolButton>
        <span className="rte-sep" />
        <ToolButton title="Überschrift" onRun={() => exec("formatBlock", "h2")}>
          H1
        </ToolButton>
        <ToolButton title="Zwischenüberschrift" onRun={() => exec("formatBlock", "h3")}>
          H2
        </ToolButton>
        <ToolButton title="Fließtext" onRun={() => exec("formatBlock", "p")}>
          ¶
        </ToolButton>
        <span className="rte-sep" />
        <ToolButton title="Aufzählung" onRun={() => exec("insertUnorderedList")}>
          •
        </ToolButton>
        <ToolButton title="Nummerierte Liste" onRun={() => exec("insertOrderedList")}>
          1.
        </ToolButton>
      </div>
      <div
        ref={ref}
        className="rte-area"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={sync}
        onBlur={sync}
      />
      {name && <input type="hidden" name={name} value={html} />}
    </div>
  );
}
