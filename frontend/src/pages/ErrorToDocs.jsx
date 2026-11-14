
import { useState } from "react";
import {
  AlertCircle,
  Search,
  Bug,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Terminal,
  ShieldAlert,
} from "lucide-react";
import "../style/error-to-docs.css";

const errorExamples = [
  "TypeError: Cannot read properties of undefined",
  "Module not found: Can't resolve 'react'",
  "Access to fetch has been blocked by CORS policy",
  "ModuleNotFoundError: No module named 'pandas'",
  "404 Not Found",
];

const errorGuides = [
  {
    match: ["cannot read properties of undefined", "cannot read property"],
    title: "Cannot read properties of undefined",
    category: "JavaScript · Runtime Error",
    severity: "Runtime error",
    summary:
      "Your code is trying to access a property on a value that is currently undefined.",
    cause:
      "The variable or object you are accessing may not have been initialized, or the data may not have arrived yet.",
    steps: [
      "Find the line number shown in the browser console or terminal.",
      "Identify the variable immediately before the property access.",
      "Check whether that variable has a valid value before using it.",
      "If the value comes from an API, handle the loading and empty-data states.",
      "Use optional chaining or a suitable default value where appropriate.",
    ],
    checks: [
      "Is the variable initialized?",
      "Does the API response contain the expected property?",
      "Can this code run before data loading finishes?",
    ],
    code: `// Problem
console.log(user.name);

// Safer access
console.log(user?.name);

// Or provide a default
const name = user?.name ?? "Unknown";`,
    docs: [
      {
        label: "JavaScript optional chaining",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining",
      },
      {
        label: "JavaScript nullish coalescing",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing",
      },
    ],
  },
  {
    match: ["module not found", "can't resolve", "cannot find module"],
    title: "Module Not Found",
    category: "JavaScript · Dependency Error",
    severity: "Build error",
    summary:
      "Your application cannot locate a package or file that your code is trying to import.",
    cause:
      "The dependency may not be installed, the import path may be incorrect, or the filename's capitalization may not match.",
    steps: [
      "Read the complete error and identify the missing package or file.",
      "Check whether the package is listed in package.json.",
      "Install the missing dependency if it is an external package.",
      "If it is a local file, verify the relative import path.",
      "Check filename capitalization and restart the development server.",
    ],
    checks: [
      "Is the package installed in node_modules?",
      "Does the imported file actually exist?",
      "Is the import path correct relative to the current file?",
    ],
    code: `// Install a missing package
npm install package-name

// Example local import
import Header from "./components/Header";`,
    docs: [
      {
        label: "npm install documentation",
        url: "https://docs.npmjs.com/cli/commands/npm-install",
      },
      {
        label: "Vite troubleshooting",
        url: "https://vite.dev/guide/troubleshooting",
      },
    ],
  },
  {
    match: ["cors policy", "cross-origin", "access-control-allow-origin"],
    title: "CORS Policy Error",
    category: "Web · Network Error",
    severity: "Network error",
    summary:
      "The browser blocked a request because the server did not provide the required Cross-Origin Resource Sharing permissions.",
    cause:
      "Your frontend and API may use different origins, and the API server may not allow requests from your frontend origin.",
    steps: [
      "Open the browser Network tab and inspect the failed request.",
      "Check the frontend origin and the API server origin.",
      "Configure the API server to allow the required frontend origin.",
      "Allow the HTTP methods and headers your application needs.",
      "Retry the request and inspect the response headers.",
    ],
    checks: [
      "Does the API response include Access-Control-Allow-Origin?",
      "Are required request methods and headers allowed?",
      "Does the server handle OPTIONS preflight requests?",
    ],
    code: `// Example Express server configuration
import cors from "cors";

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));`,
    docs: [
      {
        label: "MDN: Cross-Origin Resource Sharing",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      },
      {
        label: "Express CORS middleware",
        url: "https://expressjs.com/en/resources/middleware/cors.html",
      },
    ],
  },
  {
    match: ["modulenotfounderror", "no module named"],
    title: "Python Module Not Found",
    category: "Python · Dependency Error",
    severity: "Import error",
    summary:
      "Python cannot find a module that your program is attempting to import.",
    cause:
      "The package may not be installed in the active Python environment, or your terminal may be using a different interpreter.",
    steps: [
      "Check the exact module name in the error.",
      "Activate the virtual environment used by your project.",
      "Install the required package using the active Python interpreter.",
      "Verify that VS Code uses the same Python interpreter.",
      "Run the program again from the activated environment.",
    ],
    checks: [
      "Is the correct virtual environment activated?",
      "Was the package installed in that environment?",
      "Is the import name different from the package installation name?",
    ],
    code: `# Activate your virtual environment on Windows
.\\venv\\Scripts\\Activate.ps1

# Install a package
python -m pip install pandas

# Verify installation
python -m pip show pandas`,
    docs: [
      {
        label: "Python: Installing packages",
        url: "https://docs.python.org/3/installing/index.html",
      },
      {
        label: "Python: The import system",
        url: "https://docs.python.org/3/reference/import.html",
      },
    ],
  },
  {
    match: ["404 not found", "status code 404"],
    title: "404 — Resource Not Found",
    category: "Web · HTTP Error",
    severity: "HTTP error",
    summary:
      "The server could not find the resource requested at the specified URL.",
    cause:
      "The URL may be incorrect, the resource may have moved, or the backend may not expose the requested route.",
    steps: [
      "Check the complete URL and look for spelling mistakes.",
      "Verify the API route or page path in your application.",
      "Check whether the backend server is running.",
      "Confirm that the HTTP method matches the route definition.",
      "Inspect the Network tab to see the exact request URL.",
    ],
    checks: [
      "Is the endpoint path correct?",
      "Is the backend running on the expected port?",
      "Does the server define this route?",
    ],
    code: `// Example Express route
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

// Request the matching endpoint
fetch("/api/users");`,
    docs: [
      {
        label: "MDN: HTTP response status codes",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
      },
      {
        label: "Express routing",
        url: "https://expressjs.com/en/guide/routing.html",
      },
    ],
  },
];

