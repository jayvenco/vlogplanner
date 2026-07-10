import type { Badge } from "../types";

export default function BadgeList({ badges }: { badges: Badge[] }) {
  return (
    <div className="badge-list">
      {badges.map((badge) => (
        <div key={badge.key} className={"badge-chip" + (badge.earned ? " earned" : " locked")} title={badge.title}>
          <span className="badge-icon">{badge.icon}</span>
          <span>{badge.title}</span>
        </div>
      ))}
    </div>
  );
}
