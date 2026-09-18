import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { DiaryEntry, Project } from "../types";

export default function Diary() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [goed, setGoed] = useState("");
  const [beter, setBeter] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    setProjectId("");
    setShowForm(false);
    refresh();
  }

  function projectTitle(id: number | null) {
    if (id == null) return null;
    return projects.find((p) => p.id === id)?.title;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.diary.title}</h1>
        {!showForm && <button onClick={() => setShowForm(true)}>{t.diary.newEntry}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">{t.diary.noSpecificProject}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <textarea placeholder={t.diary.goodPlaceholder} rows={2} value={goed} onChange={(e) => setGoed(e.target.value)} />
          <textarea placeholder={t.diary.betterPlaceholder} rows={2} value={beter} onChange={(e) => setBeter(e.target.value)} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit">{t.diary.add}</button>
            <button type="button" className="ghost" onClick={() => setShowForm(false)}>
              {t.common.cancel}
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 && <p>{t.diary.empty}</p>}
      {entries.length > 0 && (
        <div className="diary-list">
          {entries.map((entry) => (
            <div key={entry.id} className="diary-entry-row">
              <span className="diary-entry-date">
                {entry.entry_date}
                {projectTitle(entry.project_id) && ` · ${projectTitle(entry.project_id)}`}
              </span>
              <span>
                <span className="entry-label">{t.diary.goodLabel}:</span> {entry.wat_ging_goed || "-"}
              </span>
              <span>
                <span className="entry-label">{t.diary.betterLabel}:</span> {entry.wat_kan_beter || "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