function diagnoseError(message) {
  const normalized = message.toLowerCase();

  const match = errorGuides.find((guide) =>
    guide.match.some((term) => normalized.includes(term))
  );

  if (match) return match;

  return {
    title: "General Error Investigation",
    category: "Unclassified · Troubleshooting",
    severity: "Needs investigation",
    summary:
      "The supplied error does not match one of the currently supported demo patterns. You can still use the investigation steps below to narrow down the cause.",
    cause:
      "The exact cause cannot be determined from this message by the local demo rules. More context, such as the stack trace, affected file, and recent code changes, may be needed.",
    steps: [
      "Read the complete error message, including the first line and stack trace.",
      "Identify the file name and line number where the error occurs.",
      "Check the code immediately before the reported line.",
      "Review recent changes to dependencies, configuration, and environment variables.",
      "Reproduce the issue with the smallest possible example.",
    ],
    checks: [
      "What action triggers the error?",
      "Does the error happen every time or only sometimes?",
      "Did you recently change code, dependencies, or configuration?",
    ],
    code: null,
    docs: [
      {
        label: "MDN Web Docs",
        url: "https://developer.mozilla.org/",
      },
      {
        label: "Stack Overflow",
        url: "https://stackoverflow.com/",
      },
    ],
  };
}

export default function ErrorToDocs() {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const diagnose = () => {
    if (!error.trim()) return;
    setResult(diagnoseError(error.trim()));
    setCopied(false);
  };

  const reset = () => {
    setError("");
    setResult(null);
    setCopied(false);
  };

  const copyReport = async () => {
    if (!result) return;

    const report = [
      result.title,
      result.summary,
      `Likely cause: ${result.cause}`,
      "Troubleshooting steps:",
      ...result.steps.map((step, index) => `${index + 1}. ${step}`),
      "Things to check:",
      ...result.checks.map((item) => `- ${item}`),
      result.code ? `Code example:\n${result.code}` : "",
    ].filter(Boolean).join("\n\n");

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="error-page">
      <section className="error-hero">
        <div className="error-hero-icon">
          <Bug size={26} />
        </div>

        <div>
          <span className="error-eyebrow">SMART DEBUGGING ASSISTANT</span>
          <h1>Error to Documentation</h1>
          <p>
            Understand errors, discover possible causes, and follow
            structured troubleshooting steps.
          </p>
        </div>
      </section>

      <section className="error-input-card">
        <div className="error-input-heading">
          <div>
            <h2>Paste your error message</h2>
            <p>
              Include the full error text or stack trace for better context.
            </p>
          </div>
          <Terminal size={23} />
        </div>

        <textarea
          className="error-textarea"
          value={error}
          onChange={(event) => setError(event.target.value)}
          placeholder={"Paste your error here...\n\nExample: TypeError: Cannot read properties of undefined"}
          rows={7}
        />

        <div className="error-examples">
          <span>Common examples</span>
          {errorExamples.map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => setError(example)}
            >
              {example}
            </button>
          ))}
        </div>

        <div className="error-actions">
          <button
            type="button"
            className="error-reset-button"
            onClick={reset}
          >
            <RotateCcw size={16} />
            Clear
          </button>

          <button
            type="button"
            className="error-diagnose-button"
            onClick={diagnose}
            disabled={!error.trim()}
          >
            <Search size={17} />
            Analyze error
          </button>
        </div>
      </section>

      {result && (
        <section className="error-result">
          <div className="error-result-header">
            <div className="error-result-title">
              <div className="error-result-icon">
                <AlertCircle size={22} />
              </div>
              <div>
                <span className="error-eyebrow">ANALYSIS RESULT</span>
                <h2>{result.title}</h2>
                <span className="error-category">{result.category}</span>
              </div>
            </div>

            <button
              type="button"
              className="error-copy-button"
              onClick={copyReport}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy report"}
            </button>
          </div>

          <div className="error-severity">
            <ShieldAlert size={18} />
            <span>Classification: {result.severity}</span>
          </div>

          <div className="error-info-block">
            <div className="error-block-heading">
              <Lightbulb size={19} />
              <h3>What does this error mean?</h3>
            </div>
            <p>{result.summary}</p>
          </div>

          <div className="error-info-block">
            <div className="error-block-heading">
              <Search size={19} />
              <h3>Possible cause</h3>
            </div>
            <p>{result.cause}</p>
          </div>

          <div className="error-info-block">
            <div className="error-block-heading">
              <Bug size={19} />
              <h3>How to troubleshoot</h3>
            </div>

            <ol className="error-steps">
              {result.steps.map((step, index) => (
                <li key={index}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="error-info-block">
            <div className="error-block-heading">
              <AlertCircle size={19} />
              <h3>Things to check</h3>
            </div>

            <ul className="error-checks">
              {result.checks.map((check, index) => (
                <li key={index}>{check}</li>
              ))}
            </ul>
          </div>

          {result.code && (
            <div className="error-code-block">
              <div className="error-block-heading">
                <Terminal size={19} />
                <h3>Example solution</h3>
              </div>
              <pre>
                <code>{result.code}</code>
              </pre>
            </div>
          )}

          <div className="error-docs-block">
            <div className="error-block-heading">
              <BookOpen size={19} />
              <h3>Related documentation</h3>
            </div>

            <div className="error-doc-links">
              {result.docs.map((doc) => (
                <a
                  key={doc.url}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{doc.label}</span>
                  <ExternalLink size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="error-demo-note">
            <AlertCircle size={16} />
            This is a rule-based frontend demo, not an AI diagnosis.
            Verify suggested changes before applying them.
          </div>
        </section>
      )}
    </main>
  );
}
