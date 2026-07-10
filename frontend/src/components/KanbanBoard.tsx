import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { IdeaCardType, KanbanColumn } from "../types";
import KanbanCard from "./KanbanCard";

const COLUMNS: { key: KanbanColumn; label: string }[] = [
  { key: "ideeen", label: "💡 Ideeën" },
  { key: "mee_bezig", label: "🚧 Mee bezig" },
  { key: "later", label: "⏳ Later" },
  { key: "klaar", label: "🎉 Klaar" },
];

interface Props {
  ideas: IdeaCardType[];
  onReorder: (updated: IdeaCardType[]) => void;
  onPersist: (idea: IdeaCardType) => void;
  onDelete: (idea: IdeaCardType) => void;
  onAddCard: (column: KanbanColumn, title: string) => void;
}

function Column({ column, label, ideas, onDelete }: { column: KanbanColumn; label: string; ideas: IdeaCardType[]; onDelete: (idea: IdeaCardType) => void }) {
  const { setNodeRef } = useDroppable({ id: column });
  return (
    <div className="kanban-column" ref={setNodeRef}>
      <h3>{label}</h3>
      <SortableContext items={ideas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-cards">
          {ideas.map((idea) => (
            <KanbanCard key={idea.id} idea={idea} onDelete={onDelete} />
          ))}
          {ideas.length === 0 && <EmptyDrop column={column} />}
        </div>
      </SortableContext>
    </div>
  );
}

function EmptyDrop({ column: _column }: { column: KanbanColumn }) {
  return <div className="kanban-empty">Sleep hier een kaart</div>;
}

export default function KanbanBoard({ ideas, onReorder, onPersist, onDelete, onAddCard }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});

  const grouped: Record<KanbanColumn, IdeaCardType[]> = {
    ideeen: [],
    mee_bezig: [],
    later: [],
    klaar: [],
  };
  for (const idea of ideas) {
    grouped[idea.column].push(idea);
  }
  (Object.keys(grouped) as KanbanColumn[]).forEach((col) => grouped[col].sort((a, b) => a.order - b.order));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeIdea = ideas.find((i) => i.id === active.id);
    if (!activeIdea) return;

    const overColumn = (COLUMNS.find((c) => c.key === over.id)?.key ??
      ideas.find((i) => i.id === over.id)?.column) as KanbanColumn | undefined;
    if (!overColumn) return;

    const overIdea = ideas.find((i) => i.id === over.id);

    const next = ideas.map((i) => ({ ...i }));
    const moving = next.find((i) => i.id === active.id)!;
    moving.column = overColumn;

    const destItems = next.filter((i) => i.column === overColumn && i.id !== active.id).sort((a, b) => a.order - b.order);
    const insertIndex = overIdea && overIdea.id !== active.id ? destItems.findIndex((i) => i.id === overIdea.id) : destItems.length;
    destItems.splice(insertIndex === -1 ? destItems.length : insertIndex, 0, moving);
    destItems.forEach((item, index) => {
      item.order = index;
    });

    const changed = next.filter((i) => {
      const original = ideas.find((o) => o.id === i.id)!;
      return original.column !== i.column || original.order !== i.order;
    });

    onReorder(next);
    changed.forEach(onPersist);
  }

  function submitNewCard(column: KanbanColumn) {
    const title = (newCardTitle[column] || "").trim();
    if (!title) return;
    onAddCard(column, title);
    setNewCardTitle((prev) => ({ ...prev, [column]: "" }));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {COLUMNS.map(({ key, label }) => (
          <div key={key} className="kanban-column-wrapper">
            <Column column={key} label={label} ideas={grouped[key]} onDelete={onDelete} />
            <div className="kanban-add">
              <input
                type="text"
                placeholder="Nieuw idee..."
                value={newCardTitle[key] || ""}
                onChange={(e) => setNewCardTitle((prev) => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && submitNewCard(key)}
              />
              <button className="secondary" onClick={() => submitNewCard(key)}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
