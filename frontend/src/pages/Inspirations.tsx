import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { Inspiration, InspirationType } from "../types";

export default function Inspirations() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Inspiration[]>([]);
  const [type, setType] = useState<InspirationType>("link");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  function refresh(tag?: string) {
    const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
    api.get<Inspiration[]>(`/api/inspirations${query}`).then(setItems);
  }

  useEffect(() => refresh(), []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await api.post("/api/inspirations", { type, content, tags });
    setContent("");
    setTags("");
    refresh(tagFilter);
  }

  async function handleDelete(item: Inspiration) {
    await api.delete(`/api/inspirations/${item.id}`);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  function handleFilterChange(value: string) {
    setTagFilter(value);
    refresh(value);
  }

  const typeIcon: Record<InspirationType, string> = { link: "🔗", screenshot_note: "🖼️", quote: "💬" };

  return (
    <div>
      <div className="page-header">
        <h1>{t.inspiration.pageTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <select value={type} onChange={(e) => setType(e.target.value as InspirationType)}>
          <option value="link">{t.inspiration.typeLink}</option>
          <option value="screenshot_note">{t.inspiration.typeScreenshot}</option>
          <option value="quote">{t.inspiration.typeQuote}</option>
        </select>
        <textarea
          rows={2}
          placeholder={t.inspiration.contentPlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder={t.inspiration.tagsPlaceholder}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit">{t.inspiration.add}</button>
      </form>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <label>
          {t.inspiration.filterByTag}{" "}
          <input type="text" value={tagFilter} onChange={(e) => handleFilterChange(e.target.value)} />
        </label>
      </div>

      {items.length === 0 && <p>{t.inspiration.empty}</p>}
      {items.map((item) => (
        <div key={item.id} className="card" style={{ marginBottom: "1rem" }}>
          <div className="page-header" style={{ marginBottom: "0.5rem" }}>
            <strong>{typeIcon[item.type]} {item.content}</strong>
            <button className="ghost small" onClick={() => handleDelete(item)} aria-label={t.common.remove}>
              ✕
            </button>
          </div>
          {item.tags && (
            <div className="kanban-card-chips">
              {item.tags.split(",").map((tag) => (
                <span key={tag} className="chip">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
