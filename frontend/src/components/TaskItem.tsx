import type { TaskType } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  task: TaskType;
  onToggle: (task: TaskType) => void;
  onDelete: (task: TaskType) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  const { t } = useLanguage();

  const PRIORITY_LABELS: Record<TaskType["priority"], string> = {
    hoog: t.tasks.priorityHigh,
    normaal: t.tasks.priorityNormal,
    laag: t.tasks.priorityLow,
  };

  return (
    <div className={"task-item card" + (task.is_done ? " done" : "")}>
      <label>
        <input type="checkbox" checked={task.is_done} onChange={() => onToggle(task)} />
        <span className="task-title">{task.title}</span>
      </label>
      <div className="task-meta">
        <span className={`priority-chip priority-${task.priority}`}>
          <span className="priority-dot" />
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.deadline && <span className="deadline-chip">{task.deadline}</span>}
        <button className="ghost small" onClick={() => onDelete(task)} aria-label={t.common.remove}>
          ✕
        </button>
      </div>
    </div>
  );
}
