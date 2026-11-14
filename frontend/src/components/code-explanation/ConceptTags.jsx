import { Sparkles } from "lucide-react";

export default function ConceptTags({ concepts, onSelectLine }) {
  if (!concepts.length) {
    return (
      <p className="code-explanation-muted">
        No common concepts were detected by the local pattern checks.
      </p>
    );
  }

  return (
    <div className="code-explanation-concepts">
      {concepts.map((concept) => (
        <button
          type="button"
          className="code-explanation-concept-tag"
          key={concept.id}
          title={`${concept.description} Select to jump to line ${concept.lineNumbers[0]}.`}
          onClick={() => onSelectLine(concept.lineNumbers[0])}
        >
          <Sparkles size={13} />
          {concept.label}
          <span>Line {concept.lineNumbers[0]}</span>
        </button>
      ))}
    </div>
  );
}
