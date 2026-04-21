import { useCallback, useEffect, useRef, useState } from "react";
import { LESSONS, THEMES } from "../data/lessons";
import type { SimulatorState, UseSimulatorCallbacks, UseSimulatorReturn } from "../types";

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
    flags: initialFlags()
  };
}

export function useSimulator({ onToast, onMessage, onKeyLog, onCheatsheetRequested }: UseSimulatorCallbacks): UseSimulatorReturn {
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

  const cb = useRef({ onToast, onMessage, onKeyLog, onCheatsheetRequested });
  useEffect(() => {
    cb.current = { onToast, onMessage, onKeyLog, onCheatsheetRequested };
  }, [onToast, onMessage, onKeyLog, onCheatsheetRequested]);

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

  const motionH = (n = 1) => {
    sRef.current.cursor[1] = Math.max(0, sRef.current.cursor[1] - n);
  };
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
  const motionZero = () => {
    sRef.current.cursor[1] = 0;
  };
  const motionCaret = () => {
    const line = curLine();
    const m = line.match(/^\s*/);
    sRef.current.cursor[1] = m ? m[0].length : 0;
  };
  const motionDollar = () => {
    sRef.current.cursor[1] = Math.max(0, curLine().length - 1);
  };
  const motionGG = () => {
    sRef.current.cursor = [0, 0];
  };
  const motionG = () => {
    sRef.current.cursor = [sRef.current.buffer.length - 1, 0];
  };
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
      if (c >= line.length && r < s.buffer.length - 1) {
        r++;
        c = 0;
        while (c < s.buffer[r].length && s.buffer[r][c] === " ") c++;
      }
      s.cursor = [r, c];
    }
  };
  const motionB = (n = 1) => {
    const s = sRef.current;
    for (let i = 0; i < n; i++) {
      let [r, c] = s.cursor;
      if (c === 0 && r > 0) {
        r--;
        c = s.buffer[r].length;
      }
      let line = s.buffer[r];
      while (c > 0 && line[c - 1] === " ") c--;
      if (c > 0 && isWord(line[c - 1])) while (c > 0 && isWord(line[c - 1])) c--;
      else if (c > 0)
        while (c > 0 && !isWord(line[c - 1]) && line[c - 1] !== " ") c--;
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
      if (c >= line.length && r < s.buffer.length - 1) {
        r++;
        line = s.buffer[r];
        c = 0;
      }
      if (isWord(line[c])) while (c + 1 < line.length && isWord(line[c + 1])) c++;
      else
        while (c + 1 < line.length && !isWord(line[c + 1]) && line[c + 1] !== " ")
          c++;
      s.cursor = [r, c];
    }
  };
  const motionFind = (ch: string, till = false, back = false) => {
    const s = sRef.current;
    const line = curLine();
    const c = s.cursor[1];
    if (back) {
      for (let i = c - 1; i >= 0; i--)
        if (line[i] === ch) {
          s.cursor[1] = till ? i + 1 : i;
          return;
        }
    } else {
      for (let i = c + 1; i < line.length; i++)
        if (line[i] === ch) {
          s.cursor[1] = till ? i - 1 : i;
          return;
        }
    }
    cb.current.onMessage(`'${ch}' not found on line`, "warn");
  };

  const deleteCharUnder = () => {
    const s = sRef.current;
    pushHistory();
    const line = curLine();
    if (!line.length) return;
    setCurLine(line.slice(0, s.cursor[1]) + line.slice(s.cursor[1] + 1));
    if (s.cursor[1] >= curLine().length && s.cursor[1] > 0) s.cursor[1]--;
    s.modified = true;
  };
  const deleteLine = (n = 1) => {
    const s = sRef.current;
    pushHistory();
    const lines = s.buffer.splice(s.cursor[0], n);
    s.lastYank = { type: "line", text: lines.join("\n") };
    if (!s.buffer.length) s.buffer.push("");
    if (s.cursor[0] >= s.buffer.length) s.cursor[0] = s.buffer.length - 1;
    s.cursor[1] = 0;
    motionCaret();
    s.modified = true;
  };
  const yankLine = (n = 1) => {
    const s = sRef.current;
    const lines = s.buffer.slice(s.cursor[0], s.cursor[0] + n);
    s.lastYank = { type: "line", text: lines.join("\n") };
    cb.current.onMessage(`${n} line${n > 1 ? "s" : ""} yanked`);
  };
  const putAfter = () => {
    const s = sRef.current;
    pushHistory();
    if (s.lastYank.type === "line") {
      const lines = s.lastYank.text.split("\n");
      s.buffer.splice(s.cursor[0] + 1, 0, ...lines);
      s.cursor[0]++;
      s.cursor[1] = 0;
    } else {
      const line = curLine();
      setCurLine(
        line.slice(0, s.cursor[1] + 1) + s.lastYank.text + line.slice(s.cursor[1] + 1)
      );
      s.cursor[1] += s.lastYank.text.length;
    }
    s.modified = true;
  };
  const putBefore = () => {
    const s = sRef.current;
    pushHistory();
    if (s.lastYank.type === "line") {
      const lines = s.lastYank.text.split("\n");
      s.buffer.splice(s.cursor[0], 0, ...lines);
      s.cursor[1] = 0;
    } else {
      const line = curLine();
      setCurLine(line.slice(0, s.cursor[1]) + s.lastYank.text + line.slice(s.cursor[1]));
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
    if (!s.history.length) {
      cb.current.onMessage("Already at oldest change", "warn");
      return;
    }
    s.redoStack.push({ buffer: s.buffer.slice(), cursor: [...s.cursor] });
    const prev = s.history.pop();
    if (prev) {
      s.buffer = prev.buffer;
      s.cursor = prev.cursor;
    }
    s.flags.undoUsed = true;
    cb.current.onMessage("1 change; older");
  };
  const redo = () => {
    const s = sRef.current;
    if (!s.redoStack.length) {
      cb.current.onMessage("Already at newest change", "warn");
      return;
    }
    s.history.push({ buffer: s.buffer.slice(), cursor: [...s.cursor] });
    const next = s.redoStack.pop();
    if (next) {
      s.buffer = next.buffer;
      s.cursor = next.cursor;
    }
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
    const line = curLine();
    setCurLine(line.slice(0, s.cursor[1]));
    s.mode = "insert";
    s.modified = true;
  };

  const getVisualRange = () => {
    const s = sRef.current;
    if (s.mode !== "visual" && s.mode !== "visual-line") return null;
    if (!s.visualStart) return null;
    const a = s.visualStart;
    const b = s.cursor;
    const cmp =
      a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
    const [start, end] = cmp <= 0 ? [a, b] : [b, a];
    return { start, end, line: s.mode === "visual-line" };
  };
  const deleteVisual = () => {
    const s = sRef.current;
    const sel = getVisualRange();
    if (!sel) return;
    pushHistory();
    if (sel.line) {
      const n = sel.end[0] - sel.start[0] + 1;
      s.buffer.splice(sel.start[0], n);
      if (!s.buffer.length) s.buffer.push("");
      s.cursor = [Math.min(sel.start[0], s.buffer.length - 1), 0];
    } else {
      if (sel.start[0] === sel.end[0]) {
        const line = s.buffer[sel.start[0]];
        s.buffer[sel.start[0]] =
          line.slice(0, sel.start[1]) + line.slice(sel.end[1] + 1);
      } else {
        const first = s.buffer[sel.start[0]].slice(0, sel.start[1]);
        const last = s.buffer[sel.end[0]].slice(sel.end[1] + 1);
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
      s.lastYank = {
        type: "line",
        text: s.buffer.slice(sel.start[0], sel.end[0] + 1).join("\n")
      };
    }
    s.mode = "normal";
    s.visualStart = null;
    cb.current.onMessage("yanked");
  };

  const runExCommand = (raw: string) => {
    const s = sRef.current;
    const cmd = raw.trim();
    if (!cmd) return;
    if (cmd === "w" || cmd === "write") {
      s.modified = false;
      s.flags.saved = true;
      cb.current.onMessage(
        `"lesson.txt" ${s.buffer.length}L, ${s.buffer.reduce((a, l) => a + l.length, 0)}B written`,
        "success"
      );
      return;
    }
    if (cmd === "q" || cmd === "quit") {
      if (s.modified) {
        cb.current.onMessage("E37: No write since last change", "error");
        return;
      }
      cb.current.onMessage("(simulated: would quit Neovim)");
      return;
    }
    if (cmd === "wq" || cmd === "x") {
      s.modified = false;
      s.flags.saved = true;
      cb.current.onMessage("written & quit (simulated)", "success");
      return;
    }
    if (cmd === "q!") {
      cb.current.onMessage("force quit (simulated)");
      return;
    }
    if (cmd === "noh" || cmd === "nohlsearch") {
      s.lastSearch = "";
      cb.current.onMessage("search cleared");
      return;
    }
    if (/^\d+$/.test(cmd)) {
      s.cursor = [clamp(parseInt(cmd, 10) - 1, 0, s.buffer.length - 1), 0];
      return;
    }
    const sub = cmd.match(/^(%)?s\/([^/]*)\/([^/]*)\/([gic]*)?$/);
    if (sub) {
      const whole = sub[1] === "%";
      const pat = sub[2],
        rep = sub[3],
        flags = sub[4] || "";
      const re = new RegExp(pat, flags.includes("g") ? "g" : "");
      pushHistory();
      let count = 0;
      const apply = (line: string) => line.replace(re, () => (count++, rep));
      if (whole) s.buffer = s.buffer.map(apply);
      else s.buffer[s.cursor[0]] = apply(s.buffer[s.cursor[0]]);
      cb.current.onMessage(`${count} substitution${count === 1 ? "" : "s"}`, "success");
      s.modified = true;
      return;
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
      if (idx !== -1 && !(r === start[0] && idx === start[1])) {
        s.cursor = [r, idx];
        return;
      }
    }
    cb.current.onMessage(`E486: Pattern not found: ${pat}`, "error");
  };

  const handleLeader = (key: string) => {
    const s = sRef.current;
    if (s.keyBuf === "") {
      s.keyBuf = " ";
      cb.current.onMessage("◌ Leader (which-key): waiting for next key…");
      return;
    }
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
      s.keyBuf = "";
      return;
    }
    if (seq === " ff") {
      s.flags.telescopeOpened = true;
      cb.current.onMessage("◌ Telescope find_files ─── (simulated)", "success");
      cb.current.onMessage("    ├ lua/chadrc.lua");
      cb.current.onMessage("    ├ lua/plugins/init.lua");
      cb.current.onMessage("    └ lua/mappings.lua");
      s.keyBuf = "";
      return;
    }
    if (seq === " fw") {
      cb.current.onMessage("◌ Telescope live_grep (simulated)", "success");
      s.keyBuf = "";
      return;
    }
    if (seq === " fb") {
      cb.current.onMessage("◌ Telescope buffers (simulated)", "success");
      s.keyBuf = "";
      return;
    }
    if (seq === " e") {
      s.flags.nvimTreeToggled = true;
      cb.current.onMessage("◌ NvimTree focus (simulated)", "success");
      s.keyBuf = "";
      return;
    }
    if (seq === " h") {
      s.flags.terminalOpened = true;
      cb.current.onMessage("◌ Horizontal terminal opened (simulated)", "success");
      s.keyBuf = "";
      return;
    }
    if (seq === " v") {
      s.flags.terminalOpened = true;
      cb.current.onMessage("◌ Vertical terminal opened (simulated)", "success");
      s.keyBuf = "";
      return;
    }
    if (seq === " i") {
      s.flags.terminalOpened = true;
      cb.current.onMessage("◌ Floating terminal opened (simulated)", "success");
      s.keyBuf = "";
      return;
    }
    if (seq === " x") {
      cb.current.onMessage("◌ :bd (buffer closed — simulated)");
      s.keyBuf = "";
      return;
    }
    if (seq === " n") {
      cb.current.onMessage("◌ Line numbers toggled (simulated)");
      s.keyBuf = "";
      return;
    }
    if (seq === " ch") {
      s.flags.cheatsheetOpened = true;
      cb.current.onCheatsheetRequested();
      s.keyBuf = "";
      return;
    }
    if (seq === " ra") {
      cb.current.onMessage("◌ LSP rename (simulated)");
      s.keyBuf = "";
      return;
    }
    if (seq === " ca") {
      cb.current.onMessage("◌ LSP code action (simulated)");
      s.keyBuf = "";
      return;
    }

    if (seq.length > 4) s.keyBuf = "";
  };

  const numPrefix = () => {
    const m = sRef.current.keyBuf.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };

  const checkLesson = () => {
    const s = sRef.current;
    const lesson = LESSONS[s.currentLesson];
    if (!lesson) return;
    clampCursor();
    if (lesson.check(s) && !completed.has(lesson.id)) {
      const nextCompleted = new Set(completed);
      nextCompleted.add(lesson.id);
      setCompleted(nextCompleted);
      try {
        localStorage.setItem(
          "nvchad-sim-progress",
          JSON.stringify([...nextCompleted])
        );
      } catch {}
      cb.current.onToast(`✔ Lesson complete: ${lesson.title}`, "success");
      cb.current.onMessage(`✔ Completed: ${lesson.title}`, "success");
      setTimeout(() => {
        if (s.currentLesson < LESSONS.length - 1) {
          loadLesson(s.currentLesson + 1);
        }
      }, 1100);
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
      try {
        localStorage.setItem(
          "nvchad-sim-progress",
          JSON.stringify([...nextCompleted])
        );
      } catch {}
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
    let st = c,
      en = c;
    while (st > 0 && isWord(line[st - 1])) st--;
    while (en < line.length - 1 && isWord(line[en + 1])) en++;
    return line.slice(st, en + 1);
  };

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      const s = sRef.current;
      cb.current.onKeyLog(e.key);

      if (s.mode === "command") {
        if (e.key === "Escape") {
          s.mode = "normal";
          s.cmdText = "";
          rerender();
          return;
        }
        if (e.key === "Enter") {
          const text = s.cmdText;
          const prefix = s.cmdPrefix;
          s.mode = "normal";
          s.cmdText = "";
          if (prefix === "/") runSearch(text);
          else if (prefix === "?") runSearch(text, true);
          else runExCommand(text);
          s.cmdPrefix = ":";
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "Backspace") {
          if (!s.cmdText.length) s.mode = "normal";
          else s.cmdText = s.cmdText.slice(0, -1);
          rerender();
          return;
        }
        if (e.key.length === 1) {
          s.cmdText += e.key;
          rerender();
        }
        return;
      }

      if (s.mode === "insert") {
        if (e.key === "Escape") {
          s.mode = "normal";
          if (s.cursor[1] > 0) s.cursor[1]--;
          clampCursor();
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "Enter") {
          pushHistory();
          const line = curLine();
          const before = line.slice(0, s.cursor[1]);
          const after = line.slice(s.cursor[1]);
          s.buffer[s.cursor[0]] = before;
          s.buffer.splice(s.cursor[0] + 1, 0, after);
          s.cursor = [s.cursor[0] + 1, 0];
          s.modified = true;
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "Backspace") {
          pushHistory();
          if (s.cursor[1] > 0) {
            const line = curLine();
            setCurLine(line.slice(0, s.cursor[1] - 1) + line.slice(s.cursor[1]));
            s.cursor[1]--;
          } else if (s.cursor[0] > 0) {
            const prev = s.buffer[s.cursor[0] - 1];
            const cur = s.buffer[s.cursor[0]];
            s.buffer.splice(s.cursor[0], 1);
            s.cursor = [s.cursor[0] - 1, prev.length];
            s.buffer[s.cursor[0]] = prev + cur;
          }
          s.modified = true;
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "Tab") {
          pushHistory();
          const line = curLine();
          setCurLine(line.slice(0, s.cursor[1]) + "  " + line.slice(s.cursor[1]));
          s.cursor[1] += 2;
          s.modified = true;
          checkLesson();
          rerender();
          return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          pushHistory();
          const line = curLine();
          setCurLine(line.slice(0, s.cursor[1]) + e.key + line.slice(s.cursor[1]));
          s.cursor[1]++;
          s.modified = true;
          checkLesson();
          rerender();
          return;
        }
        return;
      }

      if (s.mode === "visual" || s.mode === "visual-line") {
        if (e.key === "Escape") {
          s.mode = "normal";
          s.visualStart = null;
          checkLesson();
          rerender();
          return;
        }
        const key = e.key;
        if (key === "h") motionH();
        else if (key === "l") motionL();
        else if (key === "j") motionJ();
        else if (key === "k") motionK();
        else if (key === "w") motionW();
        else if (key === "b") motionB();
        else if (key === "0") motionZero();
        else if (key === "$") motionDollar();
        else if (key === "G") motionG();
        else if (key === "d" || key === "x") {
          deleteVisual();
          checkLesson();
          rerender();
          return;
        } else if (key === "y") {
          yankVisual();
          checkLesson();
          rerender();
          return;
        } else if (key === "c") {
          deleteVisual();
          s.mode = "insert";
          checkLesson();
          rerender();
          return;
        } else return;
        rerender();
        return;
      }

      if (e.key === "Escape") {
        s.keyBuf = "";
        rerender();
        return;
      }

      if (e.ctrlKey && !e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === "r") {
          redo();
          checkLesson();
          rerender();
          return;
        }
        if (k === "d") {
          motionJ(10);
          rerender();
          return;
        }
        if (k === "u") {
          motionK(10);
          rerender();
          return;
        }
        if (k === "n") {
          s.flags.nvimTreeToggled = true;
          cb.current.onMessage("◌ NvimTree toggled (simulated)", "success");
          checkLesson();
          rerender();
          return;
        }
        if (k === "w") {
          s.keyBuf = "<C-w>";
          rerender();
          return;
        }
        return;
      }

      if (s.keyBuf === "<C-w>") {
        const key = e.key;
        if (key === "v") {
          s.flags.splitVertical = true;
          cb.current.onMessage("◌ :vsplit (simulated — vertical split opened)", "success");
        } else if (key === "s") {
          cb.current.onMessage("◌ :split (simulated — horizontal split opened)", "info");
        } else if (["h", "j", "k", "l", "q"].includes(key)) {
          cb.current.onMessage(`◌ window move: ${key}`);
        }
        s.keyBuf = "";
        checkLesson();
        rerender();
        return;
      }

      if (e.key === "Tab") {
        s.flags.bufferSwitched = true;
        cb.current.onMessage(e.shiftKey ? "◌ :bprev" : "◌ :bnext");
        checkLesson();
        rerender();
        return;
      }

      if (e.key === " " || s.keyBuf.startsWith(" ")) {
        handleLeader(e.key);
        checkLesson();
        rerender();
        return;
      }

      if (s.keyBuf === "g") {
        if (e.key === "g") {
          motionGG();
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "c") {
          s.keyBuf = "gc";
          rerender();
          return;
        }
        s.keyBuf = "";
        rerender();
        return;
      }
      if (s.keyBuf === "gc") {
        if (e.key === "c") {
          pushHistory();
          const line = curLine();
          const trimmed = line.trimStart();
          const indent = line.slice(0, line.length - trimmed.length);
          if (trimmed.startsWith("// ")) setCurLine(indent + trimmed.slice(3));
          else if (trimmed.startsWith("//")) setCurLine(indent + trimmed.slice(2));
          else setCurLine(indent + "// " + trimmed);
          s.modified = true;
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        s.keyBuf = "";
        rerender();
        return;
      }

      if (s.keyBuf === "d") {
        if (e.key === "d") {
          deleteLine(numPrefix() || 1);
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "w") {
          pushHistory();
          const line = curLine();
          const c = s.cursor[1];
          let end = c;
          if (isWord(line[c])) while (end < line.length && isWord(line[end])) end++;
          else
            while (end < line.length && !isWord(line[end]) && line[end] !== " ")
              end++;
          while (end < line.length && line[end] === " ") end++;
          setCurLine(line.slice(0, c) + line.slice(end));
          s.modified = true;
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        s.keyBuf = "";
        return;
      }
      if (s.keyBuf === "c") {
        if (e.key === "c") {
          pushHistory();
          const indent = (curLine().match(/^\s*/) || [""])[0];
          setCurLine(indent);
          s.cursor[1] = indent.length;
          s.mode = "insert";
          s.modified = true;
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        if (e.key === "w") {
          changeWord();
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        s.keyBuf = "";
        return;
      }
      if (s.keyBuf === "y") {
        if (e.key === "y") {
          yankLine(numPrefix() || 1);
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        s.keyBuf = "";
        return;
      }
      if (["f", "F", "t", "T"].includes(s.keyBuf)) {
        if (e.key.length === 1) {
          motionFind(
            e.key,
            s.keyBuf === "t" || s.keyBuf === "T",
            s.keyBuf === "F" || s.keyBuf === "T"
          );
          s.keyBuf = "";
          checkLesson();
          rerender();
          return;
        }
        s.keyBuf = "";
        return;
      }

      if (/^\d$/.test(e.key) && !(e.key === "0" && s.keyBuf === "")) {
        s.keyBuf += e.key;
        rerender();
        return;
      }

      const key = e.key;
      let handled = true;
      switch (key) {
        case "h":
          motionH(numPrefix() || 1);
          break;
        case "j": {
          const n = numPrefix() || 1;
          if (n === 3 && /^3$/.test(s.keyBuf.replace(/[^\d]/g, "")))
            s.flags.counts3jUsed = true;
          motionJ(n);
          break;
        }
        case "k":
          motionK(numPrefix() || 1);
          break;
        case "l":
          motionL(numPrefix() || 1);
          break;
        case "w":
          motionW(numPrefix() || 1);
          break;
        case "b":
          motionB(numPrefix() || 1);
          break;
        case "e":
          motionE(numPrefix() || 1);
          break;
        case "0":
          motionZero();
          break;
        case "^":
          motionCaret();
          break;
        case "$":
          motionDollar();
          break;
        case "G":
          motionG();
          break;
        case "g":
          s.keyBuf = "g";
          rerender();
          return;
        case "i":
          s.mode = "insert";
          break;
        case "I":
          motionCaret();
          s.mode = "insert";
          break;
        case "a":
          if (s.cursor[1] < curLine().length) s.cursor[1]++;
          s.mode = "insert";
          break;
        case "A":
          s.cursor[1] = curLine().length;
          s.mode = "insert";
          break;
        case "o":
          openLineBelow();
          break;
        case "O":
          openLineAbove();
          break;
        case "x":
          deleteCharUnder();
          break;
        case "d":
          s.keyBuf = "d";
          rerender();
          return;
        case "c":
          s.keyBuf = "c";
          rerender();
          return;
        case "y":
          s.keyBuf = "y";
          rerender();
          return;
        case "D":
          changeEOL();
          s.mode = "normal";
          break;
        case "C":
          changeEOL();
          break;
        case "p":
          putAfter();
          break;
        case "P":
          putBefore();
          break;
        case "u":
          undo();
          break;
        case "v":
          s.mode = "visual";
          s.visualStart = [...s.cursor];
          break;
        case "V":
          s.mode = "visual-line";
          s.visualStart = [...s.cursor];
          break;
        case "/":
          s.mode = "command";
          s.cmdText = "";
          s.cmdPrefix = "/";
          break;
        case "?":
          s.mode = "command";
          s.cmdText = "";
          s.cmdPrefix = "?";
          break;
        case ":":
          s.mode = "command";
          s.cmdText = "";
          s.cmdPrefix = ":";
          break;
        case "n":
          if (s.lastSearch) runSearch(s.lastSearch);
          break;
        case "N":
          if (s.lastSearch) runSearch(s.lastSearch, true);
          break;
        case "f":
        case "F":
        case "t":
        case "T":
          s.keyBuf = key;
          rerender();
          return;
        case "K": {
          const word = wordUnderCursor();
          s.flags.lspHover = true;
          cb.current.onMessage(
            `◌ Hover: ${word || "(no word)"} — (simulated LSP hover)`
          );
          break;
        }
        default:
          handled = false;
      }
      if (!handled) {
        s.keyBuf = "";
        return;
      }
      s.keyBuf = "";
      checkLesson();
      rerender();
    },
    [completed, loadLesson, rerender]
  );

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
    visualRange: getVisualRange()
  };

  return {
    state,
    completed,
    handleKey,
    loadLesson,
    runCheck,
    skipLesson
  };
}
