import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import type { ContentTemplate, IdeaCardType, TargetAge } from "../types";

const TARGET_AGES: TargetAge[] = ["13-17", "18-24", "25-34", "35+"];
const GENERATION_KINDS = ["script", "titles", "thumbnail_text", "description", "hashtags"] as const;
type GenerationKind = (typeof GENERATION_KINDS)[number];

interface Props {
  idea: IdeaCardType;
  templates: ContentTemplate[];
  hasLlmKey: boolean;
  onClose: () => void;
  onUpdate: (patch: Partial<IdeaCardType>) => void;
  onGenerate: (kind: GenerationKind) => Promise<void>;
}

export default function IdeaDetailModal({ idea, templates, hasLlmKey, onClose, onUpdate, onGenerate }: Props) {
  const { t } = useLanguage();
  const [generatingKind, setGeneratingKind] = useState<GenerationKind | null>(null);

  const saveDebounced = useDebouncedCallback((patch: Partial<IdeaCardType>) => onUpdate(patch), 800);

  const GENERATE_LABELS: Record<GenerationKind, string> = {
    script: t.ideas.generateScript,
    titles: t.ideas.generateTitles,
    thumbnail_text: t.ideas.generateThumbnailText,
    description: t.ideas.generateDescription,
    hashtags: t.ideas.generateHashtags,
  };

  async function handleGenerate(kind: GenerationKind) {
    setGeneratingKind(kind);
    try {
      await onGenerate(kind);
    } finally {
      setGeneratingKind(null);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal idea-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t.ideas.modalTitle}</h2>
          <button className="ghost small" onClick={onClose} aria-label={t.common.close}>
            ✕
          </button>
        </div>

        <div className="idea-modal-body">
          <label>
            {t.ideas.titleLabel}
            <input
              type="text"
              value={idea.title}
              onChange={(e) => {
                onUpdate({ title: e.target.value });
              }}
              onBlur={(e) => saveDebounced({ title: e.target.value })}
            />
          </label>

          <label>
            {t.ideas.descriptionLabel}
            <textarea
              rows={2}
              value={idea.description}
              onChange={(e) => {
                onUpdate({ description: e.target.value });
                saveDebounced({ description: e.target.value });
              }}
            />
          </label>

          <div className="idea-modal-row">
            <label>
              {t.ideas.themeLabel}
              <input
                type="text"
                value={idea.theme || ""}
                onChange={(e) => {
                  onUpdate({ theme: e.target.value });
                  saveDebounced({ theme: e.target.value });
                }}
              />
            </label>

            <label>
              {t.ideas.ageLabel}
              <select
                value={idea.target_age || ""}
                onChange={(e) => onUpdate({ target_age: (e.target.value || null) as TargetAge | null })}
              >
                <option value="">—</option>
                {TARGET_AGES.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.ideas.dateLabel}
              <input
                type="date"
                value={idea.estimated_date || ""}
                onChange={(e) => onUpdate({ estimated_date: e.target.value || null })}
              />
            </label>
          </div>

          <label>
            {t.ideas.templateLabel}
            <select
              value={idea.template_key || ""}
              onChange={(e) => onUpdate({ template_key: e.target.value || null })}
            >
              <option value="">{t.ideas.noTemplate}</option>
              {templates.map((tpl) => (
                <option key={tpl.key} value={tpl.key}>
                  {tpl.icon} {tpl.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t.ideas.notesLabel}
            <textarea
              rows={2}
              value={idea.note}
              onChange={(e) => {
                onUpdate({ note: e.target.value });
                saveDebounced({ note: e.target.value });
              }}
            />
          </label>

          <div className="idea-ai-section">
            <h3>{t.ideas.aiSectionTitle}</h3>
            {!hasLlmKey && <p className="error-text">{t.ideas.aiDisabledMessage}</p>}
            <div className="ai-generate-grid">
              {GENERATION_KINDS.map((kind) => (
                <button
                  key={kind}
                  className="secondary"
                  disabled={!hasLlmKey || generatingKind !== null}
                  onClick={() => handleGenerate(kind)}
                >
                  {generatingKind === kind ? t.ideas.generating : idea.ai_generations[kind] ? `↻ ${GENERATE_LABELS[kind]}` : GENERATE_LABELS[kind]}
                </button>
              ))}
            </div>
            {GENERATION_KINDS.map(
              (kind) =>
                idea.ai_generations[kind] && (
                  <div key={kind} className="ai-result">
                    <strong>{GENERATE_LABELS[kind]}</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>{idea.ai_generations[kind]}</p>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
