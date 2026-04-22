import type { Lesson, Mode, VisualRange } from "../types";
import Tabline from "./Tabline";
import LessonHeader from "./LessonHeader";
import Gutter from "./Gutter";
import Buffer from "./Buffer";
import Statusline from "./Statusline";
import Cmdline from "./Cmdline";

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
  vfsFilename?: string;
}

export default function Editor({ state, lesson, vfsFilename }: Props) {
  return (
    <div className="main">
      <header className="topbar">
        <Tabline modified={state.modified} filename={vfsFilename} />
        {!vfsFilename && <LessonHeader index={state.currentLesson} lesson={lesson} />}
        {vfsFilename && (
          <div className="vfs-header">
            <span className="vfs-path">{vfsFilename}</span>
            <span className="vfs-hint">:w to save · Esc for normal mode · Ctrl-n for NvimTree</span>
          </div>
        )}
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
