import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { ChecklistItem, ChecklistSection as ChecklistSectionType, Project, ProjectDetail } from "../types";
import ChecklistSection from "../components/ChecklistSection";
import ProgressBar from "../components/ProgressBar";

export default function ChecklistPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    api.get<Project[]>("/api/projects").then((list) => {
      setProjects(list);
      if (list.length > 0) setSelectedId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    api.get<ProjectDetail>(`/api/projects/${selectedId}`).then(setDetail);
  }, [selectedId]);

  async function refresh() {
    if (selectedId == null) return;
    const updated = await api.get<ProjectDetail>(`/api/projects/${selectedId}`);
    setDetail(updated);
  }

  async function handleToggle(item: ChecklistItem) {
    await api.put(`/api/checklist/${item.id}`, { is_checked: !item.is_checked });
    refresh();
  }

  async function handleAdd(section: ChecklistSectionType, text: string) {
    if (selectedId == null) return;
    await api.post(`/api/projects/${selectedId}/checklist`, { section, text });
    refresh();
  }

  async function handleDelete(item: ChecklistItem) {
    await api.delete(`/api/checklist/${item.id}`);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.checklist.pageTitle}</h1>
      </div>

      {projects.length === 0 ? (
        <p>{t.checklist.emptyNoProjects}</p>
      ) : (
        <>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <label>
              {t.checklist.chooseProject}{" "}
              <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            {detail && (
              <div style={{ marginTop: "0.75rem" }}>
                <ProgressBar percent={detail.checklist_progress} />
              </div>
            )}
          </div>

          {detail && (
            <ChecklistSection
              items={detail.checklist_items}
              onToggle={handleToggle}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
}
