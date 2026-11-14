
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Monitor,
  Terminal,
  FileCode2,
  Palette,
  Braces,
  Trash2,
  LoaderCircle,
  Lightbulb,
} from "lucide-react";

import "../style/code-playground.css";

const starterHTML = `<main class="card">
  <h1>Hello, OpenDocs Voice!</h1>
  <p>Your interactive coding playground is ready.</p>
  <button id="demoButton">Click Me</button>
  <p id="message"></p>
</main>`;

const starterCSS = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f0e8;
  font-family: Arial, sans-serif;
}

.card {
  width: min(90%, 420px);
  padding: 32px;
  border-radius: 16px;
  background: white;
  text-align: center;
  box-shadow: 0 12px 35px rgba(24, 43, 73, 0.1);
}

h1 {
  color: #182b49;
}

p {
  color: #657386;
  line-height: 1.6;
}

button {
  padding: 11px 22px;
  border: none;
  border-radius: 8px;
  background: #c8553d;
  color: white;
  cursor: pointer;
}`;

const starterJS = `const button = document.getElementById("demoButton");

button.addEventListener("click", () => {
  document.getElementById("message").textContent =
    "Great! Your JavaScript is working.";

  console.log("Button clicked successfully!");
});

console.log("Welcome to OpenDocs Voice Playground!");`;

const starterC = `#include <stdio.h>

int main() {
    int number;

    printf("Enter a number: ");
    scanf("%d", &number);

    printf("You entered: %d\\n", number);

    return 0;
}`;

const starterCPP = `#include <iostream>
using namespace std;

int main() {
    int number;

    cout << "Enter a number: ";
    cin >> number;

    cout << "You entered: " << number << endl;

    return 0;
}`;

const starterJava = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter a number: ");
        int number = scanner.nextInt();

        System.out.println("You entered: " + number);

        scanner.close();
    }
}`;

const starterPython = `number = int(input("Enter a number: "))
print("You entered:", number)`;

const starters = {
  html: starterHTML,
  css: starterCSS,
  js: starterJS,
  c: starterC,
  cpp: starterCPP,
  java: starterJava,
  python: starterPython,
};

const languageOptions = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "js", label: "JavaScript" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
];


const judge0LanguageIds = {
  c: 103,      // C (GCC 14.1.0)
  cpp: 105,    // C++ (GCC 14.1.0)
  java: 91,    // Java (JDK 17.0.6)
};

const MAX_CODE_LENGTH = 1_000_000;

let pyodidePromise = null;

function loadPyodideRuntime() {
  if (window.loadPyodide) {
    return window.loadPyodide();
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-pyodide="true"]'
    );

    const script = existingScript || document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";
    script.async = true;
    script.dataset.pyodide = "true";

    script.onload = async () => {
      try {
        const runtime = await window.loadPyodide();
        resolve(runtime);
      } catch (error) {
        pyodidePromise = null;
        reject(error);
      }
    };

    script.onerror = () => {
      pyodidePromise = null;
      reject(new Error("Unable to load the Python runtime."));
    };

    if (!existingScript) {
      document.body.appendChild(script);
    }
  });

  return pyodidePromise;
}

