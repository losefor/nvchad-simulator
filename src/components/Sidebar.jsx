import Brand from "./Brand.jsx";
import ProgressBar from "./ProgressBar.jsx";
import LessonList from "./LessonList.jsx";
import { LESSONS } from "../data/lessons.js";

export default function Sidebar({
  currentLesson,
  completed,
  onSelect,
  onReset,
  onOpenCheatsheet
}) {
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
