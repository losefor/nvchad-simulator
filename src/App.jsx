import { useCallback, useEffect, useState } from "react";
import { LESSONS } from "./data/lessons.js";
import { useSimulator } from "./hooks/useSimulator.js";
import Sidebar from "./components/Sidebar.jsx";
import Editor from "./components/Editor.jsx";
import Console from "./components/Console.jsx";
import Cheatsheet from "./components/Cheatsheet.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const [messages, setMessages] = useState([
    { text: "─── NvChad Simulator booted ───", kind: "info" }
  ]);
  const [keyLog, setKeyLog] = useState([]);
  const [toast, setToast] = useState(null);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  const onToast = useCallback((text, kind) => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 1800);
  }, []);

  const onMessage = useCallback((text, kind = "info") => {
    setMessages((prev) => {
      const next = [...prev, { text, kind }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onKeyLog = useCallback((key) => {
    const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setKeyLog((prev) => {
      const next = [...prev, { key, time }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onCheatsheetRequested = useCallback(() => setCheatsheetOpen(true), []);

  const {
    state,
    completed,
    handleKey,
    loadLesson,
    runCheck,
    skipLesson
  } = useSimulator({ onToast, onMessage, onKeyLog, onCheatsheetRequested });

  // Global keydown listener
  useEffect(() => {
    const listener = (e) => {
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const blocked = ["Tab", " ", "/", "?", ":", "'"];
      if (blocked.includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
      if (
        e.key === "Backspace" &&
        state.mode !== "insert" &&
        state.mode !== "command"
      )
        e.preventDefault();
      handleKey(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleKey, state.mode]);

  // Load lesson 0 on mount
  useEffect(() => {
    loadLesson(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLesson = LESSONS[state.currentLesson];

  // Reset messages when lesson changes
  useEffect(() => {
    setMessages([
      {
        text: `─── Loaded lesson ${state.currentLesson + 1}: ${currentLesson.title} ───`,
        kind: "info"
      }
    ]);
  }, [state.currentLesson, currentLesson.title]);

  return (
    <div className="app">
      <Sidebar
        currentLesson={state.currentLesson}
        completed={completed}
        onSelect={loadLesson}
        onReset={() => loadLesson(state.currentLesson)}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="main-col">
        <Editor state={state} lesson={currentLesson} />
        <Console
          lesson={currentLesson}
          messages={messages}
          keyLog={keyLog}
          onCheck={runCheck}
          onSkip={skipLesson}
        />
      </div>

      <Cheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
      <Toast toast={toast} />
    </div>
  );
}
