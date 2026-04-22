import { useState } from "react";
import { LESSONS } from "../data/lessons";
import Brand from "./Brand";
import ProgressBar from "./ProgressBar";
import LessonList from "./LessonList";
import LessonPath from "./LessonPath";

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
  const [mode, setMode] = useState<"simple" | "advanced">("simple");

  return (
    <aside className="sidebar">
      <Brand />
      <ProgressBar completed={completed.size} total={LESSONS.length} />

      <div className="mode-toggle">
        <button
          className={"mode-btn" + (mode === "simple" ? " mode-active" : "")}
          onClick={() => setMode("simple")}
        >
          Path
        </button>
        <button
          className={"mode-btn" + (mode === "advanced" ? " mode-active" : "")}
          onClick={() => setMode("advanced")}
        >
          List
        </button>
      </div>

      {mode === "simple" ? (
        <LessonPath
          currentLesson={currentLesson}
          completed={completed}
          onSelect={onSelect}
        />
      ) : (
        <LessonList
          currentLesson={currentLesson}
          completed={completed}
          onSelect={onSelect}
        />
      )}

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
