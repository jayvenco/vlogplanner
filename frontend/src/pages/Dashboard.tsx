import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Dashboard as DashboardData } from "../types";
import MotivationalQuote from "../components/MotivationalQuote";
import ProjectCard from "../components/ProjectCard";
import BadgeList from "../components/BadgeList";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/api/dashboard").then(setData);
  }, []);

  if (!data) return <p>Laden...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>🏠 Dashboard</h1>
      </div>
      <MotivationalQuote text={data.quote} />

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-value">{data.project_count}</div>
          <div className="stat-label">Projecten</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{data.open_task_count}</div>
          <div className="stat-label">Open taken</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{data.idea_count}</div>
          <div className="stat-label">Ideeën</div>
        </div>
      </div>

      {data.latest_project && (
        <>
          <h2>Laatste project</h2>
          <div className="project-grid" style={{ marginBottom: "1.5rem" }}>
            <ProjectCard project={data.latest_project} />
          </div>
        </>
      )}

      <h2>🏅 Badges</h2>
      <BadgeList badges={data.badges} />

      {data.project_count === 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <p>Begin vandaag met iets leuks!</p>
          <Link to="/projecten">
            <button>+ Start je eerste project</button>
          </Link>
        </div>
      )}
    </div>
  );
}
