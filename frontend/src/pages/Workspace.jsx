
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  X
} from "lucide-react";

import useWorkspace from "../hooks/useWorkspace";
import DocumentCard from "../components/voice/DocumentCard";
import WorkspaceStats from "../components/workspace/WorkspaceStats";
import "../style/workspace.css";

export default function Workspace() {

  const {
    documents,
    addDocument,
    deleteDocument,
    toggleBookmark,
    updateNotes
  } = useWorkspace();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    category: "General",
    notes: ""
  });

  const filteredDocuments = useMemo(() => {

    return documents.filter((doc) => {

      const matchesSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.url.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "bookmarked" && doc.bookmarked) ||
        doc.category === filter;

      return matchesSearch && matchesFilter;

    });

  }, [documents, search, filter]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.url.trim()) {
      return;
    }

    try {
      const parsedUrl = new URL(form.url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        window.alert("Only HTTP and HTTPS URLs are supported.");
        return;
      }
    } catch {
      window.alert("Please enter a valid documentation URL.");
      return;
    }

    addDocument(form);

    setForm({
      title: "",
      url: "",
      category: "General",
      notes: ""
    });

    setShowForm(false);
  };

  const handleOpen = (document) => {
    window.open(document.url, "_blank", "noopener,noreferrer");
  };

  const handleNotes = (document) => {
    setSelectedDocument(document);
  };

  return (

    <div className="workspace-page">

      <div className="workspace-heading">

        <div>
          <span className="workspace-eyebrow">
            YOUR PERSONAL LIBRARY
          </span>

          <h1>Documentation Workspace</h1>

          <p>
            Organize your technical learning resources
            in one place.
          </p>
        </div>

        <button
          className="workspace-add-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add document
        </button>

      </div>

      <WorkspaceStats documents={documents} />

      <div className="workspace-search-row">

        <div className="workspace-search">
          <Search size={18} />

          <input
            placeholder="Search your documentation..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All documents</option>
          <option value="bookmarked">Bookmarked</option>
          {Array.from(new Set(documents.map(doc => doc.category))).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

      </div>

      {showForm && (

        <div className="workspace-modal-overlay">

          <form
            className="workspace-modal"
            onSubmit={handleSubmit}
          >

            <div className="workspace-modal-heading">
              <div>
                <h2>Add documentation</h2>
                <p>Save a technical resource to your library.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={19} />
              </button>
            </div>

            <label>Document title</label>

            <input
              required
              value={form.title}
              placeholder="React Documentation"
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />

            <label>Documentation URL</label>

            <input
              required
              type="url"
              value={form.url}
              placeholder="https://react.dev"
              onChange={(event) =>
                setForm({ ...form, url: event.target.value })
              }
            />

            <label>Category</label>

            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              <option>General</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Python</option>
              <option>AI and Machine Learning</option>
              <option>DevOps</option>
            </select>

            <label>Personal notes</label>

            <textarea
              rows="3"
              value={form.notes}
              placeholder="What do you want to remember?"
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
            />

            <button
              type="submit"
              className="workspace-add-button workspace-submit"
            >
              Save document
            </button>

          </form>

        </div>

      )}

      {selectedDocument && (

        <div className="workspace-modal-overlay">

          <div className="workspace-modal">

            <div className="workspace-modal-heading">
              <h2>Personal notes</h2>

              <button
                onClick={() => setSelectedDocument(null)}
              >
                <X size={19} />
              </button>
            </div>

            <p>{selectedDocument.title}</p>

            <textarea
              rows="7"
              value={selectedDocument.notes}
              onChange={(event) => {
                const notes = event.target.value;

                setSelectedDocument({
                  ...selectedDocument,
                  notes
                });

                updateNotes(selectedDocument.id, notes);
              }}
            />

            <button
              className="workspace-add-button workspace-submit"
              onClick={() => setSelectedDocument(null)}
            >
              Save notes
            </button>

          </div>

        </div>

      )}

      <div className="workspace-section-heading">
        <div>
          <h2>Your documents</h2>
          <p>{filteredDocuments.length} resources found</p>
        </div>
      </div>

      {filteredDocuments.length > 0 ? (

        <div className="workspace-document-grid">

          {filteredDocuments.map((document) => (

            <DocumentCard
              key={document.id}
              document={document}
              onDelete={deleteDocument}
              onBookmark={toggleBookmark}
              onOpen={handleOpen}
              onNotes={handleNotes}
            />

          ))}

        </div>

      ) : (

        <div className="workspace-empty">

          <FolderOpen size={38} />

          <h3>No documents found</h3>

          <p>
            Add a documentation URL to start building
            your personal library.
          </p>

          <button
            className="workspace-add-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} />
            Add your first document
          </button>

        </div>

      )}

    </div>

  );
}
