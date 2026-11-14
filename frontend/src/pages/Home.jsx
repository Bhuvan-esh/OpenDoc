
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Globe,
  Mic,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import LanguageSelector from "../components/LanguageSelector";
import {
  checkBackendHealth,
  previewDocument,
} from "../services/api";

import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Code2,
    title: "Code-safe translation",
    description:
      "Technical commands, code and package names stay protected.",
  },
  {
    icon: Mic,
    title: "Voice accessibility",
    description:
      "Listen to documentation and interact using your voice.",
  },
  {
    icon: ShieldCheck,
    title: "Source-linked learning",
    description:
      "Connect translated paragraphs to original documentation.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("kn");
  const [status, setStatus] = useState("Checking...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkBackendHealth()
      .then(() => setStatus("Connected"))
      .catch(() => setStatus("Disconnected"));
  }, []);
  const [showCommandTip, setShowCommandTip] = useState(
  !localStorage.getItem("opendocs-command-tip-seen")
);

const dismissCommandTip = () => {
  localStorage.setItem("opendocs-command-tip-seen", "true");
  setShowCommandTip(false);
};  
  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await previewDocument({
        url,
        target_language: language,
      });

      if (result.status !== "success") {
        throw new Error(result.message);
      }

      navigate("/reader", {
        state: {
          url,
          language,
          preview: true,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="page home-page">

      <section className="hero-section">

        <div className="hero-label">
          <Sparkles size={15} />
          Documentation without language barriers
        </div>

        <h1>
          Understand technology.
          <span> In your language.</span>
        </h1>

        <p className="hero-description">
          Read, listen and understand open-source
          documentation with code-safe AI translation
          and multilingual voice assistance.
        </p>

        <form
          className="url-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="documentation-url">
            Documentation URL
          </label>

          <div className="url-input">
            <Globe size={19} />

            <input
              id="documentation-url"
              type="url"
              placeholder="https://docs.python.org/3/"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </div>

          <LanguageSelector
            value={language}
            onChange={setLanguage}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={loading || status !== "Connected"}
          >
            {loading ? "Validating..." : "Start reading"}
            <ArrowRight size={18} />
          </button>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <div className="backend-status">
            <span
              className={
                status === "Connected"
                  ? "status-dot online"
                  : "status-dot offline"
              }
            />
            Backend {status}
          </div>
        </form>

      </section>

      <section className="features-section">

        <div className="section-heading">
          <span>BUILT FOR DEVELOPERS AND LEARNERS</span>
          <h2>Learn without limitations</h2>
        </div>

        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                className="feature-card"
                key={feature.title}
              >
                <div className="feature-icon">
                  <Icon size={23} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
        {showCommandTip && (
  <div className="command-welcome-tip">
    <strong>Discover Quick Navigation</strong>

    <p>
      Navigate anywhere in OpenDocs Voice instantly.
    </p>

    <p>
      Press <kbd>Ctrl + K</kbd> to search pages and tools.
    </p>

    <button onClick={dismissCommandTip}>
      Got it
    </button>
  </div>
)}
      </section>

      <footer className="page-footer">
        <div className="brand-small">
          <BookOpen size={18} />
          OpenDocs Voice
        </div>

        <span>
          Making open-source knowledge accessible to everyone.
        </span>
      </footer>

    </div>
  );
}
