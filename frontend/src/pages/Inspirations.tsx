import { FormEvent, useEffect, useRef, useState } from "react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh(tag?: string) {
    const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
    api.get<Inspiration[]>(`/api/inspirations${query}`).then(setItems);
  }

  useEffect(() => refresh(), []);

  function resetForm() {
    setContent("");
    setTags("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (type === "image") {
      if (!imageFile) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("tags", tags);
        formData.append("file", imageFile);
        await api.post("/api/inspirations/with-image", formData);
        resetForm();
        refresh(tagFilter);
      } finally {
        setUploading(false);
      }
      return;
    }
    if (!content.trim()) return;
    await api.post("/api/inspirations", { type, content, tags });
    resetForm();
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

  const typeLabel: Record<InspirationType, string> = {
    link: t.inspiration.typeLink,
    screenshot_note: t.inspiration.typeScreenshot,
    quote: t.inspiration.typeQuote,
    image: t.inspiration.typeImage,
  };

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
          <option value="image">{t.inspiration.typeImage}</option>
        </select>
        {type === "image" ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <button type="button" className="secondary" onClick={() => fileInputRef.current?.click()}>
              {imageFile ? imageFile.name : t.inspiration.uploadImage}
            </button>
            <input
              type="text"
              placeholder={t.inspiration.imageCaptionPlaceholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <textarea
            rows={2}
            placeholder={t.inspiration.contentPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}
        <input
          type="text"
          placeholder={t.inspiration.tagsPlaceholder}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? t.inspiration.uploading : t.inspiration.add}
        </button>
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
            <div>
              <span className="chip" style={{ marginRight: "0.6rem" }}>{typeLabel[item.type]}</span>
              {item.type !== "image" && <strong>{item.content}</strong>}
            </div>
            <button className="ghost small" onClick={() => handleDelete(item)} aria-label={t.common.remove}>
              ✕
            </button>
          </div>
          {item.type === "image" && item.image_path && (
            <div style={{ marginBottom: "0.5rem" }}>
              <img src={item.image_path} alt={item.content || t.inspiration.typeImage} className="thumbnail-preview" />
              {item.content && <p style={{ margin: "0.5rem 0 0" }}>{item.content}</p>}
            </div>
          )}
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
