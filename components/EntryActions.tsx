"use client";

// Edit / delete controls that sit in the top-right corner of an entry card.
export default function EntryActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="entry-actions">
      <button
        type="button"
        className="entry-action"
        title="Bearbeiten"
        aria-label="Bearbeiten"
        onClick={onEdit}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      </button>
      <button
        type="button"
        className="entry-action danger"
        title="Löschen"
        aria-label="Löschen"
        onClick={onDelete}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 6h18" />
          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
          <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  );
}
