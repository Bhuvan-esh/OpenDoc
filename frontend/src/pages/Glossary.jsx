
import { useMemo, useState } from "react";
import { BookText, Search, Volume2 } from "lucide-react";
import { mockGlossary } from "../data/mockGlossary";

export default function Glossary() {
  const [search, setSearch] = useState("");

  const filteredTerms = useMemo(() => {
    const queryTerms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (!queryTerms.length) return mockGlossary;

    return mockGlossary.filter((item) => {
      const searchableText = [
        item.term,
        item.explanation,
        item.category,
        ...(item.keywords || []),
      ].join(" ").toLowerCase();

      return queryTerms.every((queryTerm) => searchableText.includes(queryTerm));
    });
  }, [search]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="glossary-page">
      <div className="page-title">
        <span className="eyebrow">TECHNICAL VOCABULARY</span>
        <h1>Technical Glossary</h1>
        <p>
          Understand common developer terminology
          through simple explanations.
        </p>
      </div>

      <div className="glossary-search">
        <Search size={19} />

        <input
          aria-label="Search technical terms, definitions, and keywords"
          placeholder="Search terms, definitions, or keywords..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="glossary-grid">
        {filteredTerms.map((item) => (
          <article
            className="glossary-card"
            key={item.term}
          >
            <div className="glossary-card-top">
              <div className="glossary-icon">
                <BookText size={20} />
              </div>

              <button
                className="icon-button"
                onClick={() => speak(
                  `${item.term}. ${item.explanation}`
                )}
                aria-label={`Read ${item.term} aloud`}
              >
                <Volume2 size={17} />
              </button>
            </div>

            <span className="category-label">
              {item.category}
            </span>

            <h3>{item.term}</h3>

            <p>{item.explanation}</p>
          </article>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="empty-state">
          No matching glossary terms found.
        </div>
      )}
    </div>
  );
}
