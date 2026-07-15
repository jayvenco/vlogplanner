import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: "/", label: t.sidebar.dashboard, end: true },
    { to: "/projecten", label: t.sidebar.projects },
    { to: "/checklist", label: t.sidebar.checklist },
    { to: "/video-planner", label: t.sidebar.videoPlanner },
    { to: "/ideeen", label: t.sidebar.ideas },
    { to: "/templates", label: t.sidebar.templates },
    { to: "/trends", label: t.sidebar.trends },
    { to: "/inspiratie", label: t.sidebar.inspiration },
    { to: "/taken", label: t.sidebar.tasks },
    { to: "/tips", label: t.sidebar.tips },
    { to: "/dagboek", label: t.sidebar.diary },
    { to: "/instellingen", label: t.sidebar.settings },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-mark" />
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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-footer">
        {user && <div className="sidebar-user">{user.username}</div>}
        <button className="ghost" onClick={logout}>
          {t.sidebar.logout}
        </button>
      </div>
    </nav>
  );
}
