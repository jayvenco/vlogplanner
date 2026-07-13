import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "🏠", end: true },
  { to: "/projecten", label: "Mijn Projecten", icon: "🎬" },
  { to: "/checklist", label: "Checklist", icon: "✅" },
  { to: "/video-planner", label: "Video Planner", icon: "📝" },
  { to: "/ideeen", label: "Ideeën", icon: "💡" },
  { to: "/taken", label: "Taken", icon: "📋" },
  { to: "/tips", label: "Tips", icon: "📖" },
  { to: "/dagboek", label: "Dagboek", icon: "📔" },
  { to: "/instellingen", label: "Instellingen", icon: "⚙️" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

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
          Uitloggen
        </button>
      </div>
    </nav>
  );
}
