import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { TaskPriority, TaskType } from "../types";
import TaskItem from "../components/TaskItem";

export default function Tasks() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normaal");

  function refresh() {
    api.get<TaskType[]>("/api/tasks").then(setTasks);
  }

  useEffect(refresh, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/api/tasks", { title, deadline: deadline || null, priority });
    setTitle("");
    setDeadline("");
    setPriority("normaal");
    refresh();
  }

  async function handleToggle(task: TaskType) {
    await api.put(`/api/tasks/${task.id}`, { is_done: !task.is_done });
    refresh();
  }

  async function handleDelete(task: TaskType) {
    await api.delete(`/api/tasks/${task.id}`);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.tasks.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.5rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder={t.tasks.newPlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 2, minWidth: "160px" }}
          required
        />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          <option value="hoog">{t.tasks.priorityHigh}</option>
          <option value="normaal">{t.tasks.priorityNormal}</option>
          <option value="laag">{t.tasks.priorityLow}</option>
        </select>
        <button type="submit">{t.tasks.add}</button>
      </form>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
        {tasks.length === 0 && <p>{t.tasks.empty}</p>}
      </div>
    </div>
  );
}
