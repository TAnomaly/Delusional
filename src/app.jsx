/**
 * Main App - Digital Minimalism Study Platform.
 * Minimal routing, no heavy frameworks.
 */
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import Nav from "./components/Nav.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import FocusPage from "./pages/FocusPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import KanbanPage from "./pages/KanbanPage.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import "./styles/global.css";

function AppContent() {
  const { loggedIn } = useAuth();
  const [page, setPage] = useState("kanban");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (!loggedIn) return <LoginPage />;

  const pages = {
    feed: FeedPage,
    kanban: KanbanPage,
    collections: CollectionsPage,
    focus: FocusPage,
    stats: StatsPage,
    profile: ProfilePage,
  };

  const PageComponent = pages[page] || KanbanPage;

  return (
    <div className="app">
      <Nav current={page} onNavigate={setPage} theme={theme} onToggleTheme={toggleTheme} />
      <PageComponent />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
