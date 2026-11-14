
import { useMemo, useState } from "react";
import { BookText, Search, Volume2 } from "lucide-react";

const glossary = [
  {
    term: "API",
    category: "Development",
    explanation:
      "A way for two software applications to communicate with each other.",
  },
  {
    term: "Framework",
    category: "Development",
    explanation:
      "A reusable structure that helps developers build applications.",
  },
  {
    term: "Repository",
    category: "Git",
    explanation:
      "A location where project files and their version history are stored.",
  },
  {
    term: "Dependency",
    category: "Development",
    explanation:
      "An external library or package required by a software project.",
  },
  {
    term: "Endpoint",
    category: "API",
    explanation:
      "A specific URL where an API receives requests.",
  },
  {
    term: "Deployment",
    category: "DevOps",
    explanation:
      "The process of making an application available for users.",
  },
];

export default function Glossary() {
  const [search, setSearch] = useState("");

  const filteredTerms = useMemo(() => {
    return glossary.filter((item) =>
      `${item.term} ${item.explanation} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
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
          placeholder="Search technical terms..."
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
