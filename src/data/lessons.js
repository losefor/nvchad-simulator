/* ============================================================
   NvChad Interactive Course — Lesson definitions
   Organized into: BEGINNER / MEDIUM / ADVANCED
   ============================================================ */

export const LESSONS = [
  // ═══════════════════════════════════════════════════════════
  // ░░░ BEGINNER ░░░
  // ═══════════════════════════════════════════════════════════

  {
    id: "b-welcome",
    title: "Welcome to NvChad",
    section: "BEGINNER",
    badge: "basics",
    desc: "NvChad is a beautiful Neovim config. This interactive course will teach you Neovim fundamentals and NvChad-specific commands. Let's begin.",
    task: "Press <code>l</code> (lowercase L) to move the cursor one character to the right. Do it a few times until you reach the end of the first word.",
    buffer: [
      "Hello, Neovim! Welcome to the NvChad simulator.",
      "",
      "Use motions to move, not the arrow keys.",
      "Press l to move right, h to move left."
    ],
    initialCursor: [0, 0],
    hints: [
      "In NORMAL mode, <code>h j k l</code> are the core motion keys.",
      "<code>h</code> = left, <code>j</code> = down, <code>k</code> = up, <code>l</code> = right.",
      "Arrow keys work too, but hjkl keeps your fingers on home row."
    ],
    check: (s) => s.cursor[0] === 0 && s.cursor[1] >= 5
  },
  {
    id: "b-hjkl",
    title: "The hjkl Motion Keys",
    section: "BEGINNER",
    badge: "motion",
    desc: "hjkl is the foundation of Neovim movement. Drill them until they feel natural.",
    task: "Navigate to the <code>X</code> marker on the last line using only <code>h j k l</code>.",
    buffer: [
      "Start here → ",
      "",
      "Go down with j,",
      "then right with l,",
      "reach the X here: ......X"
    ],
    initialCursor: [0, 0],
    hints: [
      "You need to move <code>j j j j</code> to reach the last line.",
      "Then keep pressing <code>l</code> to slide right until you hit the X."
    ],
    check: (s) => s.cursor[0] === 4 && s.buffer[4][s.cursor[1]] === "X"
  },
  {
    id: "b-modes",
    title: "Modes: Normal vs Insert",
    section: "BEGINNER",
    badge: "basics",
    desc: "Neovim has modes. NORMAL is for navigating/commanding. INSERT is for typing text. You must switch between them deliberately.",
    task: "Press <code>i</code> to enter INSERT mode, type <code>hello</code>, then press <code>Esc</code> to return to NORMAL.",
    buffer: [
      "Type here: ",
      "",
      "Remember: <Esc> always returns you to NORMAL mode."
    ],
    initialCursor: [0, 11],
    hints: [
      "<code>i</code> enters INSERT mode <em>before</em> the cursor.",
      "Type the letters <code>h e l l o</code>.",
      "Press <code>Esc</code> to leave INSERT mode — the status bar should read NORMAL."
    ],
    check: (s) => s.mode === "normal" && s.buffer[0].includes("hello")
  },
  {
    id: "b-insert-variants",
    title: "Insert Variants: i I a A o O",
    section: "BEGINNER",
    badge: "edit",
    desc: "There are several ways to enter INSERT mode — each puts you in a useful spot.",
    task: "On line 2, use <code>A</code> to append at end-of-line and type <code> ← added</code>, then <code>Esc</code>.",
    buffer: [
      "i = insert before cursor",
      "A = append at end of line",
      "o = open new line below",
      "O = open new line above"
    ],
    initialCursor: [1, 0],
    hints: [
      "<code>I</code> inserts at first non-blank of line; <code>A</code> appends at end of line.",
      "<code>o</code> opens a line below; <code>O</code> opens one above.",
      "Move to line 2 first (<code>j</code>), then press <code>A</code>."
    ],
    check: (s) => s.mode === "normal" && s.buffer[1].endsWith(" ← added")
  },
  {
    id: "b-delete-char",
    title: "Delete: x dd",
    section: "BEGINNER",
    badge: "edit",
    desc: "Delete a character with <code>x</code>, a whole line with <code>dd</code>.",
    task: "Delete the line containing <code>REMOVE ME</code> using <code>dd</code>.",
    buffer: [
      "keep this line",
      "REMOVE ME — this entire line should go",
      "keep this line too"
    ],
    initialCursor: [1, 0],
    hints: [
      "Position cursor on line 2 (already there) and press <code>dd</code>.",
      "<code>dd</code> deletes the line and copies it to the unnamed register."
    ],
    check: (s) => s.buffer.length === 2 && !s.buffer.some((l) => l.includes("REMOVE"))
  },
  {
    id: "b-undo-redo",
    title: "Undo & Redo: u Ctrl-r",
    section: "BEGINNER",
    badge: "edit",
    desc: "<code>u</code> undoes the last change. <code>Ctrl-r</code> redoes it.",
    task: "Delete any line with <code>dd</code>, then undo it with <code>u</code>.",
    buffer: ["line one", "line two", "line three"],
    initialCursor: [0, 0],
    hints: [
      "Press <code>dd</code> to delete the current line.",
      "Then press <code>u</code> — the line comes back.",
      "<code>Ctrl-r</code> replays the undone change."
    ],
    check: (s) => s.buffer.length === 3 && s.flags.undoUsed
  },
  {
    id: "b-save-quit",
    title: "Save & Quit: :w :q",
    section: "BEGINNER",
    badge: "basics",
    desc: "Ex commands for the basics every Vim user must know.",
    task: "Save the buffer with <code>:w&lt;Enter&gt;</code>.",
    buffer: [
      "The command line opens with :",
      "",
      "  :w      write (save)",
      "  :q      quit",
      "  :wq     write and quit",
      "  :q!     quit without saving",
      "  :x      write and quit (only if changed)"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>:</code>, type <code>w</code>, press <code>Enter</code>.",
      "Watch the messages pane — you'll see a 'written' message."
    ],
    check: (s) => s.flags.saved
  },
  {
    id: "b-replace-char",
    title: "Replace: r and R",
    section: "BEGINNER",
    badge: "edit",
    desc: "<code>r{char}</code> replaces the character under the cursor. <code>R</code> enters REPLACE mode.",
    task: "Replace the 'x' in line 1 with 'y' using <code>r</code>.",
    buffer: [
      "Change x to y here",
      "",
      "r{char}  replace single char",
      "R        enter REPLACE mode"
    ],
    initialCursor: [0, 7],
    hints: [
      "Position cursor on the 'x' (already there).",
      "Press <code>r</code>, then <code>y</code>. Done!"
    ],
    check: (s) => s.buffer[0] === "Change y to y here"
  },
  {
    id: "b-line-end-start",
    title: "Jump to Line Start/End: 0 ^ $",
    section: "BEGINNER",
    badge: "motion",
    desc: "Jump instantly to the start or end of the current line.",
    task: "Press <code>$</code> to jump to the end of the line.",
    buffer: [
      "    indented line with text at the end",
      "",
      "0 = very first column",
      "^ = first non-blank char",
      "$ = end of line"
    ],
    initialCursor: [0, 0],
    hints: [
      "<code>$</code> takes you to the last character.",
      "Try <code>0</code> then <code>^</code> to see the difference on indented lines."
    ],
    check: (s) => s.cursor[0] === 0 && s.cursor[1] === s.buffer[0].length - 1
  },

  // ═══════════════════════════════════════════════════════════
  // ░░░ MEDIUM ░░░
  // ═══════════════════════════════════════════════════════════

  {
    id: "m-word-motions",
    title: "Word Motions: w b e",
    section: "MEDIUM",
    badge: "motion",
    desc: "Moving char-by-char is slow. Use word motions to jump.",
    task: "Place cursor on the word <code>target</code> on line 1 using <code>w</code> repeatedly.",
    buffer: [
      "jump over these words to reach the target now",
      "",
      "w = next word start",
      "b = previous word start",
      "e = end of current/next word"
    ],
    initialCursor: [0, 0],
    hints: [
      "<code>w</code> jumps to start of next word.",
      "Press <code>w</code> until the cursor lands on the 't' of 'target'.",
      "Too far? Use <code>b</code> to go back one word."
    ],
    check: (s) => {
      const idx = s.buffer[0].indexOf("target");
      return s.cursor[0] === 0 && s.cursor[1] === idx;
    }
  },
  {
    id: "m-buffer-motions",
    title: "Buffer Motions: gg G",
    section: "MEDIUM",
    badge: "motion",
    desc: "Jump to the top or bottom of a file.",
    task: "Press <code>G</code> to jump to the last line.",
    buffer: [
      "line 1 — top of the file",
      "line 2",
      "line 3",
      "line 4",
      "line 5",
      "line 6 — jump here with G"
    ],
    initialCursor: [0, 0],
    hints: [
      "<code>gg</code> goes to the first line.",
      "<code>G</code> goes to the last line.",
      "<code>42G</code> or <code>:42</code> jumps to line 42."
    ],
    check: (s) => s.cursor[0] === 5
  },
  {
    id: "m-find-char",
    title: "Find Char: f t",
    section: "MEDIUM",
    badge: "motion",
    desc: "<code>f{char}</code> jumps to the next occurrence of a character on the line. <code>t</code> stops just before it.",
    task: "From column 0, press <code>f</code> then <code>;</code> to land on the semicolon.",
    buffer: [
      "const x = 42; const y = 17;",
      "",
      "f<char>  → forward to char",
      "F<char>  → backward",
      "t<char>  → till (one before)",
      ";        → repeat last f/t"
    ],
    initialCursor: [0, 0],
    hints: [
      "Type the literal character you want to land on.",
      "If overshot, press <code>,</code> to reverse the search."
    ],
    check: (s) => s.cursor[0] === 0 && s.buffer[0][s.cursor[1]] === ";"
  },
  {
    id: "m-change-word",
    title: "Change Operators: cw C",
    section: "MEDIUM",
    badge: "edit",
    desc: "The change operator <code>c</code> deletes and enters INSERT mode in one step.",
    task: "On line 1, replace the word <code>OLD</code> with <code>NEW</code> using <code>cw</code>.",
    buffer: [
      "replace OLD here",
      "",
      "cw = change word",
      "C  = change to end of line",
      "cc = change whole line"
    ],
    initialCursor: [0, 8],
    hints: [
      "Place cursor on the 'O' of OLD (use <code>w</code> twice from start).",
      "Press <code>cw</code>, then type <code>NEW</code>, then <code>Esc</code>."
    ],
    check: (s) => s.mode === "normal" && s.buffer[0] === "replace NEW here"
  },
  {
    id: "m-yank-put",
    title: "Yank & Put: yy p P",
    section: "MEDIUM",
    badge: "edit",
    desc: "Neovim's copy/paste. <code>yy</code> yanks (copies) a line. <code>p</code> puts it after the cursor.",
    task: "Duplicate the line <code>duplicate me</code> by yanking and pasting it.",
    buffer: [
      "duplicate me",
      "",
      "yy = yank line",
      "p  = put after",
      "P  = put before"
    ],
    initialCursor: [0, 0],
    hints: [
      "Make sure you're on line 1, then press <code>yy</code>.",
      "Then press <code>p</code> to put a copy on the line below."
    ],
    check: (s) => s.buffer.filter((l) => l === "duplicate me").length >= 2
  },
  {
    id: "m-counts",
    title: "Counts: {N}{motion}",
    section: "MEDIUM",
    badge: "motion",
    desc: "Prefix motions/operators with a number to repeat them.",
    task: "Press <code>3j</code> to jump down exactly three lines.",
    buffer: [
      "line 0 — start here",
      "line 1",
      "line 2",
      "line 3 — land here",
      "line 4"
    ],
    initialCursor: [0, 0],
    hints: [
      "Type the digits <code>3</code> then <code>j</code> without pauses.",
      "Watch the keys-buffer on the statusline."
    ],
    check: (s) => s.cursor[0] === 3 && s.flags.counts3jUsed
  },
  {
    id: "m-search",
    title: "Search: / ? n N",
    section: "MEDIUM",
    badge: "search",
    desc: "<code>/</code> searches forward, <code>?</code> backward. <code>n</code> jumps to the next match.",
    task: "Search for <code>needle</code> with <code>/needle&lt;Enter&gt;</code>.",
    buffer: [
      "hay hay hay haystack hay",
      "needle somewhere in this sentence",
      "more hay and another needle here"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>/</code> — a command line opens at the bottom.",
      "Type <code>needle</code>, then press <code>Enter</code>."
    ],
    check: (s) => s.cursor[0] === 1 && s.buffer[1].substr(s.cursor[1], 6) === "needle"
  },
  {
    id: "m-substitute",
    title: "Substitute: :s/old/new/g",
    section: "MEDIUM",
    badge: "search",
    desc: "Ex command for find-and-replace. <code>%</code> means whole file, <code>g</code> means global (all matches per line).",
    task: "Replace all <code>foo</code> with <code>bar</code> using <code>:%s/foo/bar/g&lt;Enter&gt;</code>.",
    buffer: ["foo one foo two", "three foo four", "no match here", "foo foo foo"],
    initialCursor: [0, 0],
    hints: [
      "Press <code>:</code> to open the command line.",
      "Type <code>%s/foo/bar/g</code>, then <code>Enter</code>."
    ],
    check: (s) =>
      !s.buffer.some((l) => l.includes("foo")) && s.buffer.some((l) => l.includes("bar"))
  },
  {
    id: "m-visual",
    title: "Visual Mode: v V",
    section: "MEDIUM",
    badge: "visual",
    desc: "VISUAL mode lets you select characters; VISUAL-LINE (<code>V</code>) selects whole lines.",
    task: "Press <code>V</code> on line 2, then <code>j</code> to extend selection, then <code>d</code> to delete.",
    buffer: [
      "keep this line",
      "delete this line with V then j then d",
      "and delete this one too",
      "keep this last line"
    ],
    initialCursor: [1, 0],
    hints: [
      "<code>V</code> enters VISUAL LINE mode — the whole line highlights.",
      "<code>j</code> extends the selection down by one line.",
      "<code>d</code> deletes the selection."
    ],
    check: (s) =>
      s.mode === "normal" &&
      s.buffer.length === 2 &&
      s.buffer[0] === "keep this line" &&
      s.buffer[1] === "keep this last line"
  },
  {
    id: "m-dot-repeat",
    title: "Repeat Last Change: .",
    section: "MEDIUM",
    badge: "edit",
    desc: "The dot <code>.</code> repeats your last change. Powerful for bulk editing.",
    task: "Delete a character with <code>x</code>, then press <code>.</code> three times to repeat it.",
    buffer: [
      "ddddDelete these",
      "",
      ".  repeats the last change",
      "Very useful for repetitive edits"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>x</code> to delete the first 'd'.",
      "Then press <code>.</code> three more times to delete the rest."
    ],
    check: (s) => s.buffer[0] === "Delete these"
  },
  {
    id: "m-splits",
    title: "Splits: Ctrl-w",
    section: "MEDIUM",
    badge: "window",
    desc: "<code>Ctrl-w</code> is the window prefix. <code>Ctrl-w v</code> splits vertically, <code>Ctrl-w s</code> horizontally.",
    task: "Split vertically with <code>Ctrl-w v</code>.",
    buffer: [
      "Window splits (NvChad):",
      "",
      "  <Ctrl-w>v     split vertical",
      "  <Ctrl-w>s     split horizontal",
      "  <Ctrl-w>h/j/k/l   move between splits",
      "  <Ctrl-w>q     close split"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Ctrl</code>, press <code>w</code>, release, then press <code>v</code>.",
      "A second pane appears (simulated)."
    ],
    check: (s) => s.flags.splitVertical
  },

  // ═══════════════════════════════════════════════════════════
  // ░░░ ADVANCED ░░░
  // ═══════════════════════════════════════════════════════════

  {
    id: "a-text-objects",
    title: "Text Objects: iw aw i\" a\"",
    section: "ADVANCED",
    badge: "motion",
    desc: "Text objects select or operate on semantic chunks. <code>iw</code> = inner word, <code>i\"</code> = inside quotes.",
    task: "Select the word 'target' with <code>v</code> then <code>i</code> then <code>w</code>.",
    buffer: [
      "Select the word target here",
      "",
      "iw = inner word (no surrounding space)",
      "aw = a word (with space)",
      "i\" = inside quotes",
      "a\" = including quotes"
    ],
    initialCursor: [0, 15],
    hints: [
      "Press <code>v</code> to enter VISUAL mode.",
      "Then <code>i</code>, then <code>w</code>. The word gets selected."
    ],
    check: (s) => s.mode === "visual" && s.buffer[0].substr(s.cursor[1], 6) === "target"
  },
  {
    id: "a-marks",
    title: "Marks & Jumps: m ' `",
    section: "ADVANCED",
    badge: "motion",
    desc: "Mark positions in a file and jump back to them. <code>m{a-z}</code> sets a mark, <code>'{a-z}</code> jumps to it.",
    task: "Set a mark on line 2 with <code>m</code> then <code>a</code>, jump to line 5, then jump back with <code>'a</code>.",
    buffer: [
      "Line 1",
      "Line 2 - set mark here",
      "Line 3",
      "Line 4",
      "Line 5 - jump here after setting mark"
    ],
    initialCursor: [1, 0],
    hints: [
      "Press <code>m</code>, then <code>a</code> (sets mark 'a' on line 2).",
      "Move to line 5 with <code>4j</code>.",
      "Press <code>'a</code> to jump back to mark 'a'."
    ],
    check: (s) => s.cursor[0] === 1
  },
  {
    id: "a-macros",
    title: "Macros: q / @",
    section: "ADVANCED",
    badge: "edit",
    desc: "Record and replay a sequence of commands. <code>q{a-z}</code> to record, <code>@{a-z}</code> to replay.",
    task: "Record a macro that adds '→ ' to the start of a line, then replay it.",
    buffer: [
      "Line one",
      "Line two",
      "Line three",
      "",
      "q{char}  record macro",
      "@{char}  replay macro"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>q</code>, then <code>a</code> to start recording.",
      "Press <code>I</code>, type <code>→ </code>, press <code>Esc</code>, then <code>j</code>.",
      "Press <code>q</code> to stop recording. Replay with <code>@a</code>."
    ],
    check: (s) => s.buffer[0].startsWith("→")
  },
  {
    id: "a-registers",
    title: "Registers: \" and Named Registers",
    section: "ADVANCED",
    badge: "edit",
    desc: "Neovim has multiple registers to copy/paste. <code>\"a</code> selects register 'a'.",
    task: "Yank line 1 into register 'a' with <code>\"ayy</code>, then paste it with <code>\"ap</code>.",
    buffer: [
      "Copy this line",
      "",
      "Named registers: \"a through \"z",
      "Paste from register with \"xp"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>\"</code>, then <code>a</code>, then <code>y</code>, then <code>y</code>.",
      "Move down with <code>j</code>, then press <code>\"ap</code>."
    ],
    check: (s) => s.buffer.filter((l) => l === "Copy this line").length >= 2
  },
  {
    id: "a-global-command",
    title: "Global Command: :g/pattern/cmd",
    section: "ADVANCED",
    badge: "search",
    desc: "<code>:g</code> executes a command on all lines matching a pattern.",
    task: "Delete all lines containing 'foo' using <code>:g/foo/d&lt;Enter&gt;</code>.",
    buffer: [
      "keep this",
      "foo remove this",
      "keep this too",
      "foo remove this as well",
      "final line"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>:</code>, type <code>g/foo/d</code>, press <code>Enter</code>.",
      "All lines with 'foo' get deleted."
    ],
    check: (s) => !s.buffer.some((l) => l.includes("foo"))
  },
  {
    id: "a-chad-leader",
    title: "NvChad: The Leader Key",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad uses Space as the Leader key. Most custom keymaps start with Space. Press <code>Space</code> to open the which-key helper.",
    task: "Press <code>Space</code> then <code>t</code> <code>h</code> to cycle NvChad themes.",
    buffer: [
      "NvChad leader = <Space>",
      "",
      "Try some leader mappings:",
      "  <leader>th  — themes",
      "  <leader>ff  — find files (Telescope)",
      "  <leader>fw  — live grep",
      "  <leader>n   — toggle line numbers",
      "  <leader>h   — new terminal (horizontal)",
      "  <leader>ch  — cheatsheet"
    ],
    initialCursor: [0, 0],
    hints: [
      "Tap <code>Space</code> — you'll see a which-key popup appear in the messages tab.",
      "Then <code>t</code>, then <code>h</code>. The theme name cycles."
    ],
    check: (s) => s.flags.chadThemeCycled
  },
  {
    id: "a-chad-telescope",
    title: "NvChad: Telescope (ff / fw)",
    section: "ADVANCED",
    badge: "chad",
    desc: "Telescope is NvChad's fuzzy finder. <code>&lt;leader&gt;ff</code> finds files, <code>&lt;leader&gt;fw</code> greps live across the project.",
    task: "Press <code>Space</code> then <code>f</code> then <code>f</code> to open the file finder (simulated).",
    buffer: [
      "Telescope mappings (NvChad defaults):",
      "",
      "  <leader>ff   find files",
      "  <leader>fa   find all (incl. hidden)",
      "  <leader>fw   live grep",
      "  <leader>fb   list buffers",
      "  <leader>fh   help tags",
      "  <leader>fo   oldfiles",
      "  <leader>fz   current buffer fuzzy find"
    ],
    initialCursor: [0, 0],
    hints: [
      "Leader = <code>Space</code>. Press it first.",
      "Then <code>ff</code>. A simulated Telescope float will appear in :messages."
    ],
    check: (s) => s.flags.telescopeOpened
  },
  {
    id: "a-chad-nvimtree",
    title: "NvChad: NvimTree File Explorer",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvimTree is the sidebar file explorer. Toggle with <code>&lt;leader&gt;e</code> or <code>Ctrl-n</code>.",
    task: "Press <code>Ctrl-n</code> to toggle NvimTree.",
    buffer: [
      "NvimTree keys (default NvChad):",
      "",
      "  <Ctrl-n>    toggle tree",
      "  <leader>e   focus tree",
      "  a           create file/dir",
      "  d           delete",
      "  r           rename",
      "  x / c / p   cut / copy / paste"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Ctrl</code> and press <code>n</code>.",
      "In a real NvChad, a tree opens on the left."
    ],
    check: (s) => s.flags.nvimTreeToggled
  },
  {
    id: "a-chad-buffers",
    title: "NvChad: Buffer Navigation",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad's tabufline shows open buffers. Cycle with <code>Tab</code> / <code>Shift-Tab</code>, close with <code>&lt;leader&gt;x</code>.",
    task: "Press <code>Tab</code> to switch to the next buffer.",
    buffer: [
      "Buffer commands:",
      "",
      "  <Tab>           next buffer",
      "  <Shift-Tab>     previous buffer",
      "  <leader>x       close buffer",
      "  <leader>b       new empty buffer"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>Tab</code> in NORMAL mode — the active tab indicator moves.",
      "(In real Neovim this maps to <code>:bnext</code>.)"
    ],
    check: (s) => s.flags.bufferSwitched
  },
  {
    id: "a-chad-terminal",
    title: "NvChad: Built-in Terminal",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad has nvterm. Horizontal term <code>&lt;leader&gt;h</code>, vertical <code>&lt;leader&gt;v</code>, floating <code>&lt;leader&gt;i</code>.",
    task: "Press <code>Space</code> then <code>i</code> to open a floating terminal.",
    buffer: [
      "NvChad terminal mappings:",
      "",
      "  <leader>h   horizontal terminal",
      "  <leader>v   vertical terminal",
      "  <leader>i   floating terminal",
      "  <Ctrl-x>    exit terminal mode"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>i</code>.",
      "A floating terminal is simulated in the :messages pane."
    ],
    check: (s) => s.flags.terminalOpened
  },
  {
    id: "a-chad-comment",
    title: "NvChad: Comment.nvim",
    section: "ADVANCED",
    badge: "chad",
    desc: "<code>gcc</code> toggles a single-line comment. <code>gc</code> in VISUAL mode comments the selection.",
    task: "Toggle a comment on line 2 with <code>gcc</code>.",
    buffer: ["function greet() {", "  console.log('hi');", "}"],
    initialCursor: [1, 0],
    hints: [
      "Move to line 2 (already there), press <code>gcc</code>.",
      "Comment.nvim auto-detects the filetype commentstring (<code>//</code> here)."
    ],
    check: (s) => s.buffer[1].trimStart().startsWith("//") && s.buffer[1].includes("console.log")
  },
  {
    id: "a-chad-lsp",
    title: "NvChad: LSP Mappings",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad wires LSP keymaps for common actions.",
    task: "Press <code>K</code> on an identifier to show hover docs (simulated).",
    buffer: [
      "LSP keymaps (NvChad defaults):",
      "",
      "  K              hover docs",
      "  gd             go to definition",
      "  gD             go to declaration",
      "  gi             go to implementation",
      "  gr             find references",
      "  <leader>ra     rename",
      "  <leader>ca     code action",
      "  <leader>f      format (via conform.nvim)"
    ],
    initialCursor: [0, 0],
    hints: [
      "Uppercase K — hold Shift while pressing K.",
      "A hover popup is simulated in :messages."
    ],
    check: (s) => s.flags.lspHover
  },
  {
    id: "a-indentation",
    title: "Indentation: > < >>",
    section: "ADVANCED",
    badge: "edit",
    desc: "<code>&gt;</code> indents, <code>&lt;</code> outdents. <code>&gt;&gt;</code> indents the whole line.",
    task: "Indent line 2 using <code>&gt;&gt;</code>.",
    buffer: [
      "if condition {",
      "return value;",
      "}"
    ],
    initialCursor: [1, 0],
    hints: [
      "Position cursor on line 2.",
      "Press <code>&gt;</code> twice (or once with count <code>1&gt;&gt;</code>)."
    ],
    check: (s) => s.buffer[1].startsWith("  ")
  },
  {
    id: "a-paragraph-motions",
    title: "Paragraph Motions: { }",
    section: "ADVANCED",
    badge: "motion",
    desc: "<code>{</code> moves to the previous paragraph (blank line), <code>}</code> moves to the next.",
    task: "Move from line 1 to the next paragraph using <code>}</code>.",
    buffer: [
      "First paragraph",
      "still here",
      "",
      "Second paragraph",
      "still here too"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>}</code> to jump to the next paragraph break.",
      "A paragraph is a chunk of lines separated by blank lines."
    ],
    check: (s) => s.cursor[0] >= 3
  },
  {
    id: "a-fold-basics",
    title: "Folds: zf zo zc",
    section: "ADVANCED",
    badge: "edit",
    desc: "Create folds to hide/show code sections. <code>zf</code> creates, <code>zo</code> opens, <code>zc</code> closes.",
    task: "Learn fold commands for code navigation (simulated).",
    buffer: [
      "function example() {",
      "  let x = 1;",
      "  return x;",
      "}",
      "",
      "zf = create fold",
      "zo = open fold",
      "zc = close fold"
    ],
    initialCursor: [0, 0],
    hints: [
      "In real Neovim, <code>zf</code> with a motion creates a fold.",
      "Folds are useful for navigating large files."
    ],
    check: (s) => s.buffer.length === 8
  },
  {
    id: "a-completion",
    title: "Completion: Ctrl-n Ctrl-p",
    section: "ADVANCED",
    badge: "edit",
    desc: "In INSERT mode, <code>Ctrl-n</code> triggers completion suggestions. <code>Ctrl-p</code> goes backward.",
    task: "Learn about completion in INSERT mode (simulated).",
    buffer: [
      "function greet",
      "function helper",
      "function main",
      "",
      "Ctrl-n = next completion",
      "Ctrl-p = previous completion"
    ],
    initialCursor: [0, 0],
    hints: [
      "In real Neovim with LSP, Ctrl-n gives smart suggestions.",
      "This simulator doesn't have live completion, but you can practice with real NvChad."
    ],
    check: (s) => s.buffer.length === 6
  },

  // ═══════════════════════════════════════════════════════════
  // GRADUATION
  // ═══════════════════════════════════════════════════════════

  {
    id: "graduation",
    title: "🎓 Graduation",
    section: "GRADUATION",
    badge: "chad",
    desc: "You've learned Neovim foundations and NvChad mastery! From hjkl to macros, from INSERT to visual mode, and NvChad's most powerful features. Keep practicing and reading <code>:help</code> — there's always more to discover.",
    task: "Press <code>Space</code> then <code>c</code> <code>h</code> to open the NvChad cheatsheet one final time and celebrate!",
    buffer: [
      "       ___                     ",
      "      /__/\\       ___       ",
      "      \\  \\:\\     /  /\\   ",
      "       \\  \\:\\   /  /:/       ",
      "   _____\\__\\:\\ /__/::\\     ",
      "  /__/::::::::\\\\__\\/\\:\\__  ",
      "  \\  \\:\\~~\\~~\\/   \\  \\:\\/\\ ",
      "   \\  \\:\\  ~~~     \\__\\::/ ",
      "    \\  \\:\\          /__/:/   ",
      "     \\  \\:\\         \\__\\/  ",
      "      \\__\\/                ",
      "",
      "     Welcome, Chad.         "
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>c</code>, then <code>h</code>.",
      "Congrats on finishing the course! Now dive into the real NvChad."
    ],
    check: (s) => s.flags.cheatsheetOpened
  }
];

