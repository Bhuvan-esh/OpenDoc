import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BookOpen,
  Languages,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Code2,
  Headphones,
} from "lucide-react";
import "../style/reader.css";

const translations = {
  Kannada: {
    title: "ಡಾಕ್ಯುಮೆಂಟೇಶನ್ ಓದುಗ",
    intro:
      "ಈ ವಿಭಾಗವು ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಸ್ಥಾಪಿಸಲು ಮತ್ತು ಪ್ರಾರಂಭಿಸಲು ಅಗತ್ಯವಾದ ಹಂತಗಳನ್ನು ವಿವರಿಸುತ್ತದೆ.",
    install:
      "ನಿಮ್ಮ ಯೋಜನೆಗೆ ಅಗತ್ಯವಿರುವ ಪ್ಯಾಕೇಜ್‌ಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ಕೆಳಗಿನ ಆಜ್ಞೆಯನ್ನು ಚಲಾಯಿಸಿ.",
    setup:
      "ಪ್ಯಾಕೇಜ್‌ಗಳನ್ನು ಸ್ಥಾಪಿಸಿದ ನಂತರ, ನಿಮ್ಮ ಯೋಜನೆಯ ಮೂಲ ಫೈಲ್ ಅನ್ನು ತೆರೆಯಿರಿ ಮತ್ತು ಅಗತ್ಯ ಸಂರಚನೆಯನ್ನು ಸೇರಿಸಿ.",
    run:
      "ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸಲು ಅಭಿವೃದ್ಧಿ ಸರ್ವರ್ ಅನ್ನು ಚಲಾಯಿಸಿ. ನಂತರ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯ ವಿಳಾಸವನ್ನು ತೆರೆಯಿರಿ.",
  },
  Hindi: {
    title: "डॉक्यूमेंटेशन रीडर",
    intro:
      "यह अनुभाग आपके एप्लिकेशन को इंस्टॉल करने और शुरू करने के लिए आवश्यक चरणों की व्याख्या करता है।",
    install:
      "अपने प्रोजेक्ट के लिए आवश्यक पैकेज इंस्टॉल करने के लिए नीचे दिया गया कमांड चलाएँ।",
    setup:
      "पैकेज इंस्टॉल करने के बाद, अपने प्रोजेक्ट की मुख्य फ़ाइल खोलें और आवश्यक कॉन्फ़िगरेशन जोड़ें।",
    run:
      "एप्लिकेशन शुरू करने के लिए डेवलपमेंट सर्वर चलाएँ। फिर अपने ब्राउज़र में लोकल एड्रेस खोलें।",
  },
  Spanish: {
    title: "Lector de documentación",
    intro:
      "Esta sección explica los pasos necesarios para instalar e iniciar tu aplicación.",
    install:
      "Ejecuta el siguiente comando para instalar los paquetes necesarios para tu proyecto.",
    setup:
      "Después de instalar los paquetes, abre el archivo principal de tu proyecto y añade la configuración necesaria.",
    run:
      "Inicia el servidor de desarrollo para ejecutar la aplicación. Después, abre la dirección local en tu navegador.",
  },
};

const sections = [
  {
    id: 1,
    heading: "Introduction",
    english:
      "This section explains the steps required to install and start your application. Follow the instructions in order to configure your development environment.",
    key: "intro",
  },
  {
    id: 2,
    heading: "Install dependencies",
    english:
      "Run the following command to install the packages required by your project. Make sure you are inside the project directory before executing it.",
    key: "install",
    code: "npm install",
  },
  {
    id: 3,
    heading: "Configure the project",
    english:
      "After installing the packages, open your project's entry file and add the required configuration. Keep environment-specific values in a separate configuration file.",
    key: "setup",
    code: "npm run build",
  },
  {
    id: 4,
    heading: "Run the application",
    english:
      "Start the development server to run your application. Once the server starts, open the local address shown in your terminal.",
    key: "run",
    code: "npm run dev",
  },
];

