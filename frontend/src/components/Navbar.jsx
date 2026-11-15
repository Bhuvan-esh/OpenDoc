import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  Search,
  ShieldCheck,
  Languages,
  Box,
  Activity,
  Check,
} from "lucide-react";

export default function Navbar({ onMenuClick, mobileMenu }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef(null);

  const initialNotifications = [
    {
      id: 1,
      title: "Merkle Proof Verified",
      desc: "Zero-trust code preservation root generated and signed with Ed25519 key.",
      time: "2m ago",
      icon: <ShieldCheck size={16} color="#10b981" />,
      unread: true,
    },
    {
      id: 2,
      title: "Bilingual Engine Ready",
      desc: "Kannada & Hindi language models calibrated for aligned technical reading.",
      time: "15m ago",
      icon: <Languages size={16} color="#38bdf8" />,
      unread: true,
    },
    {
      id: 3,
      title: "Sandbox Environment Online",
      desc: "Isolated Python & Node.js code execution sandbox running with security quotas.",
      time: "40m ago",
      icon: <Box size={16} color="#f59e0b" />,
      unread: true,
    },
    {
      id: 4,
      title: "Upstream Monitor Active",
      desc: "Drift detection engine polling upstream documentation repositories.",
      time: "1h ago",
      icon: <Activity size={16} color="#a855f7" />,
      unread: false,
    },
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <header className="topbar">
      {/* Mobile hamburger menu */}
      <button
        type="button"
        className="icon-button mobile-menu"
        onClick={onMenuClick}
        aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileMenu}
        aria-controls="mobile-navigation"
      >
        <Menu size={21} />
      </button>

      {/* Global Command Palette Trigger */}
      <button
        className="navbar-command-trigger"
        onClick={() =>
          window.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: !navigator.platform.toLowerCase().includes("mac"),
              metaKey: navigator.platform.toLowerCase().includes("mac"),
            })
          )
        }
      >
        <Search size={17} />
        <span>Search anything...</span>
        <kbd>Ctrl K</kbd>
      </button>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Workspace</span>
        <span>/</span>
        <b>OpenDocs Voice</b>
      </div>

      {/* Header actions */}
      <div className="topbar-actions">
        {/* Notifications Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            type="button"
            className="icon-button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            style={{ position: "relative" }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  border: "1.5px solid #0f172a",
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: "-10px",
                width: "330px",
                backgroundColor: "#182234",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "12px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                overflow: "hidden",
                color: "#e2e8f0",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "rgba(255, 255, 255, 0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>System Notifications</span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      background: "rgba(59, 130, 246, 0.2)",
                      color: "#60a5fa",
                      borderRadius: "10px",
                      fontWeight: 500,
                    }}
                  >
                    Live
                  </span>
                </div>
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: "2px 4px",
                  }}
                >
                  Mark read
                </button>
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      gap: "12px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      background: item.unread ? "rgba(56, 189, 248, 0.04)" : "transparent",
                    }}
                  >
                    <div style={{ marginTop: "2px", flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{item.title}</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{item.time}</span>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(0, 0, 0, 0.2)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                  <span>All core systems healthy</span>
                </div>
                <span style={{ fontSize: "11px" }}>Vultr Cloud</span>
              </div>
            </div>
          )}
        </div>

        <div className="avatar" aria-label="OpenDocs Voice profile">
          OV
        </div>
      </div>
    </header>
  );
}
