import { useEffect, useRef, useState } from "react";
import { Code2, Lightbulb, Sparkles } from "lucide-react";
import {
  EXPLANATION_LEVELS,
  SUPPORTED_CODE_LANGUAGES,
} from "../../services/codeExplanationService";

const MAX_CODE_LENGTH = 1_000_000;

export default function CodeEditorPanel({
  code,
  language,
  level,
  selection,
  highlightLine,
  onCodeChange,
  onLanguageChange,
  onLevelChange,
  onSelectionChange,
  onExplainAll,
  onExplainSelected,
  isLoading,
}) {
  const editorRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState("");

  const reportSelection = (editor) => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedCode = editor.value.slice(start, end);
    const startLine = editor.value.slice(0, start).split("\n").length - 1;

    onSelectionChange({ code: selectedCode, startLine });
  };

  useEffect(() => {
    if (!highlightLine || !editorRef.current) return;

    const editor = editorRef.current;
    const lineStart = editor.value
      .split("\n")
      .slice(0, highlightLine - 1)
      .join("\n").length + (highlightLine > 1 ? 1 : 0);
    const nextLineBreak = editor.value.indexOf("\n", lineStart);
    const lineEnd = nextLineBreak === -1 ? editor.value.length : nextLineBreak;
    const lineHeight = Number.parseFloat(window.getComputedStyle(editor).lineHeight) || 22;

    editor.focus();
    editor.setSelectionRange(lineStart, lineEnd);
    editor.scrollTop = Math.max(0, (highlightLine - 1) * lineHeight - editor.clientHeight / 3);
  }, [highlightLine]);

  const explainSelection = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    reportSelection(editor);
    onExplainSelected({
      code: editor.value.slice(editor.selectionStart, editor.selectionEnd),
      startLine: editor.value.slice(0, editor.selectionStart).split("\n").length - 1,
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Clipboard access is unavailable.");
    }

    window.setTimeout(() => setCopyStatus(""), 1800);
  };

  return (
    <section className="code-explanation-editor-card" aria-labelledby="code-editor-title">
      <div className="code-explanation-card-heading">
        <div>
          <span className="code-explanation-eyebrow">
            <Code2 size={15} />
            SOURCE CODE
          </span>
          <h2 id="code-editor-title">Code editor</h2>
        </div>
        <button
          type="button"
          className="code-explanation-quiet-button"
          onClick={copyCode}
          disabled={!code}
        >
          Copy
        </button>
      </div>

      <div className="code-explanation-controls">
        <label>
          <span>Language</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            {SUPPORTED_CODE_LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Explanation level</span>
          <select
            value={level}
            onChange={(event) => onLevelChange(event.target.value)}
          >
            {EXPLANATION_LEVELS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <textarea
        ref={editorRef}
        className="code-explanation-textarea"
        value={code}
        maxLength={MAX_CODE_LENGTH}
        onChange={(event) => {
          onCodeChange(event.target.value);
          reportSelection(event.currentTarget);
        }}
        onSelect={(event) => reportSelection(event.currentTarget)}
        onKeyUp={(event) => reportSelection(event.currentTarget)}
        onMouseUp={(event) => reportSelection(event.currentTarget)}
        spellCheck={false}
        aria-label={`${SUPPORTED_CODE_LANGUAGES.find((item) => item.value === language)?.label} code`}
        placeholder="Paste or type code to explain..."
      />

      <div className="code-explanation-editor-meta">
        <span>{selection.code.trim() ? "Selection ready" : "Select code to explain a section"}</span>
        <span>{code.length.toLocaleString()} / {MAX_CODE_LENGTH.toLocaleString()} chars</span>
      </div>

      {copyStatus && <p className="code-explanation-copy-status" role="status">{copyStatus}</p>}

      <div className="code-explanation-editor-actions">
        <button
          type="button"
          className="code-explanation-primary-button"
          onClick={onExplainAll}
          disabled={isLoading}
        >
          <Sparkles size={16} />
          Explain entire code
        </button>
        <button
          type="button"
          className="code-explanation-secondary-button"
          onClick={explainSelection}
          disabled={isLoading || !selection.code.trim()}
        >
          <Lightbulb size={16} />
          Explain selected code
        </button>
      </div>
    </section>
  );
}
