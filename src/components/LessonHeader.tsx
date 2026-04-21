import type { Lesson } from "../types";

interface Props {
  index: number;
  lesson: Lesson;
}

export default function LessonHeader({ index, lesson }: Props) {
  return (
    <div className="lesson-header">
      <div className="lesson-title-row">
        <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span>
        <h1 className="lesson-title">{lesson.title}</h1>
        <span className={"lesson-badge " + lesson.badge}>{lesson.badge}</span>
      </div>
      <p className="lesson-desc" dangerouslySetInnerHTML={{ __html: lesson.desc }} />
      <div className="lesson-task">
        <strong>Task:</strong>{" "}
        <span dangerouslySetInnerHTML={{ __html: lesson.task }} />
      </div>
    </div>
  );
}
