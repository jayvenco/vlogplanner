import { useState } from "react";
import type { ProjectTemplate, ProjectTip } from "../types";

interface Props {
  template: ProjectTemplate;
  tips: ProjectTip[];
  onFieldChange: (field: keyof ProjectTemplate, value: string) => void;
  onAskTip: (question: string) => Promise<void>;
}

const FIELDS: { key: keyof ProjectTemplate; label: string; placeholder: string }[] = [
  { key: "thema", label: "🎯 Thema", placeholder: "Waar gaat deze video over?" },
  { key: "bronnen", label: "📚 Bronnen", placeholder: "Welke bronnen gebruik je? (websites, boeken, mensen...)" },
  { key: "afbeeldingen_ideeen", label: "🖼️ Afbeeldingen-ideeën", placeholder: "Welke plaatjes of shots wil je gebruiken?" },
  { key: "inspiratie_urls", label: "🔗 URLs voor inspiratie", placeholder: "Links naar video's of pagina's die je inspireren" },
];

const OPBOUW_FIELDS: { key: keyof ProjectTemplate; label: string; hint: string }[] = [
  { key: "intro_uitleg", label: "🎬 Intro", hint: "Wie ben je en wat ga je vandaag laten zien?" },
  { key: "midden_uitleg", label: "🌟 Midden", hint: "Wat gebeurt er in het grootste deel van je video?" },
  { key: "einde_uitleg", label: "🏁 Einde", hint: "Wat vertel je aan het einde? Bedank je de kijker?" },
];

export default function TemplateEditor({ template, tips, onFieldChange, onAskTip }: Props) {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      await onAskTip(question);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon geen tip ophalen.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="template-editor">
      <div className="card">
        <h3>🧭 Leidraad</h3>
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
        <h3>🎞️ Opbouw van je vlog</h3>
        {OPBOUW_FIELDS.map((field) => (
          <div key={field.key} className="template-field">
            <label>
              {field.label} <span className="template-hint">{field.hint}</span>
            </label>
            <textarea
              rows={2}
              placeholder="Schrijf hier wat er in dit deel gebeurt..."
              value={template[field.key]}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="card">
        <h3>🤖 Vraag GPT om tips</h3>
        <textarea
          rows={2}
          placeholder="Bijvoorbeeld: hoe maak ik een leuke intro voor deze video?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={handleAsk} disabled={asking} style={{ marginTop: "0.6rem" }}>
          {asking ? "Even denken..." : "✨ Vraag tip"}
        </button>
        {error && <p className="error-text">{error}</p>}

        {tips.length > 0 && (
          <div className="tip-history">
            {tips.map((tip) => (
              <div key={tip.id} className="tip-item">
                <p className="tip-question">❓ {tip.question}</p>
                <p className="tip-answer">💡 {tip.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
