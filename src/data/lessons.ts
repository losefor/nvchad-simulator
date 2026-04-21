import type { Lesson, Theme, CheatsheetGroup } from "../types";

export const LESSONS: Lesson[] = [
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
    id: "b-insert-nav-begin-end",
    title: "INSERT Mode: Ctrl+b / Ctrl+e",
    section: "BEGINNER",
    badge: "edit",
    desc: "In INSERT mode, <code>Ctrl+b</code> jumps to the beginning of the line, <code>Ctrl+e</code> jumps to the end.",
    task: "Enter INSERT mode with <code>i</code>, then press <code>Ctrl+e</code> to jump to the line end.",
    buffer: [
      "type something here and jump to end",
      "",
      "<C-b> = jump to line start (INSERT)",
      "<C-e> = jump to line end (INSERT)"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>i</code> first to enter INSERT mode.",
      "Then hold <code>Ctrl</code> and press <code>e</code>.",
      "You should now be at the end of the line while still in INSERT mode."
    ],
    check: (s) => s.mode === "insert" || (s.mode === "normal" && s.cursor[1] > 20)
  },
  {
    id: "b-insert-nav-arrows",
    title: "INSERT Mode: Ctrl+h / Ctrl+l / Ctrl+j / Ctrl+k",
    section: "BEGINNER",
    badge: "edit",
    desc: "In INSERT mode, use Ctrl combos to navigate: <code>Ctrl+h</code> left, <code>Ctrl+l</code> right, <code>Ctrl+j</code> down, <code>Ctrl+k</code> up.",
    task: "Enter INSERT mode and navigate using Ctrl+h/l/j/k instead of arrow keys.",
    buffer: [
      "Move cursor left, right, up, down",
      "while staying in INSERT mode",
      "using Ctrl+h/l/j/k"
    ],
    initialCursor: [1, 5],
    hints: [
      "Press <code>i</code> to enter INSERT mode.",
      "<code>Ctrl+h</code> = move left, <code>Ctrl+l</code> = move right.",
      "<code>Ctrl+j</code> = move down, <code>Ctrl+k</code> = move up."
    ],
    check: (s) => s.mode === "insert" || s.cursor[1] !== 5 || s.cursor[0] !== 1
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
    id: "b-ctrl-s-save",
    title: "NvChad: Quick Save with Ctrl+s",
    section: "BEGINNER",
    badge: "chad",
    desc: "NvChad maps <code>Ctrl+s</code> to save the file instantly (faster than <code>:w</code>).",
    task: "Save the file using <code>Ctrl+s</code> (the NvChad default).",
    buffer: [
      "Make some changes here",
      "Then save with Ctrl+s",
      "Much faster than :w!"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Ctrl</code> and press <code>s</code>.",
      "In NvChad, this is mapped to <code>:w</code> for quick saving."
    ],
    check: (s) => s.flags.saved || s.modified === false
  },
  {
    id: "b-ctrl-c-copy-file",
    title: "NvChad: Copy Entire File with Ctrl+c",
    section: "BEGINNER",
    badge: "chad",
    desc: "NvChad maps <code>Ctrl+c</code> to copy the entire file to clipboard (:%y+).",
    task: "Learn about the Ctrl+c file copy shortcut.",
    buffer: [
      "This entire buffer",
      "can be copied to clipboard",
      "with a single Ctrl+c keystroke!",
      "",
      "<C-c> = copy whole file"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Ctrl</code> and press <code>c</code> — the whole file is copied.",
      "Equivalent to <code>:%y+</code> in Vim."
    ],
    check: (s) => s.buffer.length >= 4
  },
  {
    id: "b-esc-clear-highlights",
    title: "NvChad: Esc Clears Search Highlights",
    section: "BEGINNER",
    badge: "chad",
    desc: "NvChad maps <code>Esc</code> to clear search highlights (<code>:noh</code>). No more distracting highlights after searching!",
    task: "Search for 'line', then press <code>Esc</code> to clear the highlights.",
    buffer: [
      "line one here",
      "line two here",
      "line three here",
      "Press / to search, then Esc to clear highlights"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>/</code>, type <code>line</code>, press <code>Enter</code>.",
      "Then press <code>Esc</code> — the highlights vanish."
    ],
    check: (s) => s.buffer.length === 4
  },
  {
    id: "b-line-numbers",
    title: "NvChad: Toggle Line Numbers with <leader>n",
    section: "BEGINNER",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;n</code> to toggle line numbers on/off.",
    task: "Press <code>Space</code> then <code>n</code> to toggle line numbers (simulated).",
    buffer: [
      "Line numbers help you",
      "navigate and reference",
      "specific lines in the editor",
      "",
      "<leader>n = toggle line numbers"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>Space</code> (the leader key in NvChad).",
      "Then press <code>n</code> to toggle line numbers."
    ],
    check: (s) => s.buffer.length === 5
  },
  {
    id: "b-relative-numbers",
    title: "NvChad: Toggle Relative Numbers with <leader>rn",
    section: "BEGINNER",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;rn</code> to toggle relative line numbers (shows distance from cursor).",
    task: "Learn about relative numbers with <code>&lt;leader&gt;rn</code>.",
    buffer: [
      "Relative numbers show",
      "the distance from current line",
      "useful for Vim motions like 5j",
      "",
      "<leader>rn = toggle relative numbers"
    ],
    initialCursor: [1, 0],
    hints: [
      "Space, then <code>r</code>, then <code>n</code>.",
      "Relative numbers are great for counting motions."
    ],
    check: (s) => s.buffer.length === 5
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
    id: "m-nvimtree",
    title: "NvChad: NvimTree Toggle with Ctrl+n",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>Ctrl+n</code> to toggle NvimTree file explorer. <code>&lt;leader&gt;e</code> focuses it.",
    task: "Press <code>Ctrl+n</code> to toggle the file explorer (simulated).",
    buffer: [
      "NvimTree file explorer",
      "",
      "<C-n>    toggle NvimTree",
      "<leader>e   focus NvimTree",
      "a/d/r/x/c/p = add/delete/rename/cut/copy/paste"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Ctrl</code> and press <code>n</code>.",
      "A file tree opens on the left side (simulated)."
    ],
    check: (s) => s.flags.nvimTreeToggled
  },
  {
    id: "m-nvimtree-focus",
    title: "NvChad: NvimTree Focus with <leader>e",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;e</code> to focus the NvimTree (if already open).",
    task: "Press <code>Space</code> then <code>e</code> to focus NvimTree.",
    buffer: [
      "NvimTree focus command",
      "",
      "<leader>e focuses NvimTree",
      "Useful when switching between",
      "the tree and your editor"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>e</code>.",
      "Brings focus to the NvimTree sidebar."
    ],
    check: (s) => s.flags.nvimTreeToggled
  },
  {
    id: "m-comment",
    title: "NvChad: Comment Toggle with <leader>/",
    section: "MEDIUM",
    badge: "chad",
    desc: "<code>&lt;leader&gt;/</code> toggles a line comment. <code>&lt;leader&gt;/</code> in VISUAL mode comments selection.",
    task: "Toggle a comment on line 2 using <code>&lt;leader&gt;/</code>.",
    buffer: [
      "function greet() {",
      "  console.log('hi');",
      "}"
    ],
    initialCursor: [1, 2],
    hints: [
      "Space, then <code>/</code> to toggle comment.",
      "In VISUAL mode, it comments the selection."
    ],
    check: (s) => s.buffer[1].trimStart().startsWith("//")
  },
  {
    id: "m-new-buffer",
    title: "NvChad: New Buffer with <leader>b",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;b</code> to create a new empty buffer.",
    task: "Learn about creating new buffers with <code>&lt;leader&gt;b</code>.",
    buffer: [
      "Current buffer",
      "",
      "<leader>b = new empty buffer",
      "Useful for quick scratch work"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>b</code> creates a new buffer.",
      "NvChad's tabufline shows all open buffers."
    ],
    check: (s) => s.buffer.length >= 2
  },
  {
    id: "m-buffer-nav",
    title: "NvChad: Buffer Navigation with Tab / Shift+Tab",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>Tab</code> to go to next buffer, <code>Shift+Tab</code> for previous.",
    task: "Press <code>Tab</code> to switch to the next buffer (simulated).",
    buffer: [
      "Buffer Navigation",
      "",
      "<Tab>        go to next buffer",
      "<Shift-Tab>  go to previous buffer",
      "<leader>x    close buffer"
    ],
    initialCursor: [0, 0],
    hints: [
      "Press <code>Tab</code> in NORMAL mode.",
      "The active buffer in tabufline will change (simulated)."
    ],
    check: (s) => s.flags.bufferSwitched
  },
  {
    id: "m-buffer-close",
    title: "NvChad: Close Buffer with <leader>x",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;x</code> to close the current buffer.",
    task: "Learn about closing buffers with <code>&lt;leader&gt;x</code>.",
    buffer: [
      "Buffer Management",
      "",
      "<leader>x closes the current buffer",
      "Without closing Neovim entirely"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>x</code> closes the buffer.",
      "You can have multiple buffers open at once."
    ],
    check: (s) => s.buffer.length >= 2
  },
  {
    id: "m-telescope-find",
    title: "NvChad: Telescope Find Files with <leader>ff",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;ff</code> to Telescope's file finder.",
    task: "Press <code>Space</code> then <code>f</code> then <code>f</code> to open file finder.",
    buffer: [
      "Telescope File Finder",
      "",
      "<leader>ff   find files",
      "<leader>fa   find all (with hidden)",
      "Fuzzy search across your project"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>f</code>, then <code>f</code>.",
      "Simulated Telescope finder appears in messages."
    ],
    check: (s) => s.flags.telescopeOpened
  },
  {
    id: "m-telescope-buffers",
    title: "NvChad: Telescope List Buffers with <leader>fb",
    section: "MEDIUM",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fb</code> to list all open buffers with Telescope.",
    task: "Press <code>Space</code> then <code>f</code> then <code>b</code>.",
    buffer: [
      "Telescope Buffers",
      "",
      "<leader>fb = list all open buffers",
      "Quick switching between multiple files"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>b</code> — find buffers.",
      "Useful when you have many files open."
    ],
    check: (s) => s.buffer.length >= 2
  },
  {
    id: "m-splits",
    title: "Window Splits: Ctrl-w v/s",
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
  {
    id: "a-window-switch",
    title: "NvChad: Window Navigation with Ctrl+hjkl",
    section: "ADVANCED",
    badge: "window",
    desc: "NvChad maps <code>Ctrl+h/j/k/l</code> to switch between split windows (instead of <code>Ctrl-w hjkl</code>).",
    task: "Learn about window switching with Ctrl+h/j/k/l.",
    buffer: [
      "Window Switching in NvChad",
      "",
      "<C-h> = switch left window",
      "<C-j> = switch down window",
      "<C-k> = switch up window",
      "<C-l> = switch right window"
    ],
    initialCursor: [0, 0],
    hints: [
      "Ctrl+h to go left, Ctrl+l to go right.",
      "Ctrl+j to go down, Ctrl+k to go up.",
      "Faster than Ctrl-w h/j/k/l!"
    ],
    check: (s) => s.buffer.length >= 4
  },
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
    check: (s) => s.mode === "visual" || s.buffer[0].substr(s.cursor[1], 6) === "target"
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
    id: "a-format-file",
    title: "NvChad: Format File with <leader>fm",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fm</code> to format the entire file using conform.nvim.",
    task: "Learn about file formatting with <code>&lt;leader&gt;fm</code>.",
    buffer: [
      "Code Formatting",
      "",
      "<leader>fm = format entire file",
      "Uses conform.nvim with LSP fallback",
      "Automatically fixes indentation & style"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>m</code> formats the file.",
      "Great for quick code cleanup!"
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-diagnostics",
    title: "NvChad: Diagnostics with <leader>ds",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;ds</code> to open the diagnostic location list.",
    task: "Learn about viewing diagnostics/errors with <code>&lt;leader&gt;ds</code>.",
    buffer: [
      "LSP Diagnostics",
      "",
      "<leader>ds = set loclist from diagnostics",
      "Shows all errors/warnings in a list",
      "Jump to errors quickly"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>d</code>, <code>s</code> opens the diagnostic list.",
      "Essential for LSP error tracking."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-grep",
    title: "NvChad: Telescope Live Grep with <leader>fw",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fw</code> to live grep across the project.",
    task: "Press <code>Space</code> then <code>f</code> then <code>w</code> for live grep.",
    buffer: [
      "Telescope Live Grep",
      "",
      "<leader>fw = live grep across project",
      "Search for text in all files",
      "Real-time filtering as you type"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>w</code> for live grep.",
      "Type to search; results update instantly."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-help",
    title: "NvChad: Telescope Help Tags with <leader>fh",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fh</code> to search Neovim help tags.",
    task: "Learn about help search with <code>&lt;leader&gt;fh</code>.",
    buffer: [
      "Telescope Help Tags",
      "",
      "<leader>fh = search help documentation",
      "Quickly find answers in :help",
      "Fuzzy search through all help pages"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>h</code> opens help search.",
      "Great for learning Neovim built-ins!"
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-marks",
    title: "NvChad: Telescope Marks with <leader>ma",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;ma</code> to list all marks in Telescope.",
    task: "Learn about finding marks with <code>&lt;leader&gt;ma</code>.",
    buffer: [
      "Telescope Marks",
      "",
      "<leader>ma = find all marks",
      "See all marks you've set",
      "Jump to any mark quickly"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>m</code>, <code>a</code> lists all marks.",
      "Useful when you have many marked positions."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-oldfiles",
    title: "NvChad: Telescope Old Files with <leader>fo",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fo</code> to list recently opened files.",
    task: "Learn about recent files with <code>&lt;leader&gt;fo</code>.",
    buffer: [
      "Telescope Old Files",
      "",
      "<leader>fo = find recently opened files",
      "Quick access to files you just worked on",
      "Great for workflow continuity"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>o</code> shows recent files.",
      "Saves time jumping back to previous work."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-buffer-find",
    title: "NvChad: Telescope Buffer Fuzzy Find with <leader>fz",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fz</code> to fuzzy search within the current buffer.",
    task: "Learn about in-buffer search with <code>&lt;leader&gt;fz</code>.",
    buffer: [
      "Telescope Current Buffer",
      "",
      "<leader>fz = fuzzy search current buffer",
      "Find any word/line in the file",
      "Faster than :/ for large files"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>z</code> searches current buffer.",
      "Excellent for navigating long files."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-git-commits",
    title: "NvChad: Telescope Git Commits with <leader>cm",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;cm</code> to browse git commits in Telescope.",
    task: "Learn about viewing commits with <code>&lt;leader&gt;cm</code>.",
    buffer: [
      "Telescope Git Commits",
      "",
      "<leader>cm = browse git commits",
      "See commit history",
      "Preview changes for each commit"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>c</code>, <code>m</code> shows commits.",
      "Requires git; shows your project history."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-git-status",
    title: "NvChad: Telescope Git Status with <leader>gt",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;gt</code> to view git status in Telescope.",
    task: "Learn about git status with <code>&lt;leader&gt;gt</code>.",
    buffer: [
      "Telescope Git Status",
      "",
      "<leader>gt = view git status",
      "See modified files",
      "Quick access to changed files"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>g</code>, <code>t</code> shows git status.",
      "See what's changed in your project."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-terminals",
    title: "NvChad: Telescope Hidden Terminals with <leader>pt",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;pt</code> to pick hidden terminals in Telescope.",
    task: "Learn about hidden terminals with <code>&lt;leader&gt;pt</code>.",
    buffer: [
      "Telescope Hidden Terminals",
      "",
      "<leader>pt = pick hidden terminal",
      "See all open terminal buffers",
      "Switch between multiple shells"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>p</code>, <code>t</code> picks terminals.",
      "Useful when running multiple shells."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-telescope-themes",
    title: "NvChad: Telescope Themes with <leader>th",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;th</code> to theme selector in Telescope.",
    task: "Press <code>Space</code> then <code>t</code> then <code>h</code> to cycle themes.",
    buffer: [
      "Telescope Themes",
      "",
      "<leader>th = theme selector",
      "Browse and switch themes",
      "Live preview of each theme"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>t</code>, <code>h</code> opens theme selector.",
      "Easily customize your NvChad look!"
    ],
    check: (s) => s.flags.chadThemeCycled
  },
  {
    id: "a-telescope-find-all",
    title: "NvChad: Telescope Find All with <leader>fa",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;fa</code> to find all files including hidden ones.",
    task: "Learn about finding all files with <code>&lt;leader&gt;fa</code>.",
    buffer: [
      "Telescope Find All Files",
      "",
      "<leader>fa = find all files (with hidden)",
      "Includes dotfiles and ignored files",
      "More comprehensive than <leader>ff"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>f</code>, <code>a</code> finds all files.",
      "Useful when searching for config files."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-terminal-escape",
    title: "NvChad: Terminal Escape Mode with Ctrl+x",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>Ctrl+x</code> to exit TERMINAL mode and return to NORMAL mode.",
    task: "Learn about exiting terminal mode with <code>Ctrl+x</code>.",
    buffer: [
      "Terminal Mode",
      "",
      "<C-x> in terminal = escape terminal mode",
      "Get back to NORMAL mode",
      "Without closing the terminal"
    ],
    initialCursor: [0, 0],
    hints: [
      "In a terminal, hold Ctrl and press X.",
      "Switches you back to NORMAL mode."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-terminal-horizontal",
    title: "NvChad: New Horizontal Terminal with <leader>h",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;h</code> to open a new horizontal terminal split.",
    task: "Press <code>Space</code> then <code>h</code> to open horizontal terminal.",
    buffer: [
      "Horizontal Terminal",
      "",
      "<leader>h = new horizontal terminal",
      "Shell opens in a horizontal split",
      "Run commands without leaving Neovim"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>h</code> opens a new terminal.",
      "Great for build commands, git, etc."
    ],
    check: (s) => s.flags.terminalOpened
  },
  {
    id: "a-terminal-vertical",
    title: "NvChad: New Vertical Terminal with <leader>v",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;v</code> to open a new vertical terminal split.",
    task: "Press <code>Space</code> then <code>v</code> to open vertical terminal.",
    buffer: [
      "Vertical Terminal",
      "",
      "<leader>v = new vertical terminal",
      "Shell opens in a vertical split",
      "Side-by-side with your editor"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>v</code> opens a new terminal.",
      "Useful for viewing output while editing."
    ],
    check: (s) => s.flags.terminalOpened
  },
  {
    id: "a-terminal-toggle-vertical",
    title: "NvChad: Toggle Vertical Terminal with Alt+v",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>Alt+v</code> (in NORMAL or TERMINAL mode) to toggle a persistent vertical terminal.",
    task: "Learn about toggling terminals with <code>Alt+v</code>.",
    buffer: [
      "Toggle Vertical Terminal",
      "",
      "<A-v> = toggle vertical terminal",
      "Persistent terminal that stays open",
      "Press again to hide/show it"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Alt</code> and press <code>v</code>.",
      "Great for keeping a shell always available."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-terminal-toggle-horizontal",
    title: "NvChad: Toggle Horizontal Terminal with Alt+h",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>Alt+h</code> to toggle a persistent horizontal terminal.",
    task: "Learn about toggling terminals with <code>Alt+h</code>.",
    buffer: [
      "Toggle Horizontal Terminal",
      "",
      "<A-h> = toggle horizontal terminal",
      "Persistent terminal that stays open",
      "Quick shell access at any time"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Alt</code> and press <code>h</code>.",
      "Perfect for quick terminal tasks."
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-terminal-toggle-float",
    title: "NvChad: Toggle Floating Terminal with Alt+i",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>Alt+i</code> to toggle a floating terminal window.",
    task: "Press <code>Space</code> then <code>i</code> to open floating terminal.",
    buffer: [
      "Floating Terminal",
      "",
      "<A-i> = toggle floating terminal",
      "Terminal appears as a floating window",
      "Great for quick commands without clutter"
    ],
    initialCursor: [0, 0],
    hints: [
      "Hold <code>Alt</code> and press <code>i</code>.",
      "Floating terminals keep your layout clean!"
    ],
    check: (s) => s.flags.terminalOpened
  },
  {
    id: "a-whichkey-all",
    title: "NvChad: WhichKey All Keymaps with <leader>wK",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;wK</code> to show all keymaps in WhichKey.",
    task: "Learn about viewing all mappings with <code>&lt;leader&gt;wK</code>.",
    buffer: [
      "WhichKey All Mappings",
      "",
      "<leader>wK = show all keymaps",
      "See every binding at once",
      "Helps you discover commands"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>w</code>, <code>K</code> (capital K).",
      "Great for learning what's available!"
    ],
    check: (s) => s.buffer.length >= 3
  },
  {
    id: "a-whichkey-query",
    title: "NvChad: WhichKey Query with <leader>wk",
    section: "ADVANCED",
    badge: "chad",
    desc: "NvChad maps <code>&lt;leader&gt;wk</code> to query WhichKey for a specific key.",
    task: "Learn about querying specific mappings with <code>&lt;leader&gt;wk</code>.",
    buffer: [
      "WhichKey Query",
      "",
      "<leader>wk = query WhichKey",
      "Search for a specific key's mappings",
      "Type the key to see what it does"
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, <code>w</code>, <code>k</code> (lowercase k).",
      "Then type a key like <code>f</code> to see all f-mappings."
    ],
    check: (s) => s.buffer.length >= 3
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
    id: "graduation",
    title: "🎓 Graduation: Master of NvChad",
    section: "GRADUATION",
    badge: "chad",
    desc: "You've mastered Neovim fundamentals and every NvChad default mapping! From hjkl motions to floating terminals, from Telescope search to git integration, you're now equipped to use NvChad productively. Keep exploring, customize your config, and join the Vim revolution!",
    task: "Press <code>Space</code> then <code>c</code> <code>h</code> to open the NvChad cheatsheet one final time and celebrate your mastery!",
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
      "     Master NvChad        "
    ],
    initialCursor: [0, 0],
    hints: [
      "Space, then <code>c</code>, then <code>h</code>.",
      "Congrats on completing the full course! Now explore plugins & customize!"
    ],
    check: (s) => s.flags.cheatsheetOpened
  }
];

export const CHEATSHEET: CheatsheetGroup[] = [
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
    group: "NvChad: INSERT Mode",
    items: [
      ["<C-b>", "jump to line start"],
      ["<C-e>", "jump to line end"],
      ["<C-h>", "move left"],
      ["<C-l>", "move right"],
      ["<C-j>", "move down"],
      ["<C-k>", "move up"]
    ]
  },
  {
    group: "NvChad: Quick Commands",
    items: [
      ["<C-s>", "save file"],
      ["<C-c>", "copy whole file"],
      ["<Esc>", "clear search highlights"],
      ["<C-n>", "toggle NvimTree"],
      ["<leader>e", "focus NvimTree"]
    ]
  },
  {
    group: "NvChad: Settings & UI",
    items: [
      ["<leader>n", "toggle line numbers"],
      ["<leader>rn", "toggle relative numbers"],
      ["<leader>ch", "toggle cheatsheet"],
      ["<leader>/", "toggle comment"],
      ["<leader>fm", "format file"]
    ]
  },
  {
    group: "NvChad: Buffers & Windows",
    items: [
      ["<leader>b", "new buffer"],
      ["<Tab>", "next buffer"],
      ["<S-Tab>", "prev buffer"],
      ["<leader>x", "close buffer"],
      ["<C-h/j/k/l>", "switch window"]
    ]
  },
  {
    group: "NvChad: Telescope",
    items: [
      ["<leader>ff", "find files"],
      ["<leader>fa", "find all files"],
      ["<leader>fw", "live grep"],
      ["<leader>fb", "list buffers"],
      ["<leader>fh", "help tags"],
      ["<leader>ma", "find marks"],
      ["<leader>fo", "oldfiles"],
      ["<leader>fz", "buffer fuzzy find"],
      ["<leader>cm", "git commits"],
      ["<leader>gt", "git status"],
      ["<leader>pt", "pick terminal"],
      ["<leader>th", "themes"]
    ]
  },
  {
    group: "NvChad: Terminals",
    items: [
      ["<C-x>", "escape terminal mode"],
      ["<leader>h", "horizontal terminal"],
      ["<leader>v", "vertical terminal"],
      ["<A-h>", "toggle horiz terminal"],
      ["<A-v>", "toggle vert terminal"],
      ["<A-i>", "toggle float terminal"]
    ]
  },
  {
    group: "NvChad: WhichKey",
    items: [
      ["<leader>wK", "show all keymaps"],
      ["<leader>wk", "query keymaps"],
      ["<leader>ds", "diagnostics list"]
    ]
  }
];

export const THEMES: Theme[] = [
  { name: "onedark", bg: "#1e222a", accent: "#61afef", fg: "#abb2bf", green: "#98c379", red: "#e06c75", blue: "#61afef" },
  { name: "chadracula", bg: "#282a36", accent: "#bd93f9", fg: "#f8f8f2", green: "#50fa7b", red: "#ff5555", blue: "#bd93f9" },
  { name: "gruvchad", bg: "#282828", accent: "#d79921", fg: "#ebdbb2", green: "#b8bb26", red: "#fb4934", blue: "#83a598" },
  { name: "tokyonight", bg: "#1a1b26", accent: "#7aa2f7", fg: "#c0caf5", green: "#9ece6a", red: "#f7768e", blue: "#7aa2f7" },
  { name: "catppuccin", bg: "#1e1e2e", accent: "#cba6f7", fg: "#cdd6f4", green: "#a6e3a1", red: "#f38ba8", blue: "#89b4fa" }
];
