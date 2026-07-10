import type { StoryboardScene, StoryboardBlock } from "../types";

const BLOCK_LABELS: Record<StoryboardBlock, string> = {
  intro: "🎬 Intro",
  scene1: "1️⃣ Scene 1",
  scene2: "2️⃣ Scene 2",
  scene3: "3️⃣ Scene 3",
  einde: "🏁 Einde",
};

interface Props {
  scenes: StoryboardScene[];
  onChange: (sceneId: number, field: "title" | "notes", value: string) => void;
}

export default function StoryboardEditor({ scenes, onChange }: Props) {
  return (
    <div className="storyboard">
      {scenes.map((scene) => (
        <div key={scene.id} className="storyboard-block card">
          <h3>{BLOCK_LABELS[scene.block]}</h3>
          <input
            type="text"
            placeholder="Titel van deze scene"
            value={scene.title}
            onChange={(e) => onChange(scene.id, "title", e.target.value)}
          />
          <textarea
            placeholder="Notities: wat gebeurt hier?"
            rows={3}
            value={scene.notes}
            onChange={(e) => onChange(scene.id, "notes", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
