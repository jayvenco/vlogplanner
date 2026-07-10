import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IdeaCardType } from "../types";

interface Props {
  idea: IdeaCardType;
  onDelete: (idea: IdeaCardType) => void;
}

export default function KanbanCard({ idea, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-card" {...attributes} {...listeners}>
      <div className="kanban-card-header">
        <strong>{idea.title}</strong>
        <button
          className="ghost small"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(idea)}
          aria-label="Verwijderen"
        >
          ✕
        </button>
      </div>
      {idea.note && <p>{idea.note}</p>}
    </div>
  );
}
