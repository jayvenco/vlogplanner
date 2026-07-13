import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import type { ContentTemplate, IdeaCardType, KanbanColumn, TargetAge } from "../types";
import KanbanBoard from "../components/KanbanBoard";
import IdeaDetailModal from "../components/IdeaDetailModal";

export default function Ideas() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<IdeaCardType[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [themeFilter, setThemeFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState<TargetAge | "">("");

  useEffect(() => {
    api.get<IdeaCardType[]>("/api/ideas").then(setIdeas);
    api.get<ContentTemplate[]>("/api/templates").then(setTemplates);
  }, []);

  async function handlePersist(idea: IdeaCardType) {
    await api.put(`/api/ideas/${idea.id}`, { column: idea.column, order: idea.order });
  }

  async function handleDelete(idea: IdeaCardType) {
    await api.delete(`/api/ideas/${idea.id}`);
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    if (selectedId === idea.id) setSelectedId(null);
  }

  async function handleAddCard(column: KanbanColumn, title: string) {
    const created = await api.post<IdeaCardType>("/api/ideas", { title, column });
    setIdeas((prev) => [...prev, created]);
  }

  function handleLocalUpdate(patch: Partial<IdeaCardType>) {
    if (selectedId == null) return;
    setIdeas((prev) => prev.map((i) => (i.id === selectedId ? { ...i, ...patch } : i)));
  }

  async function handlePersistUpdate(patch: Partial<IdeaCardType>) {
    if (selectedId == null) return;
    const updated = await api.put<IdeaCardType>(`/api/ideas/${selectedId}`, patch);
    setIdeas((prev) => prev.map((i) => (i.id === selectedId ? updated : i)));
  }

  function handleUpdate(patch: Partial<IdeaCardType>) {
    handleLocalUpdate(patch);
    handlePersistUpdate(patch);
  }

  async function handleGenerate(kind: string) {
    if (selectedId == null) return;
    const updated = await api.post<IdeaCardType>(`/api/ideas/${selectedId}/generate`, { kind });
    setIdeas((prev) => prev.map((i) => (i.id === selectedId ? updated : i)));
  }

  const themes = Array.from(new Set(ideas.map((i) => i.theme).filter((v): v is string => Boolean(v))));
  const filteredIdeas = ideas.filter((i) => {
    if (themeFilter && i.theme !== themeFilter) return false;
    if (ageFilter && i.target_age !== ageFilter) return false;
    return true;
  });

  const selectedIdea = ideas.find((i) => i.id === selectedId) || null;

  return (
    <div>
      <div className="page-header">
        <h1>{t.ideas.pageTitle}</h1>
      </div>

      <div className="card idea-filter-bar" style={{ marginBottom: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <label>
          {t.ideas.filterTheme}{" "}
          <select value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
            <option value="">{t.ideas.allThemes}</option>
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.ideas.filterAge}{" "}
          <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value as TargetAge | "")}>
            <option value="">{t.ideas.allAges}</option>
            {(["13-17", "18-24", "25-34", "35+"] as TargetAge[]).map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </label>
      </div>

      <KanbanBoard
        ideas={filteredIdeas}
        onReorder={setIdeas}
        onPersist={handlePersist}
        onDelete={handleDelete}
        onAddCard={handleAddCard}
        onCardClick={(idea) => setSelectedId(idea.id)}
      />

      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          templates={templates}
          hasLlmKey={Boolean(user?.has_llm_key)}
          onClose={() => setSelectedId(null)}
          onUpdate={handleUpdate}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
}
