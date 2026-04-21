import { useCallback, useEffect, useState } from "react";
import { LESSONS } from "./data/lessons";
import { useSimulator } from "./hooks/useSimulator";
import { useVFS } from "./hooks/useVFS";
import type { Message, KeyLogEntry, Toast } from "./types";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Console from "./components/Console";
import Cheatsheet from "./components/Cheatsheet";
import Telescope from "./components/Telescope";
import NvimTree from "./components/NvimTree";
import Terminal from "./components/Terminal";
import Toast from "./components/Toast";

interface VfsFile {
  path: string[];
  name: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "─── NvChad Simulator booted ───", kind: "info" }
  ]);
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [telescopeOpen, setTelescopeOpen] = useState<{ type: "files" | "grep" | "buffers" } | null>(null);
  const [nvimTreeOpen, setNvimTreeOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [vfsFile, setVfsFile] = useState<VfsFile | null>(null);

  const { vfs, runCommand, saveFile, openFile } = useVFS();

  const onToast = useCallback((text: string, kind: Message["kind"]) => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 1800);
  }, []);

  const onMessage = useCallback((text: string, kind: Message["kind"] = "info") => {
    setMessages(prev => {
      const next = [...prev, { text, kind }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onKeyLog = useCallback((key: string) => {
    const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setKeyLog(prev => {
      const next = [...prev, { key, time }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onCheatsheetRequested = useCallback(() => setCheatsheetOpen(true), []);
  const onTelescopeOpen = useCallback((type: "files" | "grep" | "buffers") => setTelescopeOpen({ type }), []);
  const onNvimTreeToggle = useCallback(() => setNvimTreeOpen(o => !o), []);
  const onTerminalToggle = useCallback(() => setTerminalOpen(o => !o), []);

  const onSave = useCallback((buffer: string[]) => {
    if (vfsFile) {
      saveFile(vfsFile.path, buffer);
      onMessage(`"${vfsFile.name}" saved to VFS`, "success");
    }
  }, [vfsFile, saveFile, onMessage]);

  const {
    state,
    completed,
    handleKey,
    loadLesson,
    loadBuffer,
    runCheck,
    skipLesson
  } = useSimulator({
    onToast, onMessage, onKeyLog, onCheatsheetRequested,
    onTelescopeOpen, onSave, onNvimTreeToggle, onTerminalToggle
  });

  const handleOpenFile = useCallback((pathStr: string) => {
    const file = openFile(pathStr, vfs.cwd);
    setVfsFile({ path: file.path, name: file.name });
    loadBuffer(file.content);
    setTerminalOpen(false);
    onMessage(`Opened: ${file.name}`, "info");
  }, [openFile, vfs.cwd, loadBuffer, onMessage]);

  const handleNvimTreeSelect = useCallback((path: string[]) => {
    const name = path[path.length - 1] ?? "untitled";
    const file = openFile(name, path.slice(0, -1));
    setVfsFile({ path: file.path, name: file.name });
    loadBuffer(file.content);
    setNvimTreeOpen(false);
    onMessage(`Opened: ${file.name}`, "info");
  }, [openFile, loadBuffer, onMessage]);

  const handleTelescopeSelect = useCallback((item: string) => {
    onMessage(`Opened: ${item}`, "success");
    setTelescopeOpen(null);
  }, [onMessage]);

  const anyModalOpen = telescopeOpen !== null || cheatsheetOpen || nvimTreeOpen;

  useEffect(() => {
    if (anyModalOpen) return;
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const blocked = ["Tab", " ", "/", "?", ":", "'"];
      if (blocked.includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
      if (e.key === "Backspace" && state.mode !== "insert" && state.mode !== "command") e.preventDefault();
      handleKey(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleKey, state.mode, anyModalOpen]);

  useEffect(() => { loadLesson(0); }, []);

  const currentLesson = LESSONS[state.currentLesson];

  useEffect(() => {
    if (!vfsFile) {
      setMessages([{
        text: `─── Loaded lesson ${state.currentLesson + 1}: ${currentLesson.title} ───`,
        kind: "info"
      }]);
    }
  }, [state.currentLesson, currentLesson.title, vfsFile]);

  const exitVfsMode = useCallback(() => {
    setVfsFile(null);
    loadLesson(state.currentLesson);
  }, [loadLesson, state.currentLesson]);

  return (
    <div className={"app" + (nvimTreeOpen ? " nvimtree-open" : "")}>
      <Sidebar
        currentLesson={state.currentLesson}
        completed={completed}
        onSelect={(idx) => { setVfsFile(null); loadLesson(idx); }}
        onReset={() => { if (vfsFile) exitVfsMode(); else loadLesson(state.currentLesson); }}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
      />

      {nvimTreeOpen && (
        <NvimTree
          root={vfs.root}
          openFilePath={vfsFile?.path ?? null}
          onSelect={handleNvimTreeSelect}
          onClose={() => setNvimTreeOpen(false)}
        />
      )}

      <div className="main-col">
        <Editor state={state} lesson={currentLesson} vfsFilename={vfsFile ? vfsFile.name : undefined} />

        {terminalOpen ? (
          <Terminal
            vfs={vfs}
            runCommand={runCommand}
            onOpenFile={handleOpenFile}
            onClose={() => setTerminalOpen(false)}
          />
        ) : (
          <Console
            lesson={currentLesson}
            messages={messages}
            keyLog={keyLog}
            onCheck={vfsFile ? undefined : runCheck}
            onSkip={vfsFile ? undefined : skipLesson}
          />
        )}

        <div className="vfs-bar">
          <button
            className={"vfs-btn" + (nvimTreeOpen ? " vfs-btn-on" : "")}
            onClick={() => setNvimTreeOpen(o => !o)}
            title="Toggle NvimTree (Ctrl-n)"
          >
            󰙅 Files
          </button>
          <button
            className={"vfs-btn" + (terminalOpen ? " vfs-btn-on" : "")}
            onClick={() => setTerminalOpen(o => !o)}
            title="Toggle Terminal"
          >
             Terminal
          </button>
          {vfsFile && (
            <span className="vfs-file-indicator">
              editing: <strong>{vfsFile.name}</strong>
              <button className="vfs-exit" onClick={exitVfsMode} title="Return to lessons">✕ lessons</button>
            </span>
          )}
        </div>
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