export default function Reader() {
  const location = useLocation();

  const [language, setLanguage] = useState("Kannada");
  const [selectedSection, setSelectedSection] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [showConfidence, setShowConfidence] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingAll, setSpeakingAll] = useState(false);

  const documentUrl = location.state?.url || "";
  const documentTitle =
    location.state?.title || "Getting Started Documentation";

  const currentSection = useMemo(
    () => sections.find((section) => section.id === selectedSection),
    [selectedSection]
  );

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingAll(false);
  };

  const speakText = (text, all = false) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const languageCodes = {
      English: "en-US",
      Kannada: "kn-IN",
      Hindi: "hi-IN",
      Spanish: "es-ES",
    };

    utterance.lang = languageCodes[all ? "English" : language] || "en-US";
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setSpeakingAll(all);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingAll(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingAll(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakCurrentSection = () => {
    if (!currentSection) return;

    const translated =
      translations[language]?.[currentSection.key] || currentSection.english;

    speakText(`${currentSection.heading}. ${translated}`);
  };

  const speakWholeDocument = () => {
    const fullText = sections
      .map((section) => {
        const translated =
          translations[language]?.[section.key] || section.english;

        return `${section.heading}. ${translated}`;
      })
      .join(". ");

    speakText(fullText, true);
  };

  const pauseSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    stopSpeech();
    // Stop playback when the selected language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const goToSection = (direction) => {
    const next = selectedSection + direction;

    if (next >= 1 && next <= sections.length) {
      setSelectedSection(next);
    }
  };

  return (
    <main className="bilingual-reader">
      <header className="reader-header">
        <div className="reader-heading">
          <div className="reader-heading-icon">
            <BookOpen size={23} />
          </div>

          <div>
            <span className="reader-eyebrow">OPENDOCS VOICE</span>
            <h1>Smart Bilingual Reader</h1>
            <p>Read technical documentation in your preferred language.</p>
          </div>
        </div>

        <div className="reader-header-actions">
          <button
            className="reader-tool-button"
            onClick={() => setFontSize((size) => Math.max(13, size - 1))}
            title="Decrease font size"
          >
            <Minus size={17} />
          </button>

          <span className="reader-font-size">{fontSize}px</span>

          <button
            className="reader-tool-button"
            onClick={() => setFontSize((size) => Math.min(24, size + 1))}
            title="Increase font size"
          >
            <Plus size={17} />
          </button>
        </div>
      </header>

      <section className="reader-document-bar">
        <div className="reader-document-info">
          <BookOpen size={18} />
          <div>
            <strong>{documentTitle}</strong>
            <span>
              {documentUrl
                ? documentUrl
                : "Sample documentation · Frontend demonstration"}
            </span>
          </div>
        </div>

        <div className="reader-language-control">
          <Languages size={18} />
          <label htmlFor="reader-language">Translate to</label>
          <select
            id="reader-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="Kannada">Kannada</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
      </section>

      <section className="reader-toolbar">
        <div className="reader-toolbar-left">
          <span className="reader-status-dot" />
          <span>Original + translated view</span>
          <span className="reader-demo-label">DEMO CONTENT</span>
        </div>

        <div className="reader-toolbar-actions">
          <button
            className={`reader-toolbar-button ${
              showConfidence ? "active" : ""
            }`}
            onClick={() => setShowConfidence((value) => !value)}
          >
            {showConfidence ? <EyeOff size={16} /> : <Eye size={16} />}
            {showConfidence ? "Hide confidence" : "Show confidence"}
          </button>

          <button
            className="reader-toolbar-button reader-listen-button"
            onClick={speakWholeDocument}
          >
            <Headphones size={16} />
            Listen to all
          </button>
        </div>
      </section>

      <div className="reader-content-layout">
        <aside className="reader-outline">
          <h3>ON THIS PAGE</h3>

          {sections.map((section) => (
            <button
              key={section.id}
              className={`reader-outline-item ${
                selectedSection === section.id ? "selected" : ""
              }`}
              onClick={() => setSelectedSection(section.id)}
            >
              <span>{String(section.id).padStart(2, "0")}</span>
              {section.heading}
            </button>
          ))}

          <div className="reader-outline-note">
            <Languages size={18} />
            <p>
              Your original documentation stays unchanged while the translated
              version is displayed alongside it.
            </p>
          </div>
        </aside>

        <section className="reader-columns">
          <article className="reader-language-panel">
            <div className="reader-panel-heading">
              <div>
                <span className="reader-panel-label">SOURCE LANGUAGE</span>
                <h2>English</h2>
              </div>
              <span className="reader-original-tag">Original</span>
            </div>

            <div
              className="reader-paragraph"
              style={{ fontSize: `${fontSize}px` }}
            >
              <span className="reader-section-number">
                SECTION {String(currentSection.id).padStart(2, "0")}
              </span>

              <h3>{currentSection.heading}</h3>
              <p>{currentSection.english}</p>

              {currentSection.code && (
                <div className="reader-code-block">
                  <div className="reader-code-heading">
                    <span>
                      <Code2 size={15} />
                      Terminal
                    </span>
                    <span>bash</span>
                  </div>
                  <pre>
                    <code>{currentSection.code}</code>
                  </pre>
                </div>
              )}
            </div>
          </article>

          <article className="reader-language-panel translated-panel">
            <div className="reader-panel-heading">
              <div>
                <span className="reader-panel-label">TARGET LANGUAGE</span>
                <h2>{language}</h2>
              </div>
              <span className="reader-translated-tag">Translated</span>
            </div>

            <div
              className="reader-paragraph translated-paragraph"
              style={{ fontSize: `${fontSize}px` }}
            >
              <span className="reader-section-number">
                SECTION {String(currentSection.id).padStart(2, "0")}
              </span>

              <h3>{translations[language].title}</h3>
              <p>{translations[language][currentSection.key]}</p>

              {currentSection.code && (
                <div className="reader-code-block">
                  <div className="reader-code-heading">
                    <span>
                      <Code2 size={15} />
                      Terminal
                    </span>
                    <span>Preserved code</span>
                  </div>
                  <pre>
                    <code>{currentSection.code}</code>
                  </pre>
                </div>
              )}

              {showConfidence && (
                <div className="reader-confidence">
                  <div className="reader-confidence-top">
                    <span>Translation confidence</span>
                    <strong>Demo score: 96%</strong>
                  </div>
                  <div className="reader-confidence-track">
                    <span />
                  </div>
                  <p>
                    Illustrative score only. A real confidence score requires
                    translation evaluation from a backend service.
                  </p>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>

      <footer className="reader-footer">
        <div className="reader-playback">
          <button
            className="reader-play-button"
            onClick={speakCurrentSection}
            title="Read current section"
          >
            <Play size={17} fill="currentColor" />
          </button>

          <div className="reader-playback-label">
            <strong>Read this section aloud</strong>
            <span>
              {isSpeaking
                ? speakingAll
                  ? "Reading the document"
                  : "Reading current section"
                : "Browser speech synthesis"}
            </span>
          </div>

          {isSpeaking && (
            <div className="reader-playback-controls">
              {isPaused ? (
                <button onClick={resumeSpeech} title="Resume">
                  <Play size={17} />
                </button>
              ) : (
                <button onClick={pauseSpeech} title="Pause">
                  <Pause size={17} />
                </button>
              )}

              <button onClick={stopSpeech} title="Stop">
                <Square size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="reader-navigation">
          <button
            onClick={() => goToSection(-1)}
            disabled={selectedSection === 1}
          >
            <ChevronLeft size={17} />
            Previous
          </button>

          <span>
            {selectedSection} / {sections.length}
          </span>

          <button
            onClick={() => goToSection(1)}
            disabled={selectedSection === sections.length}
          >
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      </footer>
    </main>
  );
}