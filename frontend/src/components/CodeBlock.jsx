
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({
  language = "bash",
  code = "",
}) {
  const [copyStatus, setCopyStatus] = useState("idle");

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        return;
      }
    } catch {
      // Fall back when clipboard access is unavailable or denied.
    }

    const textarea = document.createElement("textarea");
    textarea.value = code;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    try {
      textarea.select();
      if (!document.execCommand("copy")) {
        throw new Error("Copy command was unsuccessful.");
      }
    } finally {
      textarea.remove();
    }
  };

  const copyCode = async () => {
    try {
      await copyToClipboard();
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <div className="code-container">
      <div className="code-header">
        <span>{language}</span>

        <button
          className="copy-button"
          onClick={copyCode}
          aria-label={copyStatus === "failed" ? "Copy failed" : "Copy code"}
        >
          {copyStatus === "copied" ? <Check size={15} /> : <Copy size={15} />}
          {copyStatus === "copied"
            ? "Copied"
            : copyStatus === "failed"
              ? "Copy failed"
              : "Copy"}
        </button>
      </div>

      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
