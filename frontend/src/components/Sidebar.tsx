import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: "/", label: t.sidebar.dashboard, icon: "🏠", end: true },
    { to: "/projecten", label: t.sidebar.projects, icon: "🎬" },
    { to: "/checklist", label: t.sidebar.checklist, icon: "✅" },
    { to: "/video-planner", label: t.sidebar.videoPlanner, icon: "📝" },
    { to: "/ideeen", label: t.sidebar.ideas, icon: "💡" },
    { to: "/templates", label: t.sidebar.templates, icon: "📚" },
    { to: "/trends", label: t.sidebar.trends, icon: "🔮" },
    { to: "/inspiratie", label: t.sidebar.inspiration, icon: "📌" },
    { to: "/taken", label: t.sidebar.tasks, icon: "📋" },
    { to: "/tips", label: t.sidebar.tips, icon: "📖" },
    { to: "/dagboek", label: t.sidebar.diary, icon: "📔" },
    { to: "/instellingen", label: t.sidebar.settings, icon: "⚙️" },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">🎥</span>
        <span>VlogPlanner</span>
      </div>
      <div className="sidebar-links">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-footer">
        {user && <div className="sidebar-user">👋 {user.username}</div>}
        <button className="ghost" onClick={logout}>
          {t.sidebar.logout}
        </button>
      </div>
    </nav>
  );
}
