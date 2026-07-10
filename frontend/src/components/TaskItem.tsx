import type { TaskType } from "../types";

const PRIORITY_LABELS: Record<TaskType["priority"], string> = {
  hoog: "🔴 Hoog",
  normaal: "🟡 Normaal",
  laag: "🟢 Laag",
};

interface Props {
  task: TaskType;
  onToggle: (task: TaskType) => void;
  onDelete: (task: TaskType) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <div className={"task-item card" + (task.is_done ? " done" : "")}>
      <label>
        <input type="checkbox" checked={task.is_done} onChange={() => onToggle(task)} />
        <span className="task-title">{task.title}</span>
      </label>
      <div className="task-meta">
        <span className={`priority-chip priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
        {task.deadline && <span className="deadline-chip">📅 {task.deadline}</span>}
        <button className="ghost small" onClick={() => onDelete(task)} aria-label="Verwijderen">
          ✕
        </button>
      </div>
    </div>
  );
}
