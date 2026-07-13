import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { Project } from "../types";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function refresh() {
    api.get<Project[]>("/api/projects").then(setProjects);
  }

  useEffect(refresh, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post("/api/projects", { title, description });
      setTitle("");
      setDescription("");
      setShowForm(false);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.projects.title}</h1>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? t.projects.cancel : t.projects.newProject}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <input
            type="text"
            placeholder={t.projects.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder={t.projects.descriptionPlaceholder}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? t.projects.creating : t.projects.createProject}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <p>{t.projects.empty}</p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
