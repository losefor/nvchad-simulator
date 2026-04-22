import { useState, useRef, useEffect, useCallback } from "react";
import type { CommandResult, TerminalLine } from "../hooks/useVFS";
import type { VFS } from "../vfs";
import { pathToStr } from "../vfs";

const HIST_KEY = "nvim-sim-term-hist";

interface Props {
  vfs: VFS;
  runCommand: (cmd: string, vfs: VFS) => CommandResult;
  getCompletions: (input: string, vfs: VFS) => string[];
  onOpenFile: (pathStr: string) => void;
  onClose: () => void;
}

const WELCOME: TerminalLine[] = [
  { kind: "output", text: "NvChad VFS Terminal  —  type 'help' for commands" },
  { kind: "output", text: "Use 'nvim <file>' to open a file in the editor" },
  { kind: "output", text: "" },
];

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(hist: string[]) {
  try { localStorage.setItem(HIST_KEY, JSON.stringify(hist.slice(0, 200))); } catch {}
}

function exportVFS(vfs: VFS) {
  const json = JSON.stringify(vfs, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vfs-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Terminal({ vfs, runCommand, getCompletions, onOpenFile, onClose }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [histIdx, setHistIdx] = useState(-1);
  const [tabCandidates, setTabCandidates] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const prompt = pathToStr(vfs.cwd) + "$ ";

  const addHistory = useCallback((cmd: string) => {
    setHistory(h => {
      const next = [cmd, ...h.filter(c => c !== cmd)].slice(0, 200);
      saveHistory(next);
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    const cmd = input.trim();
    setTabCandidates([]);
    const inputLine: TerminalLine = { kind: "input", text: prompt + input };

    if (!cmd) {
      setLines(prev => [...prev, inputLine]);
      setInput("");
      return;
    }

    // Handle `history` locally so we have access to terminal state
    if (cmd === "history") {
      const histLines: TerminalLine[] = history.map((c, i) => ({
        kind: "output",
        text: `  ${String(i + 1).padStart(3)}  ${c}`,
      }));
      setLines(prev => [...prev, inputLine, ...histLines]);
      addHistory(cmd);
      setHistIdx(-1);
      setInput("");
      return;
    }

    const { lines: outLines, action } = runCommand(cmd, vfs);

    if (action?.type === "clear") {
      setLines([]);
      setInput("");
      addHistory(cmd);
      setHistIdx(-1);
      return;
    }

    if (action?.type === "export") {
      exportVFS(vfs);
      setLines(prev => [...prev, inputLine, { kind: "output", text: "VFS exported as vfs-export.json" }]);
    } else if (action?.type === "open") {
      onOpenFile(action.pathStr);
      setLines(prev => [...prev, inputLine, { kind: "output", text: `Opening ${action.pathStr} in editor…` }]);
    } else {
      setLines(prev => [...prev, inputLine, ...outLines]);
    }

    addHistory(cmd);
    setHistIdx(-1);
    setInput("");
  }, [input, vfs, runCommand, onOpenFile, prompt, history, addHistory]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); return; }

    if (e.key === "Tab") {
      e.preventDefault();
      const completions = getCompletions(input, vfs);
      if (completions.length === 0) return;
      if (completions.length === 1) {
        // Complete the last token
        const tokens = input.trimEnd().split(" ");
        tokens[tokens.length - 1] = completions[0];
        setInput(tokens.join(" ") + (completions[0].endsWith("/") ? "" : " "));
        setTabCandidates([]);
      } else {
        // Show candidates, complete common prefix
        const prefix = completions.reduce((acc, s) =>
          s.startsWith(acc) ? acc :
          [...acc].reduce((p, _, i) => s.startsWith(acc.slice(0, i + 1)) ? acc.slice(0, i + 1) : p, "")
        );
        const tokens = input.trimEnd().split(" ");
        if (prefix && prefix !== tokens[tokens.length - 1]) {
          tokens[tokens.length - 1] = prefix;
          setInput(tokens.join(" "));
        }
        setTabCandidates(completions);
      }
      return;
    }

    // Any other key clears tab candidates
    setTabCandidates([]);

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
  }, [submit, history, histIdx, input, vfs, getCompletions]);

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

        {tabCandidates.length > 0 && (
          <div className="tl tl-output tl-tab-candidates">
            {tabCandidates.join("  ")}
          </div>
        )}

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
