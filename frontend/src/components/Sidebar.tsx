import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_GROUPS: { heading?: string; items: { to: string; label: string; end?: boolean }[] }[] = [
    { items: [{ to: "/", label: t.sidebar.dashboard, end: true }] },
    {
      heading: t.sidebar.groupWork,
      items: [
        { to: "/projecten", label: t.sidebar.projects },
        { to: "/checklist", label: t.sidebar.checklist },
        { to: "/video-planner", label: t.sidebar.videoPlanner },
      ],
    },
    {
      heading: t.sidebar.groupPlan,
      items: [
        { to: "/ideeen", label: t.sidebar.ideas },
        { to: "/templates", label: t.sidebar.templates },
        { to: "/trends", label: t.sidebar.trends },
        { to: "/inspiratie", label: t.sidebar.inspiration },
      ],
    },
    {
      heading: t.sidebar.groupTrack,
      items: [
        { to: "/taken", label: t.sidebar.tasks },
        { to: "/dagboek", label: t.sidebar.diary },
        { to: "/tips", label: t.sidebar.tips },
      ],
    },
    { items: [{ to: "/instellingen", label: t.sidebar.settings }] },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <img src={user?.logo_path || "/logo-icon.png"} alt="" className="sidebar-mark" />
        <span>VlogPlanner</span>
      </div>
      <div className="sidebar-links">
        {NAV_GROUPS.map((group, index) => (
          <div key={group.heading ?? index} className="sidebar-group">
            {group.heading && <div className="sidebar-group-label">{group.heading}</div>}
            {group.items.map((item) => (
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
