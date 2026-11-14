
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Home,
  Mic,
  BookText,
  FolderOpen,
  ExternalLink,
  Bug,
} from "lucide-react";

const navigation = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Smart Reader",
    path: "/reader",
    icon: BookOpen,
  },
  {
    label: "Voice Assistant",
    path: "/voice",
    icon: Mic,
  },
  {
    label: "Glossary",
    path: "/glossary",
    icon: BookText,
  },
  {
    label: "My Workspace",
    path: "/workspace",
    icon: FolderOpen,
  },
  {
    label: "Error to Docs",
    path: "/error-to-docs",
    icon: Bug,
  },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-icon">
          <BookOpen size={23} />
        </div>

        <span>
          OpenDocs <b>Voice</b>
        </span>
      </div>

      <div className="sidebar-label">
        WORKSPACE
      </div>

      <nav aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
            
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
        >
          <ExternalLink size={19} />
          <span>GitHub</span>
        </a>

        <div className="sidebar-footer">
          <span>OpenDocs Voice</span>
        </div>
      </div>

    </aside>
  );
}
