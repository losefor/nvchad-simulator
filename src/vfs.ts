export interface VFSFile {
  type: "file";
  content: string[];
}

export interface VFSDir {
  type: "dir";
  children: Record<string, VFSNode>;
}

export type VFSNode = VFSFile | VFSDir;

export interface VFS {
  root: VFSDir;
  cwd: string[];
}

export function makeFile(content: string[] = [""]): VFSFile {
  return { type: "file", content };
}

export function makeDir(children: Record<string, VFSNode> = {}): VFSDir {
  return { type: "dir", children };
}

export function resolvePath(cwd: string[], input: string): string[] {
  if (!input || input === "~" || input === "~/") return [];
  const startFromRoot = input.startsWith("/") || input.startsWith("~/");
  const stripped = input.replace(/^~\//, "").replace(/^\//, "");
  const base = startFromRoot ? [] : [...cwd];
  for (const seg of stripped.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") { base.pop(); continue; }
    base.push(seg);
  }
  return base;
}

export function getNode(root: VFSDir, path: string[]): VFSNode | null {
  let cur: VFSNode = root;
  for (const seg of path) {
    if (cur.type !== "dir") return null;
    const child = cur.children[seg];
    if (child === undefined) return null;
    cur = child;
  }
  return cur;
}

export function setNode(root: VFSDir, path: string[], node: VFSNode): VFSDir {
  if (path.length === 0) return root;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    return { ...root, children: { ...root.children, [head]: node } };
  }
  const child = root.children[head];
  if (!child || child.type !== "dir") return root;
  return { ...root, children: { ...root.children, [head]: setNode(child, rest, node) } };
}

export function deleteNode(root: VFSDir, path: string[]): VFSDir {
  if (path.length === 0) return root;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    const children = { ...root.children };
    delete children[head];
    return { ...root, children };
  }
  const child = root.children[head];
  if (!child || child.type !== "dir") return root;
  return { ...root, children: { ...root.children, [head]: deleteNode(child, rest) } };
}

export function pathToStr(path: string[]): string {
  return "~" + (path.length ? "/" + path.join("/") : "");
}

