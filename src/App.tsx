import { useCallback, useEffect, useState } from "react";
import { LESSONS } from "./data/lessons";
import { useSimulator } from "./hooks/useSimulator";
import type { Message, KeyLogEntry, Toast } from "./types";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Console from "./components/Console";
import Cheatsheet from "./components/Cheatsheet";
import Telescope from "./components/Telescope";
import Toast from "./components/Toast";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "─── NvChad Simulator booted ───", kind: "info" }
  ]);
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [telescopeOpen, setTelescopeOpen] = useState<{ type: "files" | "grep" | "buffers" } | null>(null);

  const onToast = useCallback((text: string, kind: Message["kind"]) => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 1800);
  }, []);

  const onMessage = useCallback((text: string, kind: Message["kind"] = "info") => {
    setMessages((prev) => {
      const next = [...prev, { text, kind }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onKeyLog = useCallback((key: string) => {
    const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setKeyLog((prev) => {
      const next = [...prev, { key, time }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onCheatsheetRequested = useCallback(() => setCheatsheetOpen(true), []);

  const onTelescopeOpen = useCallback((type: "files" | "grep" | "buffers") => {
    setTelescopeOpen({ type });
  }, []);

  const {
    state,
    completed,
    handleKey,
    loadLesson,
    runCheck,
    skipLesson
  } = useSimulator({ onToast, onMessage, onKeyLog, onCheatsheetRequested, onTelescopeOpen });

  useEffect(() => {
    if (telescopeOpen) return;
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
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
  }, [handleKey, state.mode, telescopeOpen]);

  useEffect(() => {
    loadLesson(0);
  }, []);

  const currentLesson = LESSONS[state.currentLesson];

  useEffect(() => {
    setMessages([
      {
        text: `─── Loaded lesson ${state.currentLesson + 1}: ${currentLesson.title} ───`,
        kind: "info"
      }
    ]);
  }, [state.currentLesson, currentLesson.title]);

  const handleTelescopeSelect = useCallback((item: string) => {
    onMessage(`Opened: ${item}`, "success");
    setTelescopeOpen(null);
  }, [onMessage]);

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
      {telescopeOpen && (
        <Telescope
          type={telescopeOpen.type}
          onClose={() => setTelescopeOpen(null)}
          onSelect={handleTelescopeSelect}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
