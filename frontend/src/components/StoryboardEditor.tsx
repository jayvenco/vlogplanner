import type { StoryboardScene, StoryboardBlock } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  scenes: StoryboardScene[];
  onChange: (sceneId: number, field: "title" | "notes", value: string) => void;
}

export default function StoryboardEditor({ scenes, onChange }: Props) {
  const { t } = useLanguage();

  const BLOCK_LABELS: Record<StoryboardBlock, string> = {
    intro: t.storyboard.intro,
    scene1: t.storyboard.scene1,
    scene2: t.storyboard.scene2,
    scene3: t.storyboard.scene3,
    einde: t.storyboard.einde,
  };

  return (
    <div className="storyboard">
      {scenes.map((scene) => (
        <div key={scene.id} className="storyboard-block card">
          <h3>{BLOCK_LABELS[scene.block]}</h3>
          <input
            type="text"
            placeholder={t.storyboard.titlePlaceholder}
            value={scene.title}
            onChange={(e) => onChange(scene.id, "title", e.target.value)}
          />
          <textarea
            placeholder={t.storyboard.notesPlaceholder}
            rows={3}
            value={scene.notes}
            onChange={(e) => onChange(scene.id, "notes", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