export function createInitialVFS(): VFS {
  return {
    cwd: ["todo-app"],
    root: makeDir({
      "todo-app": makeDir({
        "index.html": makeFile([
          "<!DOCTYPE html>",
          '<html lang="en">',
          "<head>",
          '  <meta charset="UTF-8" />',
          '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
          "  <title>Todo List</title>",
          '  <link rel="stylesheet" href="style.css" />',
          "</head>",
          "<body>",
          '  <div class="container">',
          '    <h1>My Todo List</h1>',
          "",
          '    <div class="input-row">',
          '      <input type="text" id="todo-input" placeholder="Add a new task..." />',
          '      <button id="add-btn">Add</button>',
          "    </div>",
          "",
          '    <ul id="todo-list"></ul>',
          "",
          '    <div class="footer">',
          '      <span id="count">0 tasks left</span>',
          '      <button id="clear-btn">Clear done</button>',
          "    </div>",
          "  </div>",
          "",
          '  <script src="app.js"></script>',
          "</body>",
          "</html>",
        ]),
        "style.css": makeFile([
          "* {",
          "  box-sizing: border-box;",
          "  margin: 0;",
          "  padding: 0;",
          "}",
          "",
          "body {",
          "  font-family: sans-serif;",
          "  background: #f0f2f5;",
          "  display: flex;",
          "  justify-content: center;",
          "  padding: 40px 16px;",
          "}",
          "",
          ".container {",
          "  background: #fff;",
          "  border-radius: 8px;",
          "  box-shadow: 0 2px 12px rgba(0,0,0,0.1);",
          "  padding: 32px;",
          "  width: 100%;",
          "  max-width: 480px;",
          "}",
          "",
          "h1 {",
          "  font-size: 24px;",
          "  margin-bottom: 24px;",
          "  color: #1a1a2e;",
          "}",
          "",
          ".input-row {",
          "  display: flex;",
          "  gap: 8px;",
          "  margin-bottom: 20px;",
          "}",
          "",
          "input[type='text'] {",
          "  flex: 1;",
          "  padding: 10px 14px;",
          "  border: 1px solid #ddd;",
          "  border-radius: 6px;",
          "  font-size: 14px;",
          "  outline: none;",
          "}",
          "",
          "input[type='text']:focus {",
          "  border-color: #6366f1;",
          "}",
          "",
          "button {",
          "  padding: 10px 18px;",
          "  border: none;",
          "  border-radius: 6px;",
          "  background: #6366f1;",
          "  color: #fff;",
          "  font-size: 14px;",
          "  cursor: pointer;",
          "}",
          "",
          "button:hover {",
          "  background: #4f46e5;",
          "}",
          "",
          "#todo-list {",
          "  list-style: none;",
          "  margin-bottom: 16px;",
          "}",
          "",
          "#todo-list li {",
          "  display: flex;",
          "  align-items: center;",
          "  gap: 10px;",
          "  padding: 10px 0;",
          "  border-bottom: 1px solid #f0f0f0;",
          "}",
          "",
          "#todo-list li.done span {",
          "  text-decoration: line-through;",
          "  color: #aaa;",
          "}",
          "",
          ".delete-btn {",
          "  margin-left: auto;",
          "  background: none;",
          "  color: #e06c75;",
          "  font-size: 18px;",
          "  padding: 0 4px;",
          "}",
          "",
          ".footer {",
          "  display: flex;",
          "  justify-content: space-between;",
          "  align-items: center;",
          "  font-size: 13px;",
          "  color: #888;",
          "}",
          "",
          "#clear-btn {",
          "  background: none;",
          "  color: #888;",
          "  font-size: 13px;",
          "  padding: 4px 8px;",
          "  border: 1px solid #ddd;",
          "}",
        ]),
        "app.js": makeFile([
          "const input = document.getElementById('todo-input');",
          "const addBtn = document.getElementById('add-btn');",
          "const list = document.getElementById('todo-list');",
          "const count = document.getElementById('count');",
          "const clearBtn = document.getElementById('clear-btn');",
          "",
          "let todos = [];",
          "",
          "function render() {",
          "  list.innerHTML = '';",
          "  todos.forEach((todo, i) => {",
          "    const li = document.createElement('li');",
          "    if (todo.done) li.classList.add('done');",
          "",
          "    const checkbox = document.createElement('input');",
          "    checkbox.type = 'checkbox';",
          "    checkbox.checked = todo.done;",
          "    checkbox.addEventListener('change', () => toggle(i));",
          "",
          "    const span = document.createElement('span');",
          "    span.textContent = todo.text;",
          "",
          "    const del = document.createElement('button');",
          "    del.className = 'delete-btn';",
          "    del.textContent = '×';",
          "    del.addEventListener('click', () => remove(i));",
          "",
          "    li.append(checkbox, span, del);",
          "    list.appendChild(li);",
          "  });",
          "",
          "  const remaining = todos.filter(t => !t.done).length;",
          "  count.textContent = remaining + ' task' + (remaining !== 1 ? 's' : '') + ' left';",
          "}",
          "",
          "function addTodo() {",
          "  const text = input.value.trim();",
          "  if (!text) return;",
          "  todos.push({ text, done: false });",
          "  input.value = '';",
          "  render();",
          "}",
          "",
          "function toggle(i) {",
          "  todos[i].done = !todos[i].done;",
          "  render();",
          "}",
          "",
          "function remove(i) {",
          "  todos.splice(i, 1);",
          "  render();",
          "}",
          "",
          "addBtn.addEventListener('click', addTodo);",
          "input.addEventListener('keydown', e => {",
          "  if (e.key === 'Enter') addTodo();",
          "});",
          "clearBtn.addEventListener('click', () => {",
          "  todos = todos.filter(t => !t.done);",
          "  render();",
          "});",
          "",
          "render();",
        ]),
        "README.md": makeFile([
          "# Todo App",
          "",
          "A simple todo list built with vanilla HTML, CSS, and JS.",
          "",
          "## Files",
          "",
          "- index.html  — page structure",
          "- style.css   — styling",
          "- app.js      — todo logic",
          "",
          "## Practice ideas",
          "",
          "- Add a priority field to each todo",
          "- Save todos to localStorage",
          "- Add filter buttons: All / Active / Done",
        ]),
      }),
    }),
  };
}
