import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import type { DiaryEntry, Project } from "../types";

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [goed, setGoed] = useState("");
  const [beter, setBeter] = useState("");

  function refresh() {
    api.get<DiaryEntry[]>("/api/diary").then(setEntries);
  }

  useEffect(() => {
    refresh();
    api.get<Project[]>("/api/projects").then(setProjects);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!goed.trim() && !beter.trim()) return;
    await api.post("/api/diary", {
      project_id: projectId ? Number(projectId) : null,
      wat_ging_goed: goed,
      wat_kan_beter: beter,
    });
    setGoed("");
    setBeter("");
    refresh();
  }

  function projectTitle(id: number | null) {
    if (id == null) return null;
    return projects.find((p) => p.id === id)?.title;
  }

  return (
    <div>
      <div className="page-header">
        <h1>📔 Dagboek</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Geen specifiek project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <textarea placeholder="Wat ging er goed?" rows={2} value={goed} onChange={(e) => setGoed(e.target.value)} />
        <textarea placeholder="Wat kan er beter?" rows={2} value={beter} onChange={(e) => setBeter(e.target.value)} />
        <button type="submit">+ Toevoegen aan dagboek</button>
      </form>

      {entries.length === 0 && <p>Nog geen dagboek-items. Schrijf op wat je hebt geleerd!</p>}
      {entries.map((entry) => (
        <div key={entry.id} className="card" style={{ marginBottom: "1rem" }}>
          <strong>
            {entry.entry_date}
            {projectTitle(entry.project_id) && ` · ${projectTitle(entry.project_id)}`}
          </strong>
          <p>👍 {entry.wat_ging_goed || "-"}</p>
          <p>💡 {entry.wat_kan_beter || "-"}</p>
        </div>
      ))}
    </div>
  );
}
