
import {
  BookOpen,
  Bookmark,
  Trash2,
  ExternalLink,
  StickyNote
} from "lucide-react";

export default function DocumentCard({
  document,
  onDelete,
  onBookmark,
  onOpen,
  onNotes
}) {
  return (
    <div className="workspace-document-card">

      <div className="workspace-card-top">

        <div className="workspace-document-icon">
          <BookOpen size={21} />
        </div>

        <div className="workspace-card-actions">

          <button
            onClick={() => onBookmark(document.id)}
            title="Bookmark"
            className={document.bookmarked ? "bookmarked" : ""}
          >
            <Bookmark size={17} />
          </button>

          <button
            onClick={() => onDelete(document.id)}
            title="Delete"
          >
            <Trash2 size={17} />
          </button>

        </div>
      </div>

      <span className="workspace-category">
        {document.category}
      </span>

      <h3>{document.title}</h3>

      <p className="workspace-document-url">
        {document.url}
      </p>

      {document.notes && (
        <div className="workspace-note-preview">
          <StickyNote size={14} />
          <span>{document.notes}</span>
        </div>
      )}

      <div className="workspace-card-footer">

        <button onClick={() => onOpen(document)}>
          <ExternalLink size={15} />
          Open document
        </button>

        <button onClick={() => onNotes(document)}>
          <StickyNote size={15} />
          Notes
        </button>

      </div>

    </div>
  );
}
