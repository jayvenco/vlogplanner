import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getToken, ApiError } from "../api/client";
import type {
  ChecklistItem,
  ChecklistSection as ChecklistSectionType,
  DiaryEntry,
  ProjectDetail as ProjectDetailType,
  ProjectTemplate,
  ProjectTip,
  StoryboardScene,
} from "../types";
import StatusBadge, { STATUS_OPTIONS } from "../components/StatusBadge";
import ProgressBar from "../components/ProgressBar";
import ThumbnailUpload from "../components/ThumbnailUpload";
import ChecklistSection from "../components/ChecklistSection";
import StoryboardEditor from "../components/StoryboardEditor";
import TemplateEditor from "../components/TemplateEditor";
import YoutubeLink from "../components/YoutubeLink";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";

type Tab = "overzicht" | "checklist" | "storyboard" | "sjabloon" | "dagboek";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailType | null>(null);
  const [tab, setTab] = useState<Tab>("overzicht");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [diaryGoed, setDiaryGoed] = useState("");
  const [diaryBeter, setDiaryBeter] = useState("");
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [tips, setTips] = useState<ProjectTip[]>([]);

  const load = useCallback(() => {
    api.get<ProjectDetailType>(`/api/projects/${id}`).then((p) => {
      setProject(p);
      setTitle(p.title);
      setDescription(p.description);
    });
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (tab === "dagboek") {
      api.get<DiaryEntry[]>(`/api/diary?project_id=${id}`).then(setDiaryEntries);
    }
    if (tab === "sjabloon") {
      api.get<ProjectTemplate>(`/api/projects/${id}/template`).then(setTemplate);
      api.get<ProjectTip[]>(`/api/projects/${id}/tips`).then(setTips);
    }
  }, [tab, id]);

  const saveTextFields = useDebouncedCallback(async (newTitle: string, newDescription: string) => {
    await api.put(`/api/projects/${id}`, { title: newTitle, description: newDescription });
  }, 800);

  function handleTitleChange(value: string) {
    setTitle(value);
    saveTextFields(value, description);
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    saveTextFields(title, value);
  }

  async function handleStatusChange(status: string) {
    const updated = await api.put<ProjectDetailType>(`/api/projects/${id}`, { status });
    setProject(updated);
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit project wilt verwijderen?")) return;
    await api.delete(`/api/projects/${id}`);
    navigate("/projecten");
  }

  async function handleToggleChecklist(item: ChecklistItem) {
    await api.put(`/api/checklist/${item.id}`, { is_checked: !item.is_checked });
    load();
  }

  async function handleAddChecklistItem(section: ChecklistSectionType, text: string) {
    await api.post(`/api/projects/${id}/checklist`, { section, text });
    load();
  }

  async function handleDeleteChecklistItem(item: ChecklistItem) {
    await api.delete(`/api/checklist/${item.id}`);
    load();
  }

  const saveStoryboard = useDebouncedCallback(async (scenes: StoryboardScene[]) => {
    await api.put(`/api/projects/${id}/storyboard`, scenes.map((s) => ({ id: s.id, title: s.title, notes: s.notes })));
  }, 800);

  function handleStoryboardChange(sceneId: number, field: "title" | "notes", value: string) {
    if (!project) return;
    const updatedScenes = project.storyboard_scenes.map((s) => (s.id === sceneId ? { ...s, [field]: value } : s));
    setProject({ ...project, storyboard_scenes: updatedScenes });
    saveStoryboard(updatedScenes);
  }

  const saveTemplate = useDebouncedCallback(async (updated: ProjectTemplate) => {
    await api.put(`/api/projects/${id}/template`, updated);
  }, 800);

  function handleTemplateFieldChange(field: keyof ProjectTemplate, value: string) {
    if (!template) return;
    const updated = { ...template, [field]: value };
    setTemplate(updated);
    saveTemplate(updated);
  }

  async function handleAskTip(question: string) {
    try {
      const tip = await api.post<ProjectTip>(`/api/projects/${id}/tips`, { question });
      setTips((prev) => [tip, ...prev]);
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : "Kon geen tip ophalen.");
    }
  }

  async function handleAddDiaryEntry() {
    if (!diaryGoed.trim() && !diaryBeter.trim()) return;
    await api.post("/api/diary", {
      project_id: Number(id),
      wat_ging_goed: diaryGoed,
      wat_kan_beter: diaryBeter,
    });
    setDiaryGoed("");
    setDiaryBeter("");
    const entries = await api.get<DiaryEntry[]>(`/api/diary?project_id=${id}`);
    setDiaryEntries(entries);
  }

  async function handleExportPdf() {
    const response = await fetch(`/api/projects/${id}/export/pdf`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "project"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!project) return <p>Laden...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{project.title}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="secondary" onClick={handleExportPdf}>
            📄 Exporteer PDF
          </button>
          <button className="danger" onClick={handleDelete}>
            🗑️ Verwijderen
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["overzicht", "checklist", "storyboard", "sjabloon", "dagboek"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "" : "ghost"} onClick={() => setTab(t)}>
            {t === "overzicht" && "📋 Overzicht"}
            {t === "checklist" && "✅ Checklist"}
            {t === "storyboard" && "🎞️ Storyboard"}
            {t === "sjabloon" && "🧭 Sjabloon"}
            {t === "dagboek" && "📔 Dagboek"}
          </button>
        ))}
      </div>

      {tab === "overzicht" && (
        <div className="card" style={{ display: "grid", gap: "1rem" }}>
          <ThumbnailUpload
            projectId={project.id}
            thumbnailPath={project.thumbnail_path}
            onUploaded={(path) => setProject({ ...project, thumbnail_path: path })}
          />
          <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} />
          <textarea rows={3} value={description} onChange={(e) => handleDescriptionChange(e.target.value)} />
          <div>
            <label>
              Status:{" "}
              <select value={project.status} onChange={(e) => handleStatusChange(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <StatusBadge status={project.status} />
          </div>
          <div>
            <p>Checklist voortgang</p>
            <ProgressBar percent={project.checklist_progress} />
          </div>
        </div>
      )}

      {tab === "overzicht" && project.status === "gepubliceerd" && (
        <YoutubeLink
          project={project}
          onLinked={(video) => setProject({ ...project, ...video })}
        />
      )}

      {tab === "checklist" && (
        <ChecklistSection
          items={project.checklist_items}
          onToggle={handleToggleChecklist}
          onAdd={handleAddChecklistItem}
          onDelete={handleDeleteChecklistItem}
        />
      )}

      {tab === "storyboard" && <StoryboardEditor scenes={project.storyboard_scenes} onChange={handleStoryboardChange} />}

      {tab === "sjabloon" &&
        (template ? (
          <TemplateEditor template={template} tips={tips} onFieldChange={handleTemplateFieldChange} onAskTip={handleAskTip} />
        ) : (
          <p>Laden...</p>
        ))}

      {tab === "dagboek" && (
        <div>
          <div className="card" style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <textarea
              placeholder="Wat ging er goed?"
              rows={2}
              value={diaryGoed}
              onChange={(e) => setDiaryGoed(e.target.value)}
            />
            <textarea
              placeholder="Wat kan er beter?"
              rows={2}
              value={diaryBeter}
              onChange={(e) => setDiaryBeter(e.target.value)}
            />
            <button onClick={handleAddDiaryEntry}>+ Toevoegen aan dagboek</button>
          </div>
          {diaryEntries.map((entry) => (
            <div key={entry.id} className="card" style={{ marginBottom: "1rem" }}>
              <strong>{entry.entry_date}</strong>
              <p>👍 {entry.wat_ging_goed || "-"}</p>
              <p>💡 {entry.wat_kan_beter || "-"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
