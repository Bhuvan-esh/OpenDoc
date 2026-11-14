import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpenCheck, CircleHelp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CodeEditorPanel from "../components/code-explanation/CodeEditorPanel";
import ExplanationPanel from "../components/code-explanation/ExplanationPanel";
import {
  CODE_EXPLANATION_MODE,
  SUPPORTED_CODE_LANGUAGES,
  explainCode,
} from "../services/codeExplanationService";
import "../style/code-explanation.css";

const isSupportedLanguage = (language) =>
  SUPPORTED_CODE_LANGUAGES.some((item) => item.value === language);

export default function CodeExplanation() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state || {};
  const [code, setCode] = useState(
    typeof initialState.code === "string" ? initialState.code : ""
  );
  const [language, setLanguage] = useState(
    isSupportedLanguage(initialState.language) ? initialState.language : "js"
  );
  const [level, setLevel] = useState("beginner");
  const [selection, setSelection] = useState({ code: "", startLine: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const activeRequestRef = useRef(null);
  const requestIdRef = useRef(0);
  const lastRequestRef = useRef(null);
  const speechSupported = typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  useEffect(() => () => {
    requestIdRef.current += 1;
    activeRequestRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);

  const cancelPendingExplanation = () => {
    requestIdRef.current += 1;
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setIsLoading(false);
  };

  const runExplanation = async (request, requestedLevel = level) => {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    activeRequestRef.current = controller;
    let timedOut = false;

    lastRequestRef.current = request;
    setError("");
    setResult(null);
    setIsLoading(true);
    setSelectedLine(null);

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    try {
      const explanation = await explainCode({
        ...request,
        language,
        level: requestedLevel,
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current) return;
      setResult(explanation);
      setSelectedLine(explanation.lines[0]?.lineNumber ?? null);
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;
      setError(
        requestError.name === "AbortError"
          ? timedOut
            ? "The explanation took too long. Please try again."
            : "The explanation request was cancelled. Please try again."
          : requestError.message || "An unexpected explanation error occurred."
      );
    } finally {
      window.clearTimeout(timeoutId);
      if (requestId === requestIdRef.current) {
        activeRequestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const explainEntireCode = () => {
    const request = {
      code,
      contextCode: code,
      scope: "all",
      lineOffset: 0,
    };
    void runExplanation(request);
  };

  const explainSelectedCode = (selected) => {
    void runExplanation({
      code: selected.code,
      contextCode: code,
      scope: "selected",
      lineOffset: selected.startLine,
    });
  };

  const changeCode = (nextCode) => {
    cancelPendingExplanation();
    setCode(nextCode);
    setResult(null);
    setError("");
    setSelectedLine(null);
    lastRequestRef.current = null;
  };

  const changeLanguage = (nextLanguage) => {
    cancelPendingExplanation();
    setLanguage(nextLanguage);
    setResult(null);
    setError("");
    setSelection({ code: "", startLine: 0 });
    setSelectedLine(null);
    lastRequestRef.current = null;
  };

  const changeLevel = (nextLevel) => {
    setLevel(nextLevel);
    if (lastRequestRef.current) {
      void runExplanation(lastRequestRef.current, nextLevel);
    }
  };

  const speakText = (text) => {
    if (!speechSupported || !text?.trim()) {
      setSpeechError("Speech playback is not available in this browser.");
      return;
    }

    setSpeechError("");
    window.speechSynthesis.cancel();
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setSpeechError("The browser could not read this explanation aloud.");
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      setSpeechError("The browser could not read this explanation aloud.");
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="code-explanation-page">
      <header className="code-explanation-page-heading">
        <div>
          <button
            type="button"
            className="code-explanation-back-button"
            onClick={() => navigate("/playground")}
          >
            <ArrowLeft size={16} />
            Back to Playground
          </button>
          <span className="code-explanation-eyebrow">
            <BookOpenCheck size={15} />
            LEARNING TOOLS
          </span>
          <h1>AI Code Explanation</h1>
          <p>Explore what your code does, one idea and one line at a time.</p>
        </div>
        <div className="code-explanation-heading-icon">
          <BookOpenCheck size={26} />
        </div>
      </header>

      <div className="code-explanation-local-banner">
        <CircleHelp size={18} />
        <div>
          <strong>Local demo mode is active</strong>
          <p>
            No AI provider is configured. These rule-based explanations are not AI responses, and your code stays in this browser.
            A real provider needs a secure server or serverless proxy; never put private AI keys in Vite client variables.
          </p>
        </div>
      </div>

      {speechError && <p className="code-explanation-speech-error" role="status">{speechError}</p>}

      <div className="code-explanation-layout">
        <CodeEditorPanel
          code={code}
          language={language}
          level={level}
          selection={selection}
          highlightLine={selectedLine}
          onCodeChange={changeCode}
          onLanguageChange={changeLanguage}
          onLevelChange={changeLevel}
          onSelectionChange={setSelection}
          onExplainAll={explainEntireCode}
          onExplainSelected={explainSelectedCode}
          isLoading={isLoading}
        />
        <ExplanationPanel
          result={result}
          isLoading={isLoading}
          error={error}
          selectedLine={selectedLine}
          isSpeaking={isSpeaking}
          speechSupported={speechSupported}
          onRetry={() => {
            if (lastRequestRef.current) void runExplanation(lastRequestRef.current);
          }}
          onSelectLine={setSelectedLine}
          onSpeak={speakText}
          onStopSpeaking={stopSpeaking}
        />
      </div>

      <p className="code-explanation-mode-note">
        Provider: {CODE_EXPLANATION_MODE}. The local demo uses visible code patterns and does not compile or execute code.
      </p>
    </div>
  );
}
