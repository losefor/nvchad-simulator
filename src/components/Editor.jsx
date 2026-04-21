import Tabline from "./Tabline.jsx";
import LessonHeader from "./LessonHeader.jsx";
import Gutter from "./Gutter.jsx";
import Buffer from "./Buffer.jsx";
import Statusline from "./Statusline.jsx";
import Cmdline from "./Cmdline.jsx";

export default function Editor({ state, lesson }) {
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
