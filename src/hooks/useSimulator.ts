import { useCallback, useEffect, useRef, useState } from "react";
import { LESSONS, THEMES } from "../data/lessons";
import type { SimulatorState, UseSimulatorCallbacks, UseSimulatorReturn, Yank } from "../types";

const initialFlags = () => ({
  undoUsed: false,
  counts3jUsed: false,
  chadThemeCycled: false,
  telescopeOpened: false,
  nvimTreeToggled: false,
  bufferSwitched: false,
  terminalOpened: false,
  lspHover: false,
  splitVertical: false,
  saved: false,
  cheatsheetOpened: false
});

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function createInitialState(): SimulatorState {
  return {
    mode: "normal",
    buffer: [""],
    cursor: [0, 0],
    keyBuf: "",
    cmdText: "",
    cmdPrefix: ":",
    lastSearch: "",
    lastYank: { type: "line", text: "" },
    history: [],
    redoStack: [],
    visualStart: null,
    modified: false,
    currentLesson: 0,
    theme: 0,
    flags: initialFlags(),
    registers: {},
    macros: {},
    macroRecording: null,
    macroBuffer: [],
    activeRegister: null,
    marks: {}
  };
}

export function useSimulator({ onToast, onMessage, onKeyLog, onCheatsheetRequested, onTelescopeOpen }: UseSimulatorCallbacks): UseSimulatorReturn {
  const sRef = useRef<SimulatorState>(createInitialState());
  const [, setTick] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("nvchad-sim-progress");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const rerender = useCallback(() => setTick((t) => t + 1), []);
  const handleKeyRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const lastFindRef = useRef<{ char: string; till: boolean; back: boolean } | null>(null);

  const cb = useRef({ onToast, onMessage, onKeyLog, onCheatsheetRequested, onTelescopeOpen });
  useEffect(() => {
    cb.current = { onToast, onMessage, onKeyLog, onCheatsheetRequested, onTelescopeOpen };
  }, [onToast, onMessage, onKeyLog, onCheatsheetRequested, onTelescopeOpen]);

  const curLine = () => sRef.current.buffer[sRef.current.cursor[0]];
  const setCurLine = (str: string) => {
    sRef.current.buffer[sRef.current.cursor[0]] = str;
  };

  const clampCursor = () => {
    const s = sRef.current;
    s.cursor[0] = clamp(s.cursor[0], 0, s.buffer.length - 1);
    const max = Math.max(0, curLine().length - (s.mode === "insert" ? 0 : 1));
    s.cursor[1] = clamp(s.cursor[1], 0, max);
  };

  const pushHistory = () => {
    const s = sRef.current;
    s.history.push({ buffer: s.buffer.slice(), cursor: [...s.cursor] });
    if (s.history.length > 100) s.history.shift();
    s.redoStack = [];
  };

  // ── Motions ──────────────────────────────────────────────────────────────
  const motionH = (n = 1) => { sRef.current.cursor[1] = Math.max(0, sRef.current.cursor[1] - n); };
  const motionL = (n = 1) => {
    const s = sRef.current;
    const max = Math.max(0, curLine().length - (s.mode === "insert" ? 0 : 1));
    s.cursor[1] = Math.min(max, s.cursor[1] + n);
  };
  const motionJ = (n = 1) => {
    const s = sRef.current;
    s.cursor[0] = Math.min(s.buffer.length - 1, s.cursor[0] + n);
    clampCursor();
  };
  const motionK = (n = 1) => {
    sRef.current.cursor[0] = Math.max(0, sRef.current.cursor[0] - n);
    clampCursor();
  };
  const motionZero = () => { sRef.current.cursor[1] = 0; };
  const motionCaret = () => {
    const line = curLine();
    const m = line.match(/^\s*/);
    sRef.current.cursor[1] = m ? m[0].length : 0;
  };
  const motionDollar = () => { sRef.current.cursor[1] = Math.max(0, curLine().length - 1); };
  const motionGG = () => { sRef.current.cursor = [0, 0]; };
  const motionG = () => { sRef.current.cursor = [sRef.current.buffer.length - 1, 0]; };
  const isWord = (ch: string | undefined) => /\w/.test(ch || "");

  const motionW = (n = 1) => {
    const s = sRef.current;
    for (let i = 0; i < n; i++) {
      let [r, c] = s.cursor;
      let line = s.buffer[r];
      const start = line[c] || "";
      if (isWord(start)) while (c < line.length && isWord(line[c])) c++;
      else while (c < line.length && !isWord(line[c]) && line[c] !== " ") c++;
      while (c < line.length && line[c] === " ") c++;
      if (c >= line.length && r < s.buffer.length - 1) { r++; c = 0; while (c < s.buffer[r].length && s.buffer[r][c] === " ") c++; }
      s.cursor = [r, c];
    }
  };
  const motionB = (n = 1) => {
    const s = sRef.current;
    for (let i = 0; i < n; i++) {
      let [r, c] = s.cursor;
      if (c === 0 && r > 0) { r--; c = s.buffer[r].length; }
      let line = s.buffer[r];
      while (c > 0 && line[c - 1] === " ") c--;
      if (c > 0 && isWord(line[c - 1])) while (c > 0 && isWord(line[c - 1])) c--;
      else if (c > 0) while (c > 0 && !isWord(line[c - 1]) && line[c - 1] !== " ") c--;
      s.cursor = [r, c];
    }
  };
  const motionE = (n = 1) => {
    const s = sRef.current;
    for (let i = 0; i < n; i++) {
      let [r, c] = s.cursor;
      let line = s.buffer[r];
      c++;
      while (c < line.length && line[c] === " ") c++;
      if (c >= line.length && r < s.buffer.length - 1) { r++; line = s.buffer[r]; c = 0; }
      if (isWord(line[c])) while (c + 1 < line.length && isWord(line[c + 1])) c++;
      else while (c + 1 < line.length && !isWord(line[c + 1]) && line[c + 1] !== " ") c++;
      s.cursor = [r, c];
    }
  };
  const motionFind = (ch: string, till = false, back = false) => {
    const s = sRef.current;
    const line = curLine();
    const c = s.cursor[1];
    lastFindRef.current = { char: ch, till, back };
    if (back) {
      for (let i = c - 1; i >= 0; i--)
        if (line[i] === ch) { s.cursor[1] = till ? i + 1 : i; return; }
    } else {
      for (let i = c + 1; i < line.length; i++)
        if (line[i] === ch) { s.cursor[1] = till ? i - 1 : i; return; }
    }
    cb.current.onMessage(`'${ch}' not found on line`, "warn");
  };

  // ── Text Object Range ────────────────────────────────────────────────────
  const getTextObjectRange = (inner: boolean, obj: string): [number, number] | null => {
    const line = curLine();
    const c = sRef.current.cursor[1];

    if (obj === "w") {
      let start = c, end = c;
      if (isWord(line[c])) {
        while (start > 0 && isWord(line[start - 1])) start--;
        while (end < line.length && isWord(line[end])) end++;
        if (!inner) {
          if (end < line.length && line[end] === " ") while (end < line.length && line[end] === " ") end++;
          else while (start > 0 && line[start - 1] === " ") start--;
        }
      } else if (line[c] === " ") {
        while (start > 0 && line[start - 1] === " ") start--;
        while (end < line.length && line[end] === " ") end++;
      } else {
        while (start > 0 && !isWord(line[start - 1]) && line[start - 1] !== " ") start--;
        while (end < line.length && !isWord(line[end]) && line[end] !== " ") end++;
        if (!inner) while (end < line.length && line[end] === " ") end++;
      }
      return start === end ? null : [start, end];
    }

    // Symmetric quote objects
    if (['"', "'", "`"].includes(obj)) {
      let left = c;
      while (left >= 0 && line[left] !== obj) left--;
      if (left < 0) return null;
      let right = left + 1;
      while (right < line.length && line[right] !== obj) right++;
      if (right >= line.length) {
        // cursor might be on closing quote — try searching further left
        right = left;
        left--;
        while (left >= 0 && line[left] !== obj) left--;
        if (left < 0) return null;
      }
      return inner ? [left + 1, right] : [left, right + 1];
    }

    // Bracket pairs
    const openOf: Record<string, string> = { "(": "(", ")": "(", "[": "[", "]": "[", "{": "{", "}": "{", "b": "(", "B": "{" };
    const closeOf: Record<string, string> = { "(": ")", ")": ")", "[": "]", "]": "]", "{": "}", "}": "}", "b": ")", "B": "}" };
    const openChar = openOf[obj], closeChar = closeOf[obj];
    if (!openChar || !closeChar) return null;

    let depthL = 0, left = c;
    while (left >= 0) {
      if (line[left] === closeChar) depthL++;
      else if (line[left] === openChar) { if (depthL === 0) break; depthL--; }
      left--;
    }
    if (left < 0) return null;

    let depthR = 0, right = left + 1;
    while (right < line.length) {
      if (line[right] === openChar) depthR++;
      else if (line[right] === closeChar) { if (depthR === 0) break; depthR--; }
      right++;
    }
    if (right >= line.length) return null;

    return inner ? [left + 1, right] : [left, right + 1];
  };

  const applyTextObject = (op: "delete" | "change" | "yank", inner: boolean, obj: string): boolean => {
    const s = sRef.current;
    const range = getTextObjectRange(inner, obj);
    if (!range) { cb.current.onMessage("E2: Target not found", "warn"); return false; }
    const [start, end] = range;
    const line = curLine();
    const text = line.slice(start, end);
    const yank: Yank = { type: "char", text };
    if (op === "yank") {
      s.lastYank = yank;
      if (s.activeRegister) s.registers[s.activeRegister] = yank;
      s.activeRegister = null;
      cb.current.onMessage(`yanked "${text}"`);
      return true;
    }
    pushHistory();
    setCurLine(line.slice(0, start) + line.slice(end));
    s.lastYank = yank;
    if (s.activeRegister) { s.registers[s.activeRegister] = yank; s.activeRegister = null; }
    s.cursor[1] = Math.min(start, Math.max(0, curLine().length - 1));
    s.modified = true;
    if (op === "change") s.mode = "insert";
    return true;
  };

  const applyTextObjectVisual = (inner: boolean, obj: string) => {
    const s = sRef.current;
    const range = getTextObjectRange(inner, obj);
    if (!range) { cb.current.onMessage("E2: Target not found", "warn"); return; }
    const [start, end] = range;
    s.mode = "visual";
    s.visualStart = [s.cursor[0], start];
    s.cursor[1] = Math.max(start, end - 1);
  };

  // ── Delete / Yank / Put ──────────────────────────────────────────────────
  const getActiveYank = (): Yank => {
    const s = sRef.current;
    if (s.activeRegister && s.registers[s.activeRegister]) return s.registers[s.activeRegister];
    return s.lastYank;
  };

  const storeYank = (yank: Yank) => {
    const s = sRef.current;
    s.lastYank = yank;
    if (s.activeRegister) { s.registers[s.activeRegister] = yank; s.activeRegister = null; }
  };

  const deleteCharUnder = () => {
    const s = sRef.current;
    pushHistory();
    const line = curLine();
    if (!line.length) return;
    storeYank({ type: "char", text: line[s.cursor[1]] || "" });
    setCurLine(line.slice(0, s.cursor[1]) + line.slice(s.cursor[1] + 1));
    if (s.cursor[1] >= curLine().length && s.cursor[1] > 0) s.cursor[1]--;
    s.modified = true;
  };
  const deleteLine = (n = 1) => {
    const s = sRef.current;
    pushHistory();
    const lines = s.buffer.splice(s.cursor[0], n);
    storeYank({ type: "line", text: lines.join("\n") });
    if (!s.buffer.length) s.buffer.push("");
    if (s.cursor[0] >= s.buffer.length) s.cursor[0] = s.buffer.length - 1;
    s.cursor[1] = 0;
    motionCaret();
    s.modified = true;
  };
  const yankLine = (n = 1) => {
    const s = sRef.current;
    const lines = s.buffer.slice(s.cursor[0], s.cursor[0] + n);
    storeYank({ type: "line", text: lines.join("\n") });
    cb.current.onMessage(`${n} line${n > 1 ? "s" : ""} yanked`);
  };
  const putAfter = () => {
    const s = sRef.current;
    const yank = getActiveYank();
    s.activeRegister = null;
    pushHistory();
    if (yank.type === "line") {
      const lines = yank.text.split("\n");
      s.buffer.splice(s.cursor[0] + 1, 0, ...lines);
      s.cursor[0]++;
      s.cursor[1] = 0;
    } else {
      const line = curLine();
      setCurLine(line.slice(0, s.cursor[1] + 1) + yank.text + line.slice(s.cursor[1] + 1));
      s.cursor[1] += yank.text.length;
    }
    s.modified = true;
  };
  const putBefore = () => {
    const s = sRef.current;
    const yank = getActiveYank();
    s.activeRegister = null;
    pushHistory();
    if (yank.type === "line") {
      const lines = yank.text.split("\n");
      s.buffer.splice(s.cursor[0], 0, ...lines);
      s.cursor[1] = 0;
    } else {
      const line = curLine();
      setCurLine(line.slice(0, s.cursor[1]) + yank.text + line.slice(s.cursor[1]));
    }
    s.modified = true;
  };
  const openLineBelow = () => {
    const s = sRef.current;
    pushHistory();
    const indent = (curLine().match(/^\s*/) || [""])[0];
    s.buffer.splice(s.cursor[0] + 1, 0, indent);
    s.cursor = [s.cursor[0] + 1, indent.length];
    s.mode = "insert";
    s.modified = true;
  };
  const openLineAbove = () => {
    const s = sRef.current;
    pushHistory();
    const indent = (curLine().match(/^\s*/) || [""])[0];
    s.buffer.splice(s.cursor[0], 0, indent);
    s.cursor = [s.cursor[0], indent.length];
    s.mode = "insert";
    s.modified = true;
  };
  const undo = () => {
    const s = sRef.current;
    if (!s.history.length) { cb.current.onMessage("Already at oldest change", "warn"); return; }
    s.redoStack.push({ buffer: s.buffer.slice(), cursor: [...s.cursor] });
    const prev = s.history.pop();
    if (prev) { s.buffer = prev.buffer; s.cursor = prev.cursor; }
    s.flags.undoUsed = true;
    cb.current.onMessage("1 change; older");
  };
  const redo = () => {
    const s = sRef.current;
    if (!s.redoStack.length) { cb.current.onMessage("Already at newest change", "warn"); return; }
    s.history.push({ buffer: s.buffer.slice(), cursor: [...s.cursor] });
    const next = s.redoStack.pop();
    if (next) { s.buffer = next.buffer; s.cursor = next.cursor; }
  };
  const changeWord = () => {
    const s = sRef.current;
    pushHistory();
    const line = curLine();
    const c = s.cursor[1];
    let end = c;
    if (isWord(line[c])) while (end < line.length && isWord(line[end])) end++;
    else while (end < line.length && !isWord(line[end]) && line[end] !== " ") end++;
    setCurLine(line.slice(0, c) + line.slice(end));
    s.mode = "insert";
    s.modified = true;
  };
  const changeEOL = () => {
    const s = sRef.current;
    pushHistory();
    setCurLine(curLine().slice(0, s.cursor[1]));
    s.mode = "insert";
    s.modified = true;
  };

  // ── Visual Range ─────────────────────────────────────────────────────────
  const getVisualRange = () => {
    const s = sRef.current;
    if (!["visual", "visual-line", "visual-block"].includes(s.mode)) return null;
    if (!s.visualStart) return null;
    const a = s.visualStart, b = s.cursor;
    const cmp = a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
    const [start, end] = cmp <= 0 ? [a, b] : [b, a];
    return {
      start,
      end,
      line: s.mode === "visual-line",
      block: s.mode === "visual-block"
    };
  };

  const deleteVisual = () => {
    const s = sRef.current;
    const sel = getVisualRange();
    if (!sel) return;
    pushHistory();
    if (sel.line) {
      const n = sel.end[0] - sel.start[0] + 1;
      const lines = s.buffer.splice(sel.start[0], n);
      storeYank({ type: "line", text: lines.join("\n") });
      if (!s.buffer.length) s.buffer.push("");
      s.cursor = [Math.min(sel.start[0], s.buffer.length - 1), 0];
    } else {
      if (sel.start[0] === sel.end[0]) {
        const line = s.buffer[sel.start[0]];
        const text = line.slice(sel.start[1], sel.end[1] + 1);
        storeYank({ type: "char", text });
        s.buffer[sel.start[0]] = line.slice(0, sel.start[1]) + line.slice(sel.end[1] + 1);
      } else {
        const first = s.buffer[sel.start[0]].slice(0, sel.start[1]);
        const last = s.buffer[sel.end[0]].slice(sel.end[1] + 1);
        const deleted = s.buffer.slice(sel.start[0], sel.end[0] + 1).join("\n");
        storeYank({ type: "char", text: deleted });
        s.buffer.splice(sel.start[0], sel.end[0] - sel.start[0] + 1, first + last);
      }
      s.cursor = [sel.start[0], sel.start[1]];
    }
    s.mode = "normal";
    s.visualStart = null;
    s.modified = true;
  };

  const yankVisual = () => {
    const s = sRef.current;
    const sel = getVisualRange();
    if (!sel) return;
    if (sel.line) {
      storeYank({ type: "line", text: s.buffer.slice(sel.start[0], sel.end[0] + 1).join("\n") });
    } else {
      if (sel.start[0] === sel.end[0]) {
        storeYank({ type: "char", text: s.buffer[sel.start[0]].slice(sel.start[1], sel.end[1] + 1) });
      } else {
        storeYank({ type: "char", text: s.buffer.slice(sel.start[0], sel.end[0] + 1).join("\n") });
      }
    }
    s.mode = "normal";
    s.visualStart = null;
    cb.current.onMessage("yanked");
  };

  // ── Visual Block operations ───────────────────────────────────────────────
  const deleteVisualBlock = () => {
    const s = sRef.current;
    if (!s.visualStart) return;
    const r1 = Math.min(s.visualStart[0], s.cursor[0]);
    const r2 = Math.max(s.visualStart[0], s.cursor[0]);
    const c1 = Math.min(s.visualStart[1], s.cursor[1]);
    const c2 = Math.max(s.visualStart[1], s.cursor[1]);
    pushHistory();
    for (let r = r1; r <= r2; r++) {
      const line = s.buffer[r];
      s.buffer[r] = line.slice(0, c1) + line.slice(c2 + 1);
    }
    s.cursor = [r1, c1];
    s.mode = "normal";
    s.visualStart = null;
    s.modified = true;
  };

  const insertVisualBlock = (text: string) => {
    const s = sRef.current;
    if (!s.visualStart) return;
    const r1 = Math.min(s.visualStart[0], s.cursor[0]);
    const r2 = Math.max(s.visualStart[0], s.cursor[0]);
    const c1 = Math.min(s.visualStart[1], s.cursor[1]);
    pushHistory();
    for (let r = r1; r <= r2; r++) {
      const line = s.buffer[r];
      s.buffer[r] = line.slice(0, c1) + text + line.slice(c1);
    }
    s.cursor = [r1, c1 + text.length];
    s.mode = "normal";
    s.visualStart = null;
    s.modified = true;
    cb.current.onMessage(`◌ Block insert: "${text}" on ${r2 - r1 + 1} lines`, "success");
  };

  // ── Ex Commands / Search ─────────────────────────────────────────────────
  const runExCommand = (raw: string) => {
    const s = sRef.current;
    const cmd = raw.trim();
    if (!cmd) return;
    if (cmd === "w" || cmd === "write") {
      s.modified = false; s.flags.saved = true;
      cb.current.onMessage(`"lesson.txt" ${s.buffer.length}L, ${s.buffer.reduce((a, l) => a + l.length, 0)}B written`, "success");
      return;
    }
    if (cmd === "q" || cmd === "quit") {
      if (s.modified) { cb.current.onMessage("E37: No write since last change", "error"); return; }
      cb.current.onMessage("(simulated: would quit Neovim)"); return;
    }
    if (cmd === "wq" || cmd === "x") { s.modified = false; s.flags.saved = true; cb.current.onMessage("written & quit (simulated)", "success"); return; }
    if (cmd === "q!") { cb.current.onMessage("force quit (simulated)"); return; }
    if (cmd === "noh" || cmd === "nohlsearch") { s.lastSearch = ""; cb.current.onMessage("search cleared"); return; }
    if (/^\d+$/.test(cmd)) { s.cursor = [clamp(parseInt(cmd, 10) - 1, 0, s.buffer.length - 1), 0]; return; }
    const sub = cmd.match(/^(%)?s\/([^/]*)\/([^/]*)\/([gic]*)?$/);
    if (sub) {
      const whole = sub[1] === "%", pat = sub[2], rep = sub[3], flags = sub[4] || "";
      const re = new RegExp(pat, flags.includes("g") ? "g" : "");
      pushHistory();
      let count = 0;
      const apply = (line: string) => line.replace(re, () => (count++, rep));
      if (whole) s.buffer = s.buffer.map(apply);
      else s.buffer[s.cursor[0]] = apply(s.buffer[s.cursor[0]]);
      cb.current.onMessage(`${count} substitution${count === 1 ? "" : "s"}`, "success");
      s.modified = true; return;
    }
    const gCmd = cmd.match(/^g\/([^/]+)\/(.+)$/);
    if (gCmd) {
      const pat = gCmd[1], action = gCmd[2].trim();
      if (action === "d") {
        pushHistory();
        const before = s.buffer.length;
        s.buffer = s.buffer.filter(l => !new RegExp(pat).test(l));
        if (!s.buffer.length) s.buffer.push("");
        s.cursor[0] = Math.min(s.cursor[0], s.buffer.length - 1);
        s.modified = true;
        cb.current.onMessage(`${before - s.buffer.length} lines deleted`, "success");
        return;
      }
    }
    cb.current.onMessage(`E492: Not an editor command: ${cmd}`, "error");
  };

  const runSearch = (pat: string, back = false) => {
    const s = sRef.current;
    if (!pat) return;
    s.lastSearch = pat;
    const start = s.cursor;
    const step = back ? -1 : 1;
    for (let i = 0; i < s.buffer.length; i++) {
      const r = (start[0] + i * step + s.buffer.length) % s.buffer.length;
      const line = s.buffer[r];
      const idx = back ? line.lastIndexOf(pat) : line.indexOf(pat);
      if (idx !== -1 && !(r === start[0] && idx === start[1])) { s.cursor = [r, idx]; return; }
    }
    cb.current.onMessage(`E486: Pattern not found: ${pat}`, "error");
  };

  // ── Leader Handler ───────────────────────────────────────────────────────
  const handleLeader = (key: string) => {
    const s = sRef.current;
    if (s.keyBuf === "") { s.keyBuf = " "; cb.current.onMessage("◌ Leader (which-key): waiting for next key…"); return; }
    s.keyBuf += key;
    const seq = s.keyBuf;
    if (seq === " t" || seq === " f" || seq === " c" || seq === " r") return;
    if (seq === " th") {
      s.theme = (s.theme + 1) % THEMES.length;
      const t = THEMES[s.theme];
      document.documentElement.style.setProperty("--bg", t.bg);
      document.documentElement.style.setProperty("--accent", t.accent);
      s.flags.chadThemeCycled = true;
      cb.current.onMessage(`◌ theme: ${t.name}`, "success");
      s.keyBuf = ""; return;
    }
    if (seq === " ff") {
      s.flags.telescopeOpened = true;
      cb.current.onTelescopeOpen?.("files");
      s.keyBuf = ""; return;
    }
    if (seq === " fw") {
      s.flags.telescopeOpened = true;
      cb.current.onTelescopeOpen?.("grep");
      s.keyBuf = ""; return;
    }
    if (seq === " fb") {
      s.flags.telescopeOpened = true;
      cb.current.onTelescopeOpen?.("buffers");
      s.keyBuf = ""; return;
    }
    if (seq === " e") { s.flags.nvimTreeToggled = true; cb.current.onMessage("◌ NvimTree focus (simulated)", "success"); s.keyBuf = ""; return; }
    if (seq === " h") { s.flags.terminalOpened = true; cb.current.onMessage("◌ Horizontal terminal opened (simulated)", "success"); s.keyBuf = ""; return; }
    if (seq === " v") { s.flags.terminalOpened = true; cb.current.onMessage("◌ Vertical terminal opened (simulated)", "success"); s.keyBuf = ""; return; }
    if (seq === " i") { s.flags.terminalOpened = true; cb.current.onMessage("◌ Floating terminal opened (simulated)", "success"); s.keyBuf = ""; return; }
    if (seq === " x") { cb.current.onMessage("◌ :bd (buffer closed — simulated)"); s.keyBuf = ""; return; }
    if (seq === " n") { cb.current.onMessage("◌ Line numbers toggled (simulated)"); s.keyBuf = ""; return; }
    if (seq === " ch") { s.flags.cheatsheetOpened = true; cb.current.onCheatsheetRequested(); s.keyBuf = ""; return; }
    if (seq === " ra") { cb.current.onMessage("◌ LSP rename (simulated)"); s.keyBuf = ""; return; }
    if (seq === " ca") { cb.current.onMessage("◌ LSP code action (simulated)"); s.keyBuf = ""; return; }
    if (seq.length > 4) s.keyBuf = "";
  };

  const numPrefix = () => {
    const m = sRef.current.keyBuf.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };

  // ── Macros ───────────────────────────────────────────────────────────────
  const serializeKey = (e: KeyboardEvent): string => e.ctrlKey ? `<C-${e.key}>` : e.key;

  const replayMacro = (reg: string) => {
    const s = sRef.current;
    const keys = s.macros[reg];
    if (!keys?.length) { cb.current.onMessage(`E29: No macro in register "${reg}"`, "warn"); return; }
    cb.current.onMessage(`◌ @${reg}: replaying ${keys.length} keys…`);
    keys.forEach(k => {
      const ctrl = k.startsWith("<C-");
      const key = ctrl ? k.slice(3, -1) : k;
      const fake = { key, ctrlKey: ctrl, shiftKey: false, metaKey: false, altKey: false, preventDefault: () => {} } as KeyboardEvent;
      handleKeyRef.current?.(fake);
    });
  };

  // ── Lesson Check ─────────────────────────────────────────────────────────
  const checkLesson = () => {
    const s = sRef.current;
    const lesson = LESSONS[s.currentLesson];
    if (!lesson) return;
    clampCursor();
    if (lesson.check(s) && !completed.has(lesson.id)) {
      const nextCompleted = new Set(completed);
      nextCompleted.add(lesson.id);
      setCompleted(nextCompleted);
      try { localStorage.setItem("nvchad-sim-progress", JSON.stringify([...nextCompleted])); } catch {}
      cb.current.onToast(`✔ Lesson complete: ${lesson.title}`, "success");
      cb.current.onMessage(`✔ Completed: ${lesson.title}`, "success");
      setTimeout(() => { if (s.currentLesson < LESSONS.length - 1) loadLesson(s.currentLesson + 1); }, 1100);
    }
  };

  const loadLesson = useCallback((idx: number) => {
    const lesson = LESSONS[idx];
    if (!lesson) return;
    const s = sRef.current;
    s.currentLesson = idx;
    s.buffer = lesson.buffer.slice();
    s.cursor = [...lesson.initialCursor];
    s.mode = "normal";
    s.keyBuf = "";
    s.visualStart = null;
    s.modified = false;
    s.history = [];
    s.redoStack = [];
    s.cmdText = "";
    s.cmdPrefix = ":";
    s.flags = initialFlags();
    s.macroRecording = null;
    s.macroBuffer = [];
    s.activeRegister = null;
    cb.current.onMessage(`─── Loaded lesson ${idx + 1}: ${lesson.title} ───`);
    rerender();
  }, [rerender]);

  const runCheck = useCallback(() => {
    const s = sRef.current;
    const lesson = LESSONS[s.currentLesson];
    if (lesson.check(s)) {
      const nextCompleted = new Set(completed);
      nextCompleted.add(lesson.id);
      setCompleted(nextCompleted);
      try { localStorage.setItem("nvchad-sim-progress", JSON.stringify([...nextCompleted])); } catch {}
      cb.current.onToast(`✔ ${lesson.title}`, "success");
    } else {
      cb.current.onToast("Not quite — keep trying!", "error");
    }
  }, [completed]);

  const skipLesson = useCallback(() => {
    const s = sRef.current;
    if (s.currentLesson < LESSONS.length - 1) loadLesson(s.currentLesson + 1);
  }, [loadLesson]);

  const wordUnderCursor = () => {
    const line = curLine();
    const c = sRef.current.cursor[1];
    if (!isWord(line[c])) return "";
    let st = c, en = c;
    while (st > 0 && isWord(line[st - 1])) st--;
    while (en < line.length - 1 && isWord(line[en + 1])) en++;
    return line.slice(st, en + 1);
  };

  // ── Main Key Handler ─────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      const s = sRef.current;
      cb.current.onKeyLog(e.key);

      // ── Record macro keys (before processing) ──
      if (s.macroRecording !== null && e.key !== "q") {
        s.macroBuffer.push(serializeKey(e));
      }

      // ── Command mode ──
      if (s.mode === "command") {
        if (e.key === "Escape") { s.mode = "normal"; s.cmdText = ""; rerender(); return; }
        if (e.key === "Enter") {
          const text = s.cmdText, prefix = s.cmdPrefix;
          s.mode = "normal"; s.cmdText = "";
          if (prefix === "/") runSearch(text);
          else if (prefix === "?") runSearch(text, true);
          else runExCommand(text);
          s.cmdPrefix = ":"; checkLesson(); rerender(); return;
        }
        if (e.key === "Backspace") { if (!s.cmdText.length) s.mode = "normal"; else s.cmdText = s.cmdText.slice(0, -1); rerender(); return; }
        if (e.key.length === 1) { s.cmdText += e.key; rerender(); }
        return;
      }

      // ── Insert mode ──
      if (s.mode === "insert") {
        if (e.key === "Escape") { s.mode = "normal"; if (s.cursor[1] > 0) s.cursor[1]--; clampCursor(); checkLesson(); rerender(); return; }
        if (e.key === "Enter") {
          pushHistory();
          const line = curLine(), before = line.slice(0, s.cursor[1]), after = line.slice(s.cursor[1]);
          s.buffer[s.cursor[0]] = before; s.buffer.splice(s.cursor[0] + 1, 0, after);
          s.cursor = [s.cursor[0] + 1, 0]; s.modified = true; checkLesson(); rerender(); return;
        }
        if (e.key === "Backspace") {
          pushHistory();
          if (s.cursor[1] > 0) { const line = curLine(); setCurLine(line.slice(0, s.cursor[1] - 1) + line.slice(s.cursor[1])); s.cursor[1]--; }
          else if (s.cursor[0] > 0) { const prev = s.buffer[s.cursor[0] - 1], cur = s.buffer[s.cursor[0]]; s.buffer.splice(s.cursor[0], 1); s.cursor = [s.cursor[0] - 1, prev.length]; s.buffer[s.cursor[0]] = prev + cur; }
          s.modified = true; checkLesson(); rerender(); return;
        }
        if (e.key === "Tab") {
          pushHistory(); const line = curLine(); setCurLine(line.slice(0, s.cursor[1]) + "  " + line.slice(s.cursor[1])); s.cursor[1] += 2;
          s.modified = true; checkLesson(); rerender(); return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          pushHistory(); const line = curLine(); setCurLine(line.slice(0, s.cursor[1]) + e.key + line.slice(s.cursor[1])); s.cursor[1]++;
          s.modified = true; checkLesson(); rerender(); return;
        }
        return;
      }

      // ── Visual / Visual-line mode ──
      if (s.mode === "visual" || s.mode === "visual-line") {
        // Text object in visual mode (two-key: i/a + object)
        if (s.keyBuf === "vi" || s.keyBuf === "va") {
          const inner = s.keyBuf === "vi"; s.keyBuf = "";
          if (e.key.length >= 1) { applyTextObjectVisual(inner, e.key); checkLesson(); }
          rerender(); return;
        }
        if (e.key === "Escape") { s.mode = "normal"; s.visualStart = null; s.keyBuf = ""; checkLesson(); rerender(); return; }
        const key = e.key;
        if (key === "h") motionH();
        else if (key === "l") motionL();
        else if (key === "j") motionJ();
        else if (key === "k") motionK();
        else if (key === "w") motionW();
        else if (key === "b") motionB();
        else if (key === "e") motionE();
        else if (key === "0") motionZero();
        else if (key === "$") motionDollar();
        else if (key === "G") motionG();
        else if (key === "d" || key === "x") { deleteVisual(); checkLesson(); rerender(); return; }
        else if (key === "y") { yankVisual(); checkLesson(); rerender(); return; }
        else if (key === "c") { deleteVisual(); s.mode = "insert"; checkLesson(); rerender(); return; }
        else if (key === "i") { s.keyBuf = "vi"; rerender(); return; }
        else if (key === "a") { s.keyBuf = "va"; rerender(); return; }
        else if (key === "U") {
          // uppercase selection
          const sel = getVisualRange();
          if (sel) {
            pushHistory();
            for (let r = sel.start[0]; r <= sel.end[0]; r++) {
              const line = s.buffer[r];
              const c1 = r === sel.start[0] ? sel.start[1] : 0;
              const c2 = r === sel.end[0] ? sel.end[1] + 1 : line.length;
              s.buffer[r] = line.slice(0, c1) + line.slice(c1, c2).toUpperCase() + line.slice(c2);
            }
            s.mode = "normal"; s.visualStart = null; s.modified = true; checkLesson(); rerender(); return;
          }
        }
        else if (key === "~") {
          // toggle case
          const sel = getVisualRange();
          if (sel) {
            pushHistory();
            for (let r = sel.start[0]; r <= sel.end[0]; r++) {
              const line = s.buffer[r];
              const c1 = r === sel.start[0] ? sel.start[1] : 0;
              const c2 = r === sel.end[0] ? sel.end[1] + 1 : line.length;
              const toggled = line.slice(c1, c2).split("").map(ch => ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()).join("");
              s.buffer[r] = line.slice(0, c1) + toggled + line.slice(c2);
            }
            s.mode = "normal"; s.visualStart = null; s.modified = true; checkLesson(); rerender(); return;
          }
        }
        else { rerender(); return; }
        rerender(); return;
      }

      // ── Visual-block mode ──
      if (s.mode === "visual-block") {
        if (e.key === "Escape") { s.mode = "normal"; s.visualStart = null; s.keyBuf = ""; rerender(); return; }
        const key = e.key;
        if (key === "h") motionH();
        else if (key === "l") motionL();
        else if (key === "j") motionJ();
        else if (key === "k") motionK();
        else if (key === "0") motionZero();
        else if (key === "$") motionDollar();
        else if (key === "d" || key === "x") { deleteVisualBlock(); checkLesson(); rerender(); return; }
        else if (key === "I") {
          // Block insert: enter insert mode, on exit apply to all block rows
          const r1 = Math.min(s.visualStart![0], s.cursor[0]);
          const c1 = Math.min(s.visualStart![1], s.cursor[1]);
          s.cursor = [r1, c1];
          s.mode = "insert";
          // store block info for when we exit insert
          s.keyBuf = `<block-insert:${r1}:${Math.max(s.visualStart![0], s.cursor[0])}>`;
          s.visualStart = null;
          rerender(); return;
        }
        rerender(); return;
      }

      // ── Normal mode below ──
      if (e.key === "Escape") { s.keyBuf = ""; rerender(); return; }

      // ── Stop macro recording ──
      if (e.key === "q" && s.macroRecording !== null) {
        const reg = s.macroRecording;
        s.macros[reg] = [...s.macroBuffer];
        s.macroRecording = null;
        s.macroBuffer = [];
        cb.current.onMessage(`◌ Macro recorded to register "${reg}" (${s.macros[reg].length} keys)`, "success");
        rerender(); return;
      }

      // ── Ctrl keys ──
      if (e.ctrlKey && !e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === "r") { redo(); checkLesson(); rerender(); return; }
        if (k === "d") { motionJ(10); rerender(); return; }
        if (k === "u") { motionK(10); rerender(); return; }
        if (k === "n") { s.flags.nvimTreeToggled = true; cb.current.onMessage("◌ NvimTree toggled (simulated)", "success"); checkLesson(); rerender(); return; }
        if (k === "w") { s.keyBuf = "<C-w>"; rerender(); return; }
        return;
      }

      // ── Window commands ──
      if (s.keyBuf === "<C-w>") {
        if (e.key === "v") { s.flags.splitVertical = true; cb.current.onMessage("◌ :vsplit (simulated — vertical split opened)", "success"); }
        else if (e.key === "s") { cb.current.onMessage("◌ :split (simulated — horizontal split opened)", "info"); }
        else if (["h", "j", "k", "l", "q"].includes(e.key)) { cb.current.onMessage(`◌ window move: ${e.key}`); }
        s.keyBuf = ""; checkLesson(); rerender(); return;
      }

      // ── Tab (buffer switch) ──
      if (e.key === "Tab") {
        s.flags.bufferSwitched = true;
        cb.current.onMessage(e.shiftKey ? "◌ :bprev" : "◌ :bnext");
        checkLesson(); rerender(); return;
      }

      // ── Leader key ──
      if (e.key === " " || s.keyBuf.startsWith(" ")) { handleLeader(e.key); checkLesson(); rerender(); return; }

      // ── Register prefix ──
      if (s.keyBuf === '"') {
        if (/^[a-z0-9+*"]$/.test(e.key)) { s.activeRegister = e.key; cb.current.onMessage(`◌ register "${e.key}" active`); }
        s.keyBuf = ""; rerender(); return;
      }

      // ── Mark set ──
      if (s.keyBuf === "m") {
        if (/^[a-zA-Z]$/.test(e.key)) { s.marks[e.key] = [...s.cursor]; cb.current.onMessage(`◌ mark '${e.key}' set at ${s.cursor[0] + 1},${s.cursor[1] + 1}`); checkLesson(); }
        s.keyBuf = ""; rerender(); return;
      }

      // ── Mark jump ──
      if (s.keyBuf === "'") {
        if (/^[a-zA-Z]$/.test(e.key)) {
          const mark = s.marks[e.key];
          if (mark) { s.cursor = [mark[0], 0]; clampCursor(); checkLesson(); }
          else cb.current.onMessage(`E20: Mark '${e.key}' not set`, "warn");
        }
        s.keyBuf = ""; rerender(); return;
      }
      if (s.keyBuf === "`") {
        if (/^[a-zA-Z]$/.test(e.key)) {
          const mark = s.marks[e.key];
          if (mark) { s.cursor = [...mark]; clampCursor(); checkLesson(); }
          else cb.current.onMessage(`E20: Mark '${e.key}' not set`, "warn");
        }
        s.keyBuf = ""; rerender(); return;
      }

      // ── Macro start ──
      if (s.keyBuf === "q") {
        if (/^[a-z]$/.test(e.key)) {
          s.macroRecording = e.key;
          s.macroBuffer = [];
          cb.current.onMessage(`◌ Recording macro "${e.key}"… (press q to stop)`, "info");
        }
        s.keyBuf = ""; rerender(); return;
      }

      // ── Macro replay ──
      if (s.keyBuf === "@") {
        if (/^[a-z]$/.test(e.key)) replayMacro(e.key);
        s.keyBuf = ""; rerender(); return;
      }

      // ── Replace char (r) ──
      if (s.keyBuf === "r") {
        if (e.key.length === 1) {
          pushHistory();
          const line = curLine();
          if (s.cursor[1] < line.length) {
            setCurLine(line.slice(0, s.cursor[1]) + e.key + line.slice(s.cursor[1] + 1));
            s.modified = true; checkLesson();
          }
        }
        s.keyBuf = ""; rerender(); return;
      }

      // ── g prefix ──
      if (s.keyBuf === "g") {
        if (e.key === "g") { motionGG(); s.keyBuf = ""; checkLesson(); rerender(); return; }
        if (e.key === "c") { s.keyBuf = "gc"; rerender(); return; }
        s.keyBuf = ""; rerender(); return;
      }
      if (s.keyBuf === "gc") {
        if (e.key === "c") {
          pushHistory();
          const line = curLine(), trimmed = line.trimStart(), indent = line.slice(0, line.length - trimmed.length);
          if (trimmed.startsWith("// ")) setCurLine(indent + trimmed.slice(3));
          else if (trimmed.startsWith("//")) setCurLine(indent + trimmed.slice(2));
          else setCurLine(indent + "// " + trimmed);
          s.modified = true; s.keyBuf = ""; checkLesson(); rerender(); return;
        }
        s.keyBuf = ""; rerender(); return;
      }

      // ── Text object: operator + i/a ──
      if (s.keyBuf === "di" || s.keyBuf === "da") {
        const inner = s.keyBuf === "di"; s.keyBuf = "";
        if (e.key.length >= 1) { applyTextObject("delete", inner, e.key); checkLesson(); }
        rerender(); return;
      }
      if (s.keyBuf === "ci" || s.keyBuf === "ca") {
        const inner = s.keyBuf === "ci"; s.keyBuf = "";
        if (e.key.length >= 1) { applyTextObject("change", inner, e.key); checkLesson(); }
        rerender(); return;
      }
      if (s.keyBuf === "yi" || s.keyBuf === "ya") {
        const inner = s.keyBuf === "yi"; s.keyBuf = "";
        if (e.key.length >= 1) { applyTextObject("yank", inner, e.key); checkLesson(); }
        rerender(); return;
      }

      // ── d operator ──
      if (s.keyBuf === "d") {
        if (e.key === "d") { deleteLine(numPrefix() || 1); s.keyBuf = ""; checkLesson(); rerender(); return; }
        if (e.key === "w") {
          pushHistory(); const line = curLine(), c = s.cursor[1]; let end = c;
          if (isWord(line[c])) while (end < line.length && isWord(line[end])) end++;
          else while (end < line.length && !isWord(line[end]) && line[end] !== " ") end++;
          while (end < line.length && line[end] === " ") end++;
          setCurLine(line.slice(0, c) + line.slice(end)); s.modified = true; s.keyBuf = ""; checkLesson(); rerender(); return;
        }
        if (e.key === "$") { pushHistory(); setCurLine(curLine().slice(0, s.cursor[1])); s.modified = true; s.keyBuf = ""; checkLesson(); rerender(); return; }
        if (e.key === "i") { s.keyBuf = "di"; rerender(); return; }
        if (e.key === "a") { s.keyBuf = "da"; rerender(); return; }
        s.keyBuf = ""; return;
      }

      // ── c operator ──
      if (s.keyBuf === "c") {
        if (e.key === "c") { pushHistory(); const indent = (curLine().match(/^\s*/) || [""])[0]; setCurLine(indent); s.cursor[1] = indent.length; s.mode = "insert"; s.modified = true; s.keyBuf = ""; checkLesson(); rerender(); return; }
        if (e.key === "w") { changeWord(); s.keyBuf = ""; checkLesson(); rerender(); return; }
        if (e.key === "i") { s.keyBuf = "ci"; rerender(); return; }
        if (e.key === "a") { s.keyBuf = "ca"; rerender(); return; }
        s.keyBuf = ""; return;
      }

      // ── y operator ──
      if (s.keyBuf === "y") {
        if (e.key === "y") { yankLine(numPrefix() || 1); s.keyBuf = ""; checkLesson(); rerender(); return; }
        if (e.key === "i") { s.keyBuf = "yi"; rerender(); return; }
        if (e.key === "a") { s.keyBuf = "ya"; rerender(); return; }
        s.keyBuf = ""; return;
      }

      // ── f/F/t/T ──
      if (["f", "F", "t", "T"].includes(s.keyBuf)) {
        if (e.key.length === 1) { motionFind(e.key, s.keyBuf === "t" || s.keyBuf === "T", s.keyBuf === "F" || s.keyBuf === "T"); s.keyBuf = ""; checkLesson(); rerender(); return; }
        s.keyBuf = ""; return;
      }

      // ── Digit prefix ──
      if (/^\d$/.test(e.key) && !(e.key === "0" && s.keyBuf === "")) { s.keyBuf += e.key; rerender(); return; }

      // ── Single-key commands ──
      const key = e.key;
      let handled = true;
      switch (key) {
        case "h": motionH(numPrefix() || 1); break;
        case "j": { const n = numPrefix() || 1; if (n === 3) s.flags.counts3jUsed = true; motionJ(n); break; }
        case "k": motionK(numPrefix() || 1); break;
        case "l": motionL(numPrefix() || 1); break;
        case "w": motionW(numPrefix() || 1); break;
        case "b": motionB(numPrefix() || 1); break;
        case "e": motionE(numPrefix() || 1); break;
        case "0": motionZero(); break;
        case "^": motionCaret(); break;
        case "$": motionDollar(); break;
        case "G": motionG(); break;
        case "g": s.keyBuf = "g"; rerender(); return;
        case "i": s.mode = "insert"; break;
        case "I": motionCaret(); s.mode = "insert"; break;
        case "a": if (s.cursor[1] < curLine().length) s.cursor[1]++; s.mode = "insert"; break;
        case "A": s.cursor[1] = curLine().length; s.mode = "insert"; break;
        case "o": openLineBelow(); break;
        case "O": openLineAbove(); break;
        case "x": deleteCharUnder(); break;
        case "X": {
          if (s.cursor[1] > 0) { s.cursor[1]--; deleteCharUnder(); }
          break;
        }
        case "d": s.keyBuf = "d"; rerender(); return;
        case "c": s.keyBuf = "c"; rerender(); return;
        case "y": s.keyBuf = "y"; rerender(); return;
        case "D": changeEOL(); s.mode = "normal"; break;
        case "C": changeEOL(); break;
        case "p": putAfter(); break;
        case "P": putBefore(); break;
        case "u": undo(); break;
        case "r": s.keyBuf = "r"; rerender(); return;
        case "v": s.mode = "visual"; s.visualStart = [...s.cursor]; break;
        case "V": s.mode = "visual-line"; s.visualStart = [...s.cursor]; break;
        case "/": s.mode = "command"; s.cmdText = ""; s.cmdPrefix = "/"; break;
        case "?": s.mode = "command"; s.cmdText = ""; s.cmdPrefix = "?"; break;
        case ":": s.mode = "command"; s.cmdText = ""; s.cmdPrefix = ":"; break;
        case "n": if (s.lastSearch) runSearch(s.lastSearch); break;
        case "N": if (s.lastSearch) runSearch(s.lastSearch, true); break;
        case "f": case "F": case "t": case "T": s.keyBuf = key; rerender(); return;
        case ";": if (lastFindRef.current) motionFind(lastFindRef.current.char, lastFindRef.current.till, lastFindRef.current.back); break;
        case ",": if (lastFindRef.current) motionFind(lastFindRef.current.char, lastFindRef.current.till, !lastFindRef.current.back); break;
        case "K": { const word = wordUnderCursor(); s.flags.lspHover = true; cb.current.onMessage(`◌ Hover: ${word || "(no word)"} — (simulated LSP hover)`); break; }
        case "~": {
          pushHistory(); const line = curLine(); if (line[s.cursor[1]]) { const ch = line[s.cursor[1]]; const toggled = ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase(); setCurLine(line.slice(0, s.cursor[1]) + toggled + line.slice(s.cursor[1] + 1)); motionL(); s.modified = true; }
          break;
        }
        case "J": {
          // Join line below
          if (s.cursor[0] < s.buffer.length - 1) { pushHistory(); const curr = curLine().trimEnd(), next = s.buffer[s.cursor[0] + 1].trimStart(); s.buffer[s.cursor[0]] = curr + " " + next; s.buffer.splice(s.cursor[0] + 1, 1); s.cursor[1] = curr.length; s.modified = true; }
          break;
        }
        case ">": { pushHistory(); setCurLine("  " + curLine()); s.modified = true; break; }
        case "<": { pushHistory(); setCurLine(curLine().replace(/^  /, "")); s.modified = true; break; }
        case "*": {
          const word = wordUnderCursor();
          if (word) runSearch(word);
          break;
        }
        case "q": s.keyBuf = "q"; rerender(); return;
        case "@": s.keyBuf = "@"; rerender(); return;
        case '"': s.keyBuf = '"'; rerender(); return;
        case "m": s.keyBuf = "m"; rerender(); return;
        case "'": s.keyBuf = "'"; rerender(); return;
        case "`": s.keyBuf = "`"; rerender(); return;
        default: handled = false;
      }
      if (!handled) { s.keyBuf = ""; return; }
      s.keyBuf = "";
      checkLesson();
      rerender();
    },
    [completed, loadLesson, rerender]
  );

  // Keep handleKeyRef updated for macro replay
  useEffect(() => { handleKeyRef.current = handleKey; }, [handleKey]);

  const state = {
    mode: sRef.current.mode,
    buffer: sRef.current.buffer,
    cursor: sRef.current.cursor,
    keyBuf: sRef.current.keyBuf,
    cmdText: sRef.current.cmdText,
    cmdPrefix: sRef.current.cmdPrefix,
    modified: sRef.current.modified,
    currentLesson: sRef.current.currentLesson,
    visualStart: sRef.current.visualStart,
    visualRange: getVisualRange(),
    macroRecording: sRef.current.macroRecording
  };

  return { state, completed, handleKey, loadLesson, runCheck, skipLesson };
}
