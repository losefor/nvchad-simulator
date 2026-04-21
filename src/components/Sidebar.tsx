import { LESSONS } from "../data/lessons";
import Brand from "./Brand";
import ProgressBar from "./ProgressBar";
import LessonList from "./LessonList";

interface Props {
  currentLesson: number;
  completed: Set<string>;
  onSelect: (index: number) => void;
  onReset: () => void;
  onOpenCheatsheet: () => void;
}

export default function Sidebar({
  currentLesson,
  completed,
  onSelect,
  onReset,
  onOpenCheatsheet
}: Props) {
  return (
    <aside className="sidebar">
      <Brand />
      <ProgressBar completed={completed.size} total={LESSONS.length} />
      <LessonList
        currentLesson={currentLesson}
        completed={completed}
        onSelect={onSelect}
      />
      <div className="sidebar-footer">
        <button className="btn-ghost" onClick={onReset} title="Reset buffer & progress">
          ⟲ Reset lesson
        </button>
        <button className="btn-ghost" onClick={onOpenCheatsheet}>
          ⌨ Cheatsheet
        </button>
      </div>
    </aside>
  );
}
