
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Code2,
  Mic,
  BookText,
  FolderOpen,
  Lightbulb,
  Bug,
  Search,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  X,
  Command,
} from "lucide-react";

import useCommandPalette from "../hooks/useCommandPalette";
import "../style/command-palette.css";

const commands = [
  {
    id: "home",
    label: "Go to Home",
    description: "Open the OpenDocs Voice dashboard",
    category: "Navigation",
    path: "/",
    keywords: "dashboard main home",
    icon: Home,
  },
  {
    id: "reader",
    label: "Open Documentation",
    description: "Read and explore technical documentation",
    category: "Navigation",
    path: "/reader",
    keywords: "docs documentation reader",
    icon: BookOpen,
  },
  {
    id: "voice",
    label: "Open Voice Assistant",
    description: "Access the voice assistant",
    category: "Navigation",
    path: "/voice",
    keywords: "voice speech microphone assistant",
    icon: Mic,
  },
  {
    id: "glossary",
    label: "Open Technical Glossary",
    description: "Explore technical terms and definitions",
    category: "Learning",
    path: "/glossary",
    keywords: "glossary terms definitions vocabulary",
    icon: BookText,
  },
  {
    id: "workspace",
    label: "Open My Workspace",
    description: "Access your saved documentation",
    category: "Workspace",
    path: "/workspace",
    keywords: "workspace saved bookmarks notes",
    icon: FolderOpen,
  },
  {
    id: "explain",
    label: "Explain Anything",
    description: "Understand code, concepts, and errors",
    category: "Learning",
    path: "/explain",
    keywords: "explain ai learn concept code",
    icon: Lightbulb,
  },
  {
    id: "errors",
    label: "Error to Documentation",
    description: "Understand common programming errors",
    category: "Developer Tools",
    path: "/error-to-docs",
    keywords: "error bug debugging troubleshooting",
    icon: Bug,
  },
  {
    id: "playground",
    label: "Open Code Playground",
    description: "Write and run HTML, CSS and JavaScript",
    category: "Developer Tools",
    path: "/playground",
    keywords: "code editor html css javascript playground",
    icon: Code2,
  },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const { isOpen, close } = useCommandPalette();

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState([]);

  const inputRef = useRef(null);

  const filteredCommands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return commands;

    return commands.filter((command) => {
      const searchableText = [
        command.label,
        command.description,
        command.category,
        command.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;

    setSearch("");
    setSelectedIndex(0);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem("opendocs-recent-commands");

    if (saved) {
      try {
        setRecentCommands(JSON.parse(saved));
      } catch {
        setRecentCommands([]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const executeCommand = (command) => {
    const updatedRecent = [
      command.id,
      ...recentCommands.filter((id) => id !== command.id),
    ].slice(0, 4);

    setRecentCommands(updatedRecent);

    localStorage.setItem(
      "opendocs-recent-commands",
      JSON.stringify(updatedRecent)
    );

    close();
    navigate(command.path);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.min(current + 1, filteredCommands.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.max(current - 1, 0)
      );
    }

    if (event.key === "Enter" && filteredCommands.length > 0) {
      event.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  const recentItems = recentCommands
    .map((id) => commands.find((command) => command.id === id))
    .filter(Boolean);

  return (
    <div
      className="command-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="command-search">
          <Search size={21} />

          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, tools, and commands..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
          />

          <button
            className="command-close"
            onClick={close}
            aria-label="Close command palette"
          >
            <X size={19} />
          </button>
        </div>

        <div className="command-results">
          {!search && recentItems.length > 0 && (
            <div className="command-section">
              <p className="command-section-title">RECENTLY USED</p>

              {recentItems.map((command) => {
                const Icon = command.icon;

                return (
                  <button
                    key={`recent-${command.id}`}
                    className="command-item"
                    onClick={() => executeCommand(command)}
                  >
                    <span className="command-icon">
                      <Icon size={18} />
                    </span>

                    <span className="command-item-content">
                      <strong>{command.label}</strong>
                      <small>{command.description}</small>
                    </span>

                    <span className="command-category">
                      Recent
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="command-section">
            <p className="command-section-title">
              {search ? "SEARCH RESULTS" : "ALL COMMANDS"}
            </p>

            {filteredCommands.map((command, index) => {
              const Icon = command.icon;

              return (
                <button
                  key={command.id}
                  className={`command-item ${
                    selectedIndex === index ? "selected" : ""
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => executeCommand(command)}
                >
                  <span className="command-icon">
                    <Icon size={18} />
                  </span>

                  <span className="command-item-content">
                    <strong>{command.label}</strong>
                    <small>{command.description}</small>
                  </span>

                  <span className="command-category">
                    {command.category}
                  </span>
                </button>
              );
            })}

            {filteredCommands.length === 0 && (
              <div className="command-empty">
                <Search size={25} />
                <strong>No commands found</strong>
                <span>Try searching for another feature.</span>
              </div>
            )}
          </div>
        </div>

        <div className="command-footer">
          <div>
            <span className="command-key">
              <ArrowUp size={12} />
              <ArrowDown size={12} />
            </span>
            <small>Navigate</small>
          </div>

          <div>
            <span className="command-key">
              <CornerDownLeft size={12} />
            </span>
            <small>Open</small>
          </div>

          <div>
            <span className="command-key">ESC</span>
            <small>Close</small>
          </div>

          <span className="command-brand">
            <Command size={13} />
            OpenDocs Voice
          </span>
        </div>
      </div>
    </div>
  );
}
