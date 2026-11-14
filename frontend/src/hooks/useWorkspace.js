
import { useEffect, useState } from "react";

const STORAGE_KEY = "opendocs-workspace";

export default function useWorkspace() {
  const [documents, setDocuments] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(documents)
    );
  }, [documents]);

  const addDocument = (document) => {
    const newDocument = {
      id: crypto.randomUUID(),
      title: document.title,
      url: document.url,
      category: document.category || "General",
      notes: document.notes || "",
      bookmarked: false,
      createdAt: new Date().toISOString()
    };

    setDocuments((previous) => [
      newDocument,
      ...previous
    ]);
  };

  const deleteDocument = (id) => {
    setDocuments((previous) =>
      previous.filter((doc) => doc.id !== id)
    );
  };

  const toggleBookmark = (id) => {
    setDocuments((previous) =>
      previous.map((doc) =>
        doc.id === id
          ? { ...doc, bookmarked: !doc.bookmarked }
          : doc
      )
    );
  };

  const updateNotes = (id, notes) => {
    setDocuments((previous) =>
      previous.map((doc) =>
        doc.id === id ? { ...doc, notes } : doc
      )
    );
  };

  return {
    documents,
    addDocument,
    deleteDocument,
    toggleBookmark,
    updateNotes
  };
}
