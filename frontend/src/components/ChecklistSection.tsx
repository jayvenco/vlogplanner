import { useState } from "react";
import type { ChecklistItem, ChecklistSection as ChecklistSectionType } from "../types";
import { useLanguage } from "../context/LanguageContext";

const SECTION_ORDER: ChecklistSectionType[] = ["voorbereiding", "tijdens_filmen", "na_filmen"];

interface Props {
  items: ChecklistItem[];
  onToggle: (item: ChecklistItem) => void;
  onAdd: (section: ChecklistSectionType, text: string) => void;
  onDelete: (item: ChecklistItem) => void;
}

export default function ChecklistSection({ items, onToggle, onAdd, onDelete }: Props) {
  const { t } = useLanguage();
  const [newTexts, setNewTexts] = useState<Record<string, string>>({});

  const SECTION_TITLES: Record<ChecklistSectionType, string> = {
    voorbereiding: t.checklist.sectionPrep,
    tijdens_filmen: t.checklist.sectionFilming,
    na_filmen: t.checklist.sectionAfter,
  };

  function submitNewItem(section: ChecklistSectionType) {
    const text = (newTexts[section] || "").trim();
    if (!text) return;
    onAdd(section, text);
    setNewTexts((prev) => ({ ...prev, [section]: "" }));
  }

  return (
    <div className="checklist">
      {SECTION_ORDER.map((section) => {
        const sectionItems = items.filter((i) => i.section === section);
        return (
          <div key={section} className="checklist-section card">
            <h3>{SECTION_TITLES[section]}</h3>
            <ul>
              {sectionItems.map((item) => (
                <li key={item.id} className={item.is_checked ? "checked" : ""}>
                  <label>
                    <input type="checkbox" checked={item.is_checked} onChange={() => onToggle(item)} />
                    <span>{item.text}</span>
                  </label>
                  {item.is_custom && (
                    <button className="ghost small" onClick={() => onDelete(item)} aria-label={t.common.remove}>
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="checklist-add">
              <input
                type="text"
                placeholder={t.checklist.addPlaceholder}
                value={newTexts[section] || ""}
                onChange={(e) => setNewTexts((prev) => ({ ...prev, [section]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && submitNewItem(section)}
              />
              <button className="secondary" onClick={() => submitNewItem(section)}>
                {t.checklist.add}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
