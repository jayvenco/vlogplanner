import type { ProjectStatus } from "../types";
import { useLanguage } from "../context/LanguageContext";

export const STATUS_OPTIONS: ProjectStatus[] = ["idee", "script", "opnemen", "bewerken", "klaar", "gepubliceerd"];

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useLanguage();
  return <span className={`status-badge status-${status}`}>{t.statusBadge[status]}</span>;
}
