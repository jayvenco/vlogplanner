import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IdeaCardType } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  idea: IdeaCardType;
  onDelete: (idea: IdeaCardType) => void;
  onClick: (idea: IdeaCardType) => void;
}

export default function KanbanCard({ idea, onDelete, onClick }: Props) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
      onClick={() => onClick(idea)}
    >
      <div className="kanban-card-header">
        <strong>{idea.title}</strong>
        <button
          className="ghost small"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(idea);
          }}
          aria-label={t.common.remove}
        >
          ✕
        </button>
      </div>
      {idea.description && <p>{idea.description}</p>}
      {(idea.theme || idea.target_age) && (
        <div className="kanban-card-chips">
          {idea.theme && <span className="chip">{idea.theme}</span>}
          {idea.target_age && <span className="chip">{idea.target_age}</span>}
        </div>
      )}
    </div>
  );
}
