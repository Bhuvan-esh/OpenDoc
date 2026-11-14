
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorToDocs from "./pages/ErrorToDocs";
import CodePlayground from "./pages/CodePlayground";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CommandPalette from "./components/CommandPalette";
import Home from "./pages/Home";
import Reader from "./pages/Reader";
import VoiceAssistant from "./pages/VoiceAssistant";
import Glossary from "./pages/Glossary";
import Workspace from "./pages/Workspace";
function Layout() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="app-layout">

      {/* Mobile drawer backdrop */}
      <button
        type="button"
        className={
          mobileMenu
            ? "sidebar-overlay show"
            : "sidebar-overlay"
        }
        onClick={closeMobileMenu}
        aria-label="Close navigation menu"
        tabIndex={mobileMenu ? 0 : -1}
      />

      {/* Mobile sidebar */}
      <div
        id="mobile-navigation"
        className={
          mobileMenu
            ? "mobile-sidebar open"
            : "mobile-sidebar"
        }
        aria-hidden={!mobileMenu}
      >
        <Sidebar onNavigate={closeMobileMenu} />
      </div>

      {/* Desktop sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="main-area">
        <Navbar
          onMenuClick={() => setMobileMenu((previous) => !previous)}
          mobileMenu={mobileMenu}
        />

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reader" element={<Reader />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/error-to-docs" element={<ErrorToDocs />} />
            <Route path="/playground" element={<CodePlayground />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CommandPalette />
      <Layout />
    </BrowserRouter>
  );
}

export default App;
