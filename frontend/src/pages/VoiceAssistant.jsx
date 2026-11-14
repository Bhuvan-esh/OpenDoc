
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  User,
  AudioLines,
  MessageCircle,
} from "lucide-react";

const suggestedQuestions = [
  {
    icon: "🔐",
    title: "Explain API authentication",
    question: "Explain API authentication in simple terms.",
  },
  {
    icon: "⚙️",
    title: "How do I install dependencies?",
    question: "How do I install dependencies from documentation?",
  },
  {
    icon: "💻",
    title: "Explain code examples",
    question: "Explain how to understand code examples in documentation.",
  },
  {
    icon: "📚",
    title: "What is an API endpoint?",
    question: "What is an API endpoint and how does it work?",
  },
];

export default function VoiceAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleSend = (question = input) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedQuestion,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");

    // Demo response until the documentation RAG API is connected.
    window.setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text:
          "I'm currently running in demonstration mode. Your question has been received, but I am not yet connected to the documentation-based AI backend. Once RAG integration is enabled, I will answer using your uploaded documentation and provide source references.",
        demo: true,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    }, 600);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please try Chrome."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start microphone:", error);
      setIsListening(false);
    }
  };

  const speakMessage = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="assistant-page">

      {/* Page heading */}
      <div className="assistant-page-heading">
        <div className="assistant-eyebrow">
          <Sparkles size={15} />
          <span>MULTIMODAL LEARNING</span>
        </div>

        <h1>Voice Assistant</h1>

        <p>
          Ask questions about your documentation using your
          voice or keyboard.
        </p>
      </div>

      {/* Main assistant panel */}
      <section className="chat-panel">

        {/* Assistant header */}
        <div className="chat-header">
          <div className="assistant-header-left">
            <div className="assistant-header-icon">
              <Bot size={25} />
            </div>

            <div className="assistant-header-info">
              <h3>OpenDocs AI</h3>
              <span>
                <span className="online-indicator" />
                Documentation assistant
              </span>
            </div>
          </div>

          <div className="assistant-header-status">
            <AudioLines size={17} />
            <span>Voice enabled</span>
          </div>
        </div>

        {/* Conversation area */}
        <div className="chat-messages">

          {messages.length === 0 ? (
            <div className="assistant-empty-state">

              <div className="empty-state-icon">
                <Bot size={35} />
                <span className="empty-state-sparkle">
                  <Sparkles size={15} />
                </span>
              </div>

              <h2>How can I help you today?</h2>

              <p>
                Explore technical concepts, understand code,
                and learn from your documentation.
              </p>

              <div className="suggestion-section">
                <div className="suggestion-heading">
                  <span>TRY ASKING</span>
                  <div />
                </div>

                <div className="suggested-questions">
                  {suggestedQuestions.map((item) => (
                    <button
                      type="button"
                      key={item.title}
                      className="suggestion-chip"
                      onClick={() => handleSend(item.question)}
                    >
                      <span className="suggestion-emoji">
                        {item.icon}
                      </span>

                      <span className="suggestion-title">
                        {item.title}
                      </span>

                      <MessageCircle size={16} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="conversation-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${message.role}`}
                >
                  <div className="message-avatar">
                    {message.role === "assistant" ? (
                      <Bot size={19} />
                    ) : (
                      <User size={19} />
                    )}
                  </div>

                  <div className="message-content">
                    <div className="message-author">
                      {message.role === "assistant"
                        ? "OpenDocs AI"
                        : "You"}

                      {message.demo && (
                        <span className="demo-tag">
                          DEMO
                        </span>
                      )}
                    </div>

                    <div className="message-bubble">
                      {message.text}
                    </div>

                    {message.role === "assistant" && (
                      <button
                        type="button"
                        className="message-speak-button"
                        onClick={() => speakMessage(message.text)}
                      >
                        <Volume2 size={15} />
                        Listen
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Recording status */}
        {isListening && (
          <div className="recording-status">
            <span className="recording-dot" />

            <div className="recording-wave">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>

            <span>Listening... Speak now</span>

            <button
              type="button"
              onClick={() => recognitionRef.current?.stop()}
            >
              Stop
            </button>
          </div>
        )}

        {/* Speaking status */}
        {isSpeaking && (
          <div className="speaking-status">
            <AudioLines size={16} />
            <span>Playing audio response...</span>

            <button
              type="button"
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }}
            >
              Stop
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-area">

          <button
            type="button"
            className={`mic-button ${isListening ? "listening" : ""}`}
            onClick={startListening}
            aria-label={
              isListening ? "Stop recording" : "Start voice input"
            }
            title={
              isListening ? "Stop recording" : "Start voice input"
            }
          >
            {isListening ? (
              <MicOff size={21} />
            ) : (
              <Mic size={21} />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening to your voice..."
                : "Ask your documentation..."
            }
            aria-label="Ask your documentation"
          />

          <button
            type="button"
            className="send-button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send size={19} />
          </button>

        </div>

        <div className="chat-footer-note">
          <Sparkles size={13} />
          <span>
            Ask questions about your technical documentation
          </span>
        </div>

      </section>
    </div>
  );
}