export const CHEATSHEET = [
  {
    group: "Motions",
    items: [
      ["h j k l", "left down up right"],
      ["w / b / e", "word forward / back / end"],
      ["0 / ^ / $", "line start / first non-blank / end"],
      ["gg / G", "first / last line"],
      ["f{c} / t{c}", "find / till char on line"],
      ["%", "matching bracket"],
      ["Ctrl-d / Ctrl-u", "half page down / up"],
      ["{ }", "paragraph prev / next"]
    ]
  },
  {
    group: "Editing",
    items: [
      ["i / I / a / A", "insert variants"],
      ["o / O", "open line below / above"],
      ["x / X", "delete char under / before"],
      ["dd / D", "delete line / to EOL"],
      ["cw / C / cc", "change word / EOL / line"],
      ["yy / p / P", "yank / put after / before"],
      ["u / Ctrl-r", "undo / redo"],
      [". (dot)", "repeat last change"],
      ["r{c} / R", "replace char / Replace mode"],
      [">> / <<", "indent / outdent"]
    ]
  },
  {
    group: "Search & Replace",
    items: [
      ["/pat  ?pat", "search forward / backward"],
      ["n / N", "next / prev match"],
      ["*", "search word under cursor"],
      [":%s/old/new/g", "replace all in file"],
      [":g/pat/cmd", "global command on matches"],
      [":noh", "clear highlight"]
    ]
  },
  {
    group: "Visual & Text Objects",
    items: [
      ["v", "char visual"],
      ["V", "line visual"],
      ["Ctrl-v", "block visual"],
      ["gv", "re-select last"],
      ["iw / aw", "inner / a word"],
      ["i\" / a\"", "inside / a quotes"]
    ]
  },
  {
    group: "Advanced",
    items: [
      ["m{a-z}", "set mark"],
      ["'{a-z}", "jump to mark"],
      ["q{a-z}", "record macro"],
      ["@{a-z}", "replay macro"],
      ["\"{a-z}", "select register"],
      ["zf / zo / zc", "create / open / close fold"]
    ]
  },
  {
    group: "NvChad Leader (Space)",
    items: [
      ["<leader>th", "cycle themes"],
      ["<leader>ff", "find files"],
      ["<leader>fw", "live grep"],
      ["<leader>fb", "list buffers"],
      ["<leader>e", "focus NvimTree"],
      ["<leader>h / v / i", "term horiz / vert / float"],
      ["<leader>ra", "rename symbol"],
      ["<leader>ca", "code action"],
      ["<leader>f", "format file"],
      ["<leader>ch", "open cheatsheet"],
      ["<leader>x", "close buffer"],
      ["<leader>n", "toggle line numbers"]
    ]
  },
  {
    group: "Windows & Buffers",
    items: [
      ["Ctrl-w v / s", "vsplit / split"],
      ["Ctrl-w h/j/k/l", "move between splits"],
      ["Tab / Shift-Tab", "next / prev buffer"],
      ["Ctrl-n", "toggle NvimTree"]
    ]
  },
  {
    group: "Files",
    items: [
      [":w / :q / :wq", "save / quit / save+quit"],
      [":q!", "force quit"],
      [":e path", "edit file"]
    ]
  }
];

export const THEMES = [
  { name: "onedark", bg: "#1e222a", acc: "#61afef" },
  { name: "chadracula", bg: "#282a36", acc: "#bd93f9" },
  { name: "gruvchad", bg: "#282828", acc: "#d79921" },
  { name: "tokyonight", bg: "#1a1b26", acc: "#7aa2f7" },
  { name: "catppuccin", bg: "#1e1e2e", acc: "#cba6f7" }
];
