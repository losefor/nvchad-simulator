import { useState, useRef, useEffect, useCallback } from "react";
import type { CommandResult, TerminalLine } from "../hooks/useVFS";
import type { VFS } from "../vfs";
import { pathToStr } from "../vfs";

interface Props {
  vfs: VFS;
  runCommand: (cmd: string, vfs: VFS) => CommandResult;
  onOpenFile: (pathStr: string) => void;
  onClose: () => void;
}

const WELCOME: TerminalLine[] = [
  { kind: "output", text: "NvChad VFS Terminal  —  type 'help' for commands" },
  { kind: "output", text: "Use 'nvim <file>' to open a file in the editor" },
  { kind: "output", text: "" },
];

export default function Terminal({ vfs, runCommand, onOpenFile, onClose }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const prompt = pathToStr(vfs.cwd) + "$ ";

  const submit = useCallback(() => {
    const cmd = input.trim();
    const inputLine: TerminalLine = { kind: "input", text: prompt + input };

    if (!cmd) {
      setLines(prev => [...prev, inputLine]);
      setInput("");
      return;
    }

    const { lines: outLines, action } = runCommand(cmd, vfs);

    if (action?.type === "clear") {
      setLines([]);
      setInput("");
      setHistory(h => [cmd, ...h.slice(0, 49)]);
      setHistIdx(-1);
      return;
    }

    if (action?.type === "open") {
      onOpenFile(action.pathStr);
      setLines(prev => [...prev, inputLine, { kind: "output", text: `Opening ${action.pathStr} in editor…` }]);
    } else {
      setLines(prev => [...prev, inputLine, ...outLines]);
    }

    setHistory(h => [cmd, ...h.slice(0, 49)]);
    setHistIdx(-1);
    setInput("");
  }, [input, vfs, runCommand, onOpenFile, prompt]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : (history[idx] ?? ""));
      return;
    }
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
      return;
    }
  }, [submit, history, histIdx]);

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-titlebar">
        <span className="terminal-cwd">{pathToStr(vfs.cwd)}</span>
        <span className="terminal-label">TERMINAL</span>
        <button className="terminal-close" onClick={onClose} title="Close terminal">×</button>
      </div>
      <div className="terminal-body">
        {lines.map((line, i) => (
          <div key={i} className={`tl tl-${line.kind}`}>{line.text || "\u00a0"}</div>
        ))}
        <div className="tl tl-input tl-current">
          <span className="terminal-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
