/**
 * Navigation - Japanese minimalist aesthetic.
 * Clean, deliberate, with generous space.
 */
import { useAuth } from "../hooks/useAuth.jsx";

export default function Nav({ current, onNavigate, theme, onToggleTheme }) {
  const { logout } = useAuth();

  const links = [
    { key: "feed", label: "Stream" },
    { key: "kanban", label: "Board" },
    { key: "collections", label: "Collections" },
    { key: "focus", label: "Focus" },
    { key: "stats", label: "Stats" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <nav className="nav">
      <a
        href="#"
        className="nav-brand"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("feed");
        }}
      >
        禅 Minimal
      </a>

      <div className="nav-links">
        {links.map((l) => (
          <a
            key={l.key}
            href="#"
            className={`nav-link ${current === l.key ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(l.key);
            }}
          >
            {l.label}
          </a>
        ))}
      </div>

      <div className="nav-actions">
        <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
          {theme === "dark" ? "○" : "●"}
        </button>
        <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          style={{ fontSize: "0.72rem" }}
        >
          Exit
        </a>
      </div>
    </nav>
  );
}
