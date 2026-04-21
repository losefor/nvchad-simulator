import type { Lesson, Mode } from "../types";
import Tabline from "./Tabline";
import LessonHeader from "./LessonHeader";
import Gutter from "./Gutter";
import Buffer from "./Buffer";
import Statusline from "./Statusline";
import Cmdline from "./Cmdline";

interface VisualRange {
  start: [number, number];
  end: [number, number];
  line: boolean;
}

interface EditorState {
  mode: Mode;
  buffer: string[];
  cursor: [number, number];
  keyBuf: string;
  cmdText: string;
  cmdPrefix: string;
  modified: boolean;
  currentLesson: number;
  visualStart: [number, number] | null;
  visualRange: VisualRange | null;
}

interface Props {
  state: EditorState;
  lesson: Lesson;
}

export default function Editor({ state, lesson }: Props) {
  return (
    <div className="main">
      <header className="topbar">
        <Tabline modified={state.modified} />
        <LessonHeader index={state.currentLesson} lesson={lesson} />
      </header>

      <section className="editor-wrap">
        <div className="editor">
          <Gutter lineCount={state.buffer.length} currentRow={state.cursor[0]} />
          <Buffer
            buffer={state.buffer}
            cursor={state.cursor}
            mode={state.mode}
            visualRange={state.visualRange}
          />
        </div>

        <Statusline mode={state.mode} cursor={state.cursor} keyBuf={state.keyBuf} />
        <Cmdline
          active={state.mode === "command"}
          prefix={state.cmdPrefix}
          text={state.cmdText}
        />
      </section>
    </div>
  );
}
