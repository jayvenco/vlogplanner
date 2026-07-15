import { Link } from "react-router-dom";
import type { Project } from "../types";
import { useLanguage } from "../context/LanguageContext";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export default function ProjectCard({ project }: { project: Project }) {
  const { t } = useLanguage();
  return (
    <Link to={`/projecten/${project.id}`} className="project-card">
      <div className="project-card-thumb">
        {project.thumbnail_path ? (
          <img src={project.thumbnail_path} alt={project.title} />
        ) : (
          <span className="project-card-thumb-placeholder">{project.title.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p>{project.description || t.common.noDescription}</p>
        <StatusBadge status={project.status} />
        <ProgressBar percent={project.checklist_progress} />
      </div>
    </Link>
  );
}
