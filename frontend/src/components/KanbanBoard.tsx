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
import { useLanguage } from "../context/LanguageContext";
import KanbanCard from "./KanbanCard";

interface Props {
  ideas: IdeaCardType[];
  onReorder: (updated: IdeaCardType[]) => void;
  onPersist: (idea: IdeaCardType) => void;
  onDelete: (idea: IdeaCardType) => void;
  onAddCard: (column: KanbanColumn, title: string) => void;
  onCardClick: (idea: IdeaCardType) => void;
}

function Column({
  column,
  label,
  ideas,
  onDelete,
  onCardClick,
  emptyLabel,
}: {
  column: KanbanColumn;
  label: string;
  ideas: IdeaCardType[];
  onDelete: (idea: IdeaCardType) => void;
  onCardClick: (idea: IdeaCardType) => void;
  emptyLabel: string;
}) {
  const { setNodeRef } = useDroppable({ id: column });
  return (
    <div className="kanban-column" ref={setNodeRef}>
      <h3>{label}</h3>
      <SortableContext items={ideas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-cards">
          {ideas.map((idea) => (
            <KanbanCard key={idea.id} idea={idea} onDelete={onDelete} onClick={onCardClick} />
          ))}
          {ideas.length === 0 && <div className="kanban-empty">{emptyLabel}</div>}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ ideas, onReorder, onPersist, onDelete, onAddCard, onCardClick }: Props) {
  const { t } = useLanguage();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});

  const COLUMNS: { key: KanbanColumn; label: string }[] = [
    { key: "backlog", label: t.ideas.columnBacklog },
    { key: "bezig", label: t.ideas.columnBezig },
    { key: "afgerond", label: t.ideas.columnAfgerond },
  ];

  const grouped: Record<KanbanColumn, IdeaCardType[]> = {
    backlog: [],
    bezig: [],
    afgerond: [],
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
            <Column
              column={key}
              label={label}
              ideas={grouped[key]}
              onDelete={onDelete}
              onCardClick={onCardClick}
              emptyLabel={t.ideas.dropHere}
            />
            <div className="kanban-add">
              <input
                type="text"
                placeholder={t.ideas.newIdea}
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
