import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { IdeaCardType, KanbanColumn } from "../types";
import KanbanBoard from "../components/KanbanBoard";

export default function Ideas() {
  const [ideas, setIdeas] = useState<IdeaCardType[]>([]);

  useEffect(() => {
    api.get<IdeaCardType[]>("/api/ideas").then(setIdeas);
  }, []);

  async function handlePersist(idea: IdeaCardType) {
    await api.put(`/api/ideas/${idea.id}`, { column: idea.column, order: idea.order });
  }

  async function handleDelete(idea: IdeaCardType) {
    await api.delete(`/api/ideas/${idea.id}`);
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
  }

  async function handleAddCard(column: KanbanColumn, title: string) {
    const created = await api.post<IdeaCardType>("/api/ideas", { title, column });
    setIdeas((prev) => [...prev, created]);
  }

  return (
    <div>
      <div className="page-header">
        <h1>💡 Ideeën</h1>
      </div>
      <KanbanBoard
        ideas={ideas}
        onReorder={setIdeas}
        onPersist={handlePersist}
        onDelete={handleDelete}
        onAddCard={handleAddCard}
      />
    </div>
  );
}
