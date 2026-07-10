import type { ProjectStatus } from "../types";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  idee: "💭 Idee",
  script: "📝 Script",
  opnemen: "🎥 Opnemen",
  bewerken: "✂️ Bewerken",
  klaar: "🎉 Klaar",
  gepubliceerd: "📢 Gepubliceerd",
};

export const STATUS_OPTIONS: ProjectStatus[] = ["idee", "script", "opnemen", "bewerken", "klaar", "gepubliceerd"];

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>;
}
