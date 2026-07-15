import { useState } from "react";
import type { ProjectTemplate, ProjectTip } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  template: ProjectTemplate;
  tips: ProjectTip[];
  onFieldChange: (field: keyof ProjectTemplate, value: string) => void;
  onAskTip: (question: string) => Promise<void>;
}

export default function TemplateEditor({ template, tips, onFieldChange, onAskTip }: Props) {
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FIELDS: { key: keyof ProjectTemplate; label: string; placeholder: string }[] = [
    { key: "thema", label: t.projectTemplate.themeLabel, placeholder: t.projectTemplate.themePlaceholder },
    { key: "bronnen", label: t.projectTemplate.sourcesLabel, placeholder: t.projectTemplate.sourcesPlaceholder },
    { key: "afbeeldingen_ideeen", label: t.projectTemplate.imagesLabel, placeholder: t.projectTemplate.imagesPlaceholder },
    { key: "inspiratie_urls", label: t.projectTemplate.urlsLabel, placeholder: t.projectTemplate.urlsPlaceholder },
  ];

  const OPBOUW_FIELDS: { key: keyof ProjectTemplate; label: string; hint: string }[] = [
    { key: "intro_uitleg", label: t.projectTemplate.introLabel, hint: t.projectTemplate.introHint },
    { key: "midden_uitleg", label: t.projectTemplate.middleLabel, hint: t.projectTemplate.middleHint },
    { key: "einde_uitleg", label: t.projectTemplate.endLabel, hint: t.projectTemplate.endHint },
  ];

  async function handleAsk() {
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      await onAskTip(question);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.projectTemplate.askAiError);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="template-editor">
      <div className="card">
        <h3>{t.projectTemplate.guideTitle}</h3>
        {FIELDS.map((field) => (
          <div key={field.key} className="template-field">
            <label>{field.label}</label>
            <textarea
              rows={2}
              placeholder={field.placeholder}
              value={template[field.key]}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="card">
        <h3>{t.projectTemplate.buildupTitle}</h3>
        {OPBOUW_FIELDS.map((field) => (
          <div key={field.key} className="template-field">
            <label>
              {field.label} <span className="template-hint">{field.hint}</span>
            </label>
            <textarea
              rows={2}
              placeholder={t.projectTemplate.sectionPlaceholder}
              value={template[field.key]}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="card">
        <h3>{t.projectTemplate.askAiTitle}</h3>
        <textarea
          rows={2}
          placeholder={t.projectTemplate.askAiPlaceholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={handleAsk} disabled={asking} style={{ marginTop: "0.6rem" }}>
          {asking ? t.projectTemplate.askAiThinking : t.projectTemplate.askAiButton}
        </button>
        {error && <p className="error-text">{error}</p>}

        {tips.length > 0 && (
          <div className="tip-history">
            {tips.map((tip) => (
              <div key={tip.id} className="tip-item">
                <p className="tip-question">{tip.question}</p>
                <p className="tip-answer">{tip.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
