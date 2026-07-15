import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { ContentTemplate } from "../types";

export default function Templates() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);

  useEffect(() => {
    api.get<ContentTemplate[]>("/api/templates").then(setTemplates);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>{t.templatesLibrary.pageTitle}</h1>
      </div>

      {templates.map((tpl) => (
        <div key={tpl.key} className="card template-library-card" style={{ marginBottom: "1.5rem" }}>
          <h2>
            {tpl.name}
          </h2>

          <div className="template-structure">
            <p>
              <strong>Hook:</strong> {tpl.structure.hook}
            </p>
            <p>
              <strong>Intro:</strong> {tpl.structure.intro}
            </p>
            <p>
              <strong>Body:</strong> {tpl.structure.body}
            </p>
            <p>
              <strong>CTA:</strong> {tpl.structure.cta}
            </p>
            <p>
              <strong>Outro:</strong> {tpl.structure.outro}
            </p>
          </div>

          <p>
            <strong>{t.templatesLibrary.recommendedLength}:</strong> {tpl.recommended_length}
          </p>
          <p>
            <strong>{t.templatesLibrary.thumbnailTips}:</strong> {tpl.thumbnail_tips}
          </p>

          <p>
            <strong>{t.templatesLibrary.titleFormulas}:</strong>
          </p>
          <ul>
            {tpl.title_formulas.map((formula) => (
              <li key={formula}>{formula}</li>
            ))}
          </ul>

          <div className="template-checklist-grid">
            <div>
              <strong>{t.templatesLibrary.checklistPrep}</strong>
              <ul>
                {tpl.checklist.pre_productie.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{t.templatesLibrary.checklistFilming}</strong>
              <ul>
                {tpl.checklist.opname.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{t.templatesLibrary.checklistEditing}</strong>
              <ul>
                {tpl.checklist.montage.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{t.templatesLibrary.checklistPublishing}</strong>
              <ul>
                {tpl.checklist.publicatie.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
