
import { Bell, Menu, Search } from "lucide-react";

export default function Navbar({ onMenuClick, mobileMenu }) {
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

        <button
          type="button"
          className="icon-button"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="avatar" aria-label="OpenDocs Voice profile">
          OV
        </div>

      </div>
    </header>
  );
}
