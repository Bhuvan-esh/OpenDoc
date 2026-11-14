import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import ConceptTags from "./ConceptTags";
import ExecutionFlow from "./ExecutionFlow";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "lines", label: "Line by line" },
  { id: "concepts", label: "Concepts" },
  { id: "flow", label: "Flow & example" },
];

export default function ExplanationPanel({
  result,
  isLoading,
  error,
  selectedLine,
  isSpeaking,
  speechSupported,
  onRetry,
  onSelectLine,
  onSpeak,
  onStopSpeaking,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (result) setActiveTab("overview");
  }, [result]);

  const selectedLineExplanation = result?.lines.find(
    (line) => line.lineNumber === selectedLine
  );
  const fullExplanation = result
    ? `${result.overview} ${result.executionFlow.map((step) => `${step.title}. ${step.description}`).join(" ")}`
    : "";

  return (
    <section className="code-explanation-results-card" aria-labelledby="explanation-title">
      <header className="code-explanation-results-header">
        <div>
          <span className="code-explanation-eyebrow">LEARNING GUIDE</span>
          <h2 id="explanation-title">Code explanation</h2>
        </div>
        <span className="code-explanation-demo-badge">Local demo · Not AI</span>
      </header>

      <div className="code-explanation-demo-notice">
        <CircleHelp size={17} />
        <p>
          Explanations use local pattern checks only. Your code is not sent to an AI service.
        </p>
      </div>

      {result && (
        <div className="code-explanation-speech-actions">
          <button
            type="button"
            className="code-explanation-secondary-button"
            onClick={() => onSpeak(fullExplanation)}
            disabled={!speechSupported}
          >
            <Volume2 size={16} />
            Read explanation aloud
          </button>
          <button
            type="button"
            className="code-explanation-secondary-button"
            onClick={() => onSpeak(selectedLineExplanation.explanation)}
            disabled={!speechSupported || !selectedLineExplanation}
          >
            <Volume2 size={16} />
            Read selected explanation
          </button>
          <button
            type="button"
            className="code-explanation-quiet-button"
            onClick={onStopSpeaking}
            disabled={!isSpeaking}
          >
            <VolumeX size={15} />
            Stop
          </button>
        </div>
      )}

      {!speechSupported && (
        <p className="code-explanation-speech-note">
          Speech playback is not supported in this browser.
        </p>
      )}

      {error && (
        <div className="code-explanation-error" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Could not create an explanation</strong>
            <p>{error}</p>
            <button type="button" onClick={onRetry}>Try again</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="code-explanation-loading" role="status" aria-live="polite">
          <LoaderCircle className="code-explanation-spinner" size={23} />
          <strong>Reviewing the code…</strong>
          <span>Checking its visible structure locally.</span>
        </div>
      ) : result ? (
        <>
          <div className="code-explanation-result-meta">
            <span>{result.language}</span>
            <span>{result.level} level</span>
            <span>{result.scope === "selected" ? "Selected code" : "Entire code"}</span>
          </div>

          <nav
            className="code-explanation-tabs"
            role="tablist"
            aria-label="Explanation sections"
          >
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                role="tab"
                id={`code-explanation-tab-${tab.id}`}
                aria-controls="code-explanation-tabpanel"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div
            id="code-explanation-tabpanel"
            className="code-explanation-tab-panel"
            role="tabpanel"
            aria-labelledby={`code-explanation-tab-${activeTab}`}
          >
            {activeTab === "overview" && (
              <div className="code-explanation-section">
                <h3>Program overview</h3>
                <p className="code-explanation-overview">{result.overview}</p>

                <div className="code-explanation-output">
                  <h4>Expected output</h4>
                  <p>{result.expectedOutput}</p>
                </div>

                <div className="code-explanation-validation-note">
                  <CheckCircle2 size={16} />
                  <span>
                    Local checks are not a compiler. Run code in the Playground to verify syntax and actual output.
                  </span>
                </div>
                {result.warnings.length > 0 && (
                  <div className="code-explanation-warnings">
                    <h4>Possible issues to check</h4>
                    <ul>
                      {result.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "lines" && (
              <div className="code-explanation-section">
                <h3>Important lines</h3>
                <p className="code-explanation-muted">
                  Select a line to highlight it in the editor. Blank lines are omitted.
                </p>
                {result.lines.length ? (
                  <div className="code-explanation-line-list">
                    {result.lines.map((line) => (
                      <article
                        key={`${line.lineNumber}-${line.code}`}
                        className={`code-explanation-line ${selectedLine === line.lineNumber ? "selected" : ""}`}
                      >
                        <button
                          type="button"
                          className="code-explanation-line-source"
                          onClick={() => onSelectLine(line.lineNumber)}
                          aria-pressed={selectedLine === line.lineNumber}
                        >
                          <span>Line {line.lineNumber}</span>
                          <code>{line.code}</code>
                        </button>
                        <p>{line.explanation}</p>
                        <button
                          type="button"
                          className="code-explanation-line-speak"
                          onClick={() => onSpeak(`Line ${line.lineNumber}. ${line.explanation}`)}
                          disabled={!speechSupported}
                        >
                          <Volume2 size={14} />
                          Read this line
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="code-explanation-muted">No non-empty source lines were found.</p>
                )}
              </div>
            )}

            {activeTab === "concepts" && (
              <div className="code-explanation-section">
                <h3>Detected programming concepts</h3>
                <p className="code-explanation-muted">
                  These tags are based on simple text patterns, not a full language parser.
                </p>
                <ConceptTags concepts={result.concepts} onSelectLine={onSelectLine} />
                {result.concepts.map((concept) => (
                  <p className="code-explanation-concept-description" key={`${concept.id}-description`}>
                    <strong>{concept.label}:</strong> {concept.description}
                  </p>
                ))}
              </div>
            )}

            {activeTab === "flow" && (
              <div className="code-explanation-section">
                <h3>Execution flow</h3>
                <ExecutionFlow steps={result.executionFlow} onSelectLine={onSelectLine} />

                <div className="code-explanation-example">
                  <h3>{result.example.title}</h3>
                  <p>{result.example.analogy}</p>
                  <pre><code>{result.example.code}</code></pre>
                  <div>
                    <strong>Example result</strong>
                    <pre><code>{result.example.expectedOutput}</code></pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="code-explanation-empty">
          <CircleHelp size={27} />
          <strong>Your explanation will appear here</strong>
          <p>Enter code, choose a language and explanation level, then select an explain action.</p>
        </div>
      )}

      {isSpeaking && (
        <p className="code-explanation-speaking" role="status">
          <Volume2 size={15} />
          Reading explanation
        </p>
      )}
    </section>
  );
}
