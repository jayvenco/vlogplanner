import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Project } from "../types";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
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
        <h1>🎬 Mijn Projecten</h1>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? "Annuleren" : "+ Nieuw project"}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <input
            type="text"
            placeholder="Titel van je video"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Waar gaat je video over?"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Bezig..." : "Project aanmaken"}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <p>Je hebt nog geen projecten. Begin vandaag met iets leuks!</p>
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
