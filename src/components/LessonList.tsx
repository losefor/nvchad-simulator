import { LESSONS } from "../data/lessons";
import type { Lesson } from "../types";

interface Props {
  currentLesson: number;
  completed: Set<string>;
  onSelect: (index: number) => void;
}

interface GroupedItem {
  type: "section" | "item";
  title?: string;
  lesson?: Lesson;
  index?: number;
  key: string;
}

export default function LessonList({ currentLesson, completed, onSelect }: Props) {
  const grouped: GroupedItem[] = [];
  let lastSection: string | null = null;
  LESSONS.forEach((l, i) => {
    if (l.section !== lastSection) {
      grouped.push({ type: "section", title: l.section, key: `s-${l.section}` });
      lastSection = l.section;
    }
    grouped.push({ type: "item", lesson: l, index: i, key: l.id });
  });

  return (
    <nav className="lesson-list">
      {grouped.map((row) =>
        row.type === "section" ? (
          <div className="lesson-section-title" key={row.key}>
            {row.title}
          </div>
        ) : (
          <div
            key={row.key}
            className={
              "lesson-item" +
              (row.index === currentLesson ? " active" : "") +
              (row.lesson && completed.has(row.lesson.id) ? " done" : "")
            }
            onClick={() => row.index !== undefined && onSelect(row.index)}
          >
            <span className="num">{String((row.index ?? 0) + 1).padStart(2, "0")}</span>
            <span className="title">{row.lesson?.title}</span>
          </div>
        )
      )}
    </nav>
  );
}