function createPreview(html, css, js) {
  // Prevent editor input from closing the injected style/script tags.
  const safeCSS = css.replace(/<\/style/gi, "<\\/style");
  const safeJS = js.replace(/<\/script/gi, "<\\/script");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; font-src data:;"
  />

  <style>${safeCSS}</style>
</head>
<body>
  ${html}

  <script>
    const sendOutput = (type, values) => {
      const message = values.map((value) => {
        if (typeof value === "string") return value;

        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }).join(" ");

      parent.postMessage({
        source: "opendocs-playground",
        type,
        message
      }, "*");
    };

    ["log", "info", "warn", "error"].forEach((type) => {
      const original = console[type].bind(console);

      console[type] = (...values) => {
        original(...values);
        sendOutput(type, values);
      };
    });

    window.onerror = (message, source, line) => {
      sendOutput("error", [
        message + " (Line " + line + ")"
      ]);
    };

    try {
      ${safeJS}
    } catch (error) {
      sendOutput("error", [error.message]);
    }
  </script>
</body>
</html>`;
}

export default function CodePlayground() {
  console.log("Judge0 URL:", import.meta.env.VITE_JUDGE0_API_URL);
  const navigate = useNavigate();
  const [codes, setCodes] = useState(starters);
  const [language, setLanguage] = useState("html");
  const [stdin, setStdin] = useState("");

  const [preview, setPreview] = useState("");
  const [output, setOutput] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const iframeRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const activeCode = codes[language];
  const activeCodeLines = useMemo(() => activeCode.split("\n"), [activeCode]);
  const isWebLanguage = ["html", "css", "js"].includes(language);

  const addOutput = (type, message) => {
    setOutput((current) => [
      ...current,
      {
        type,
        message: String(message),
        id: `${Date.now()}-${Math.random()}`,
      },
    ]);
  };

  const updateCode = (value) => {
    setCodes((current) => ({
      ...current,
      [language]: value,
    }));
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;

      if (data?.source !== "opendocs-playground") return;

      addOutput(data.type, data.message);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const runWebCode = () => {
    setOutput([
      {
        type: "system",
        message: "Updating browser preview...",
        id: "web-running",
      },
    ]);

    setPreview(
      createPreview(codes.html, codes.css, codes.js)
    );

    setHasRun(true);
  };

  const runPython = async () => {
    addOutput("system", "Loading Python runtime...");

    const pyodide = await loadPyodideRuntime();

    // Capture Python standard output and errors.
    pyodide.setStdout({
      batched: (message) => addOutput("output", message),
    });

    pyodide.setStderr({
      batched: (message) => addOutput("error", message),
    });

    // Supply text from the Standard Input field to input().
    const inputText = stdin.length ? `${stdin}\n` : "";
    const inputBytes = new TextEncoder().encode(inputText);
    let inputIndex = 0;

    pyodide.setStdin({
      stdin: () => {
        if (inputIndex >= inputBytes.length) return null;
        return inputBytes[inputIndex++];
      },
    });

    await pyodide.runPythonAsync(codes.python);

    addOutput("success", "Python execution completed.");
    setHasRun(true);
  };


const runCompiledLanguage = async () => {
  const apiBase = import.meta.env.VITE_JUDGE0_API_URL;

  if (!apiBase) {
    throw new Error(
      "Judge0 API is not configured. Check your .env file."
    );
  }

  const baseURL = apiBase.replace(/\/+$/, "");
  const languageId = judge0LanguageIds[language];

  if (!languageId) {
    throw new Error("Unsupported Judge0 language.");
  }

  addOutput("system", "Submitting code to Judge0...");

  // Submit source code
  const submitResponse = await fetch(
    `${baseURL}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: codes[language],
        language_id: languageId,
        stdin: stdin,
      }),
    }
  );

  if (!submitResponse.ok) {
    const details = await submitResponse.text();

    throw new Error(
      `Submission failed (${submitResponse.status}): ${details}`
    );
  }

  const submission = await submitResponse.json();

  if (!submission.token) {
    throw new Error("Judge0 did not return a submission token.");
  }

  addOutput("system", "Code submitted. Waiting for execution...");

  let result = null;
  const maxAttempts = 40;

  // Poll Judge0 for execution result
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resultResponse = await fetch(
      `${baseURL}/submissions/${submission.token}?base64_encoded=false`,
      {
        method: "GET",
      }
    );

    if (!resultResponse.ok) {
      throw new Error(
        `Unable to retrieve result (${resultResponse.status}).`
      );
    }

    result = await resultResponse.json();

    // 1 = In Queue, 2 = Processing
    if (result.status?.id > 2) {
      break;
    }
  }

  if (!result || result.status?.id <= 2) {
    throw new Error(
      "Execution timed out while waiting for Judge0."
    );
  }

  // Display program output
  if (result.stdout) {
    addOutput("output", result.stdout);
  }

  // Display compilation errors
  if (result.compile_output) {
    addOutput("error", result.compile_output);
  }

  // Display runtime errors
  if (result.stderr) {
    addOutput("error", result.stderr);
  }

  // Display additional messages
  if (result.message) {
    addOutput("error", result.message);
  }

  // Display execution status
  if (result.status?.id === 3) {
    addOutput("success", "Program executed successfully.");
  } else {
    addOutput(
      "error",
      `Execution status: ${result.status?.description || "Unknown"}`
    );
  }

  if (
    !result.stdout &&
    !result.compile_output &&
    !result.stderr &&
    !result.message
  ) {
    addOutput("system", "The program did not produce any output.");
  }

  setHasRun(true);
};


  const runCode = async () => {
    setOutput([]);
    setIsRunning(true);

    try {
      if (isWebLanguage) {
        runWebCode();
      } else if (language === "python") {
        await runPython();
      } else {
        await runCompiledLanguage();
      }
    } catch (error) {
      addOutput("error", error.message || "An unexpected error occurred.");
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCodes(starters);
    setLanguage("html");
    setStdin("");
    setOutput([]);
    setPreview("");
    setHasRun(false);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      addOutput("error", "Unable to copy. Check clipboard permissions.");
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    setHasRun(false);
  };

  return (
    <div className="playground-page">
      {/* Page heading */}
      <div className="playground-heading">
        <div>
          <div className="playground-eyebrow">
            <Code2 size={15} />
            DEVELOPER TOOLS
          </div>

          <h1>Interactive Code Playground</h1>

          <p>
            Write, experiment and run seven programming and web
            languages directly inside OpenDocs Voice.
          </p>
        </div>

        <div className="playground-heading-icon">
          <Code2 size={30} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="playground-toolbar">
        <div className="playground-status">
          <span className="playground-status-dot" />
          {isWebLanguage ? "Browser Playground" : "Code Execution Playground"}
        </div>

        <div className="playground-actions">
          <button
            type="button"
            className="playground-secondary-button"
            onClick={() => navigate("/code-explanation", {
              state: { code: activeCode, language },
            })}
          >
            <Lightbulb size={16} />
            Explain code
          </button>

          <button
            type="button"
            className="playground-secondary-button"
            onClick={copyCode}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy code"}
          </button>

          <button
            type="button"
            className="playground-secondary-button"
            onClick={resetCode}
            disabled={isRunning}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            className="playground-run-button"
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <LoaderCircle className="playground-spinner" size={16} />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {isRunning ? "Running..." : "Run code"}
          </button>
        </div>
      </div>

      {/* Main editor and output */}
      <div className="playground-workspace">
        {/* Code editor */}
        <section className="playground-panel editor-panel">
          <div className="playground-panel-header">
            <div>
              <FileCode2 size={17} />
              <strong>Code Editor</strong>
            </div>

            <span className="playground-language-label">
              {languageOptions.find((item) => item.value === language)?.label}
            </span>
          </div>

          {/* Language selector */}
          <div className="playground-language-selector">
            <label htmlFor="playground-language">
              Select Language
            </label>

            <select
              id="playground-language"
              value={language}
              onChange={handleLanguageChange}
              disabled={isRunning}
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="js">JavaScript</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>

          {/* Web language tabs */}
          {isWebLanguage && (
            <div className="playground-tabs">
              <button
                className={language === "html" ? "active" : ""}
                onClick={() => setLanguage("html")}
                type="button"
              >
                <FileCode2 size={15} />
                HTML
              </button>

              <button
                className={language === "css" ? "active" : ""}
                onClick={() => setLanguage("css")}
                type="button"
              >
                <Palette size={15} />
                CSS
              </button>

              <button
                className={language === "js" ? "active" : ""}
                onClick={() => setLanguage("js")}
                type="button"
              >
                <Braces size={15} />
                JavaScript
              </button>
            </div>
          )}

          <div className="playground-editor">
            <div
              ref={lineNumbersRef}
              className="playground-line-numbers"
            >
              {activeCodeLines.map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>

            <textarea
              maxLength={MAX_CODE_LENGTH}
              spellCheck={false}
              value={activeCode}
              onChange={(event) => updateCode(event.target.value)}
              onScroll={(event) => {
                if (lineNumbersRef.current) {
                  lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop;
                }
              }}
              aria-label={`${language} code editor`}
              placeholder={`Write your ${language.toUpperCase()} code here...`}
              disabled={isRunning}
            />
          </div>

          <div className="playground-editor-footer">
            <span>{activeCodeLines.length} lines</span>
            <span>
              {activeCode.length.toLocaleString()} / {MAX_CODE_LENGTH.toLocaleString()} characters
            </span>
          </div>

          {/* Standard input */}
          {!isWebLanguage && (
            <div className="playground-input-section">
              <label htmlFor="playground-stdin">
                Standard Input (stdin)
              </label>

              <textarea
                id="playground-stdin"
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                placeholder="Enter input values here, one per line..."
                rows={4}
                disabled={isRunning}
              />

              <span>
                Input is supplied to input(), scanf(), cin or Scanner.
              </span>
            </div>
          )}
        </section>

        {/* Preview and console */}
        <section className="playground-panel preview-panel">
          <div className="playground-panel-header">
            <div>
              <Monitor size={17} />
              <strong>
                {isWebLanguage ? "Live Preview" : "Execution Output"}
              </strong>
            </div>

            <span className="preview-indicator">
              {hasRun ? "Recently executed" : "Ready to run"}
            </span>
          </div>

          {isWebLanguage ? (
            <>
              <div className="preview-browser-bar">
                <div className="preview-browser-dots">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="preview-address">
                  opendocs-playground.local
                </div>
              </div>

              <div className="playground-preview">
                {preview ? (
                  <iframe
                    ref={iframeRef}
                    title="Code playground preview"
                    sandbox="allow-scripts"
                    srcDoc={preview}
                  />
                ) : (
                  <div className="preview-empty">
                    <Monitor size={34} />
                    <strong>Your preview will appear here</strong>
                    <p>Write some code and select Run code.</p>

                    <button onClick={runCode} type="button">
                      <Play size={15} />
                      Run starter example
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="playground-execution-info">
              <Terminal size={34} />
              <strong>
                {languageOptions.find((item) => item.value === language)?.label}
                {" "}Execution
              </strong>
              <p>
                Run your program to see standard output, compiler
                messages and runtime errors below.
              </p>
            </div>
          )}

          {/* Console */}
          <div className="playground-console">
            <div className="console-header">
              <div>
                <Terminal size={16} />
                <strong>Console Output</strong>
                <span>{output.length}</span>
              </div>

              <button
                type="button"
                onClick={clearOutput}
                aria-label="Clear console"
              >
                <Trash2 size={15} />
                Clear
              </button>
            </div>

            <div className="console-content">
              {output.length === 0 ? (
                <p className="console-placeholder">
                  Console messages will appear here after running code.
                </p>
              ) : (
                output.map((item) => (
                  <div
                    key={item.id}
                    className={`console-line console-${item.type}`}
                  >
                    <span>{item.type.toUpperCase()}</span>
                    <code>{item.message}</code>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Information */}
      <div className="playground-information">
        <Code2 size={18} />

        <div>
          <strong>Experiment and learn</strong>
          <p>
            HTML, CSS and JavaScript run inside a sandboxed browser
            frame. Python runs using Pyodide in your browser. C, C++
            and Java use the configured Judge0 execution service.
          </p>
        </div>
      </div>
    </div>
  );
}
console.log("Judge0 URL:", import.meta.env.VITE_JUDGE0_API_URL);