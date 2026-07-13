import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { Dashboard as DashboardData } from "../types";
import MotivationalQuote from "../components/MotivationalQuote";
import ProjectCard from "../components/ProjectCard";
import BadgeList from "../components/BadgeList";

export default function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/api/dashboard").then(setData);
  }, []);

  if (!data) return <p>{t.common.loading}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{t.dashboard.title}</h1>
      </div>
      <MotivationalQuote text={data.quote} />

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-value">{data.project_count}</div>
          <div className="stat-label">{t.dashboard.projects}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{data.open_task_count}</div>
          <div className="stat-label">{t.dashboard.openTasks}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{data.idea_count}</div>
          <div className="stat-label">{t.dashboard.ideas}</div>
        </div>
      </div>

      {data.latest_project && (
        <>
          <h2>{t.dashboard.latestProject}</h2>
          <div className="project-grid" style={{ marginBottom: "1.5rem" }}>
            <ProjectCard project={data.latest_project} />
          </div>
        </>
      )}

      <h2>{t.dashboard.badges}</h2>
      <BadgeList badges={data.badges} />

      {data.project_count === 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <p>{t.dashboard.startToday}</p>
          <Link to="/projecten">
            <button>{t.dashboard.startFirstProject}</button>
          </Link>
        </div>
      )}
    </div>
  );
}
