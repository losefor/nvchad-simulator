export type Mode = "normal" | "insert" | "visual" | "visual-line" | "visual-block" | "command";
export type Section = "BEGINNER" | "MEDIUM" | "ADVANCED" | "GRADUATION";

export interface SimulatorFlags {
  undoUsed: boolean;
  counts3jUsed: boolean;
  chadThemeCycled: boolean;
  telescopeOpened: boolean;
  nvimTreeToggled: boolean;
  bufferSwitched: boolean;
  terminalOpened: boolean;
  lspHover: boolean;
  splitVertical: boolean;
  saved: boolean;
  cheatsheetOpened: boolean;
}

export interface Yank {
  type: "line" | "char";
  text: string;
}

export interface HistoryEntry {
  buffer: string[];
  cursor: [number, number];
}

export interface VisualRange {
  start: [number, number];
  end: [number, number];
  line: boolean;
  block: boolean;
}

export interface SimulatorState {
  mode: Mode;
  buffer: string[];
  cursor: [number, number];
  keyBuf: string;
  cmdText: string;
  cmdPrefix: string;
  lastSearch: string;
  lastYank: Yank;
  history: HistoryEntry[];
  redoStack: HistoryEntry[];
  visualStart: [number, number] | null;
  modified: boolean;
  currentLesson: number;
  theme: number;
  flags: SimulatorFlags;
  registers: Record<string, Yank>;
  macros: Record<string, string[]>;
  macroRecording: string | null;
  macroBuffer: string[];
  activeRegister: string | null;
  marks: Record<string, [number, number]>;
}

export interface Lesson {
  id: string;
  title: string;
  section: Section;
  badge: string;
  desc: string;
  task: string;
  buffer: string[];
  initialCursor: [number, number];
  hints: string[];
  check: (state: SimulatorState) => boolean;
}

export interface Theme {
  name: string;
  bg: string;
  fg: string;
  accent: string;
  green: string;
  red: string;
  blue: string;
}

export interface CheatsheetGroup {
  group: string;
  items: Array<[string, string]>;
}

export interface Message {
  text: string;
  kind: "info" | "success" | "error" | "warn";
}

export interface KeyLogEntry {
  key: string;
  time: string;
}

export interface Toast {
  text: string;
  kind: "info" | "success" | "error" | "warn";
}

export interface UseSimulatorCallbacks {
  onToast: (text: string, kind: Message["kind"]) => void;
  onMessage: (text: string, kind?: Message["kind"]) => void;
  onKeyLog: (key: string) => void;
  onCheatsheetRequested: () => void;
  onTelescopeOpen?: (type: "files" | "grep" | "buffers") => void;
  onSave?: (buffer: string[]) => void;
  onQuit?: () => void;
  onNvimTreeToggle?: () => void;
  onTerminalToggle?: () => void;
  onOpenFile?: (pathStr: string) => void;
}

export interface UseSimulatorReturn {
  state: SimulatorState;
  completed: Set<string>;
  handleKey: (e: KeyboardEvent) => void;
  loadLesson: (index: number) => void;
  loadBuffer: (lines: string[], filename?: string) => void;
  runCheck: () => void;
  skipLesson: () => void;
}
