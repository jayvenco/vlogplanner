import { useState } from "react";
import type { ChecklistItem, ChecklistSection as ChecklistSectionType } from "../types";

const SECTION_TITLES: Record<ChecklistSectionType, string> = {
  voorbereiding: "🧰 Voorbereiding",
  tijdens_filmen: "🎬 Tijdens filmen",
  na_filmen: "🪄 Na filmen",
};

const SECTION_ORDER: ChecklistSectionType[] = ["voorbereiding", "tijdens_filmen", "na_filmen"];

interface Props {
  items: ChecklistItem[];
  onToggle: (item: ChecklistItem) => void;
  onAdd: (section: ChecklistSectionType, text: string) => void;
  onDelete: (item: ChecklistItem) => void;
}

export default function ChecklistSection({ items, onToggle, onAdd, onDelete }: Props) {
  const [newTexts, setNewTexts] = useState<Record<string, string>>({});

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
                    <button className="ghost small" onClick={() => onDelete(item)} aria-label="Verwijderen">
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="checklist-add">
              <input
                type="text"
                placeholder="Extra item toevoegen..."
                value={newTexts[section] || ""}
                onChange={(e) => setNewTexts((prev) => ({ ...prev, [section]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && submitNewItem(section)}
              />
              <button className="secondary" onClick={() => submitNewItem(section)}>
                + Toevoegen
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
