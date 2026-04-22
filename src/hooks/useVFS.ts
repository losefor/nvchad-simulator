import { useState, useCallback, useEffect } from "react";
import type { VFS } from "../vfs";
import {
  createInitialVFS, getNode, setNode, deleteNode,
  makeFile, makeDir, resolvePath, pathToStr,
} from "../vfs";

export interface TerminalLine {
  kind: "input" | "output" | "error";
  text: string;
}

export interface CommandResult {
  lines: TerminalLine[];
  action?: { type: "open"; pathStr: string } | { type: "clear" } | { type: "export" } | { type: "history" };
}

export interface OpenedFile {
  path: string[];
  name: string;
  content: string[];
}

function tokenize(raw: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  for (const ch of raw) {
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (ch === " " && !inSingle && !inDouble) {
      if (cur) { tokens.push(cur); cur = ""; }
      continue;
    }
    cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

const VFS_KEY = "nvim-sim-vfs";

function loadVFS(): VFS {
  try {
    const raw = localStorage.getItem(VFS_KEY);
    if (raw) return JSON.parse(raw) as VFS;
  } catch {}
  return createInitialVFS();
}

export function useVFS() {
  const [vfs, setVFS] = useState<VFS>(loadVFS);

  useEffect(() => {
    try { localStorage.setItem(VFS_KEY, JSON.stringify(vfs)); } catch {}
  }, [vfs]);

  const runCommand = useCallback((raw: string, currentVFS: VFS): CommandResult => {
    const trimmed = raw.trim();
    if (!trimmed) return { lines: [] };

    const out: TerminalLine[] = [];
    const print = (text: string) => out.push({ kind: "output", text });
    const err = (text: string) => out.push({ kind: "error", text });

    const tokens = tokenize(trimmed);
    const [cmd, ...args] = tokens;
    const resolve = (p: string) => resolvePath(currentVFS.cwd, p);

    switch (cmd) {
      case "pwd":
        print(pathToStr(currentVFS.cwd));
        break;

      case "ls": {
        const flags = args.filter(a => a.startsWith("-")).join("");
        const pathArg = args.find(a => !a.startsWith("-"));
        const target = pathArg ? resolve(pathArg) : currentVFS.cwd;
        const node = getNode(currentVFS.root, target);
        if (!node) { err(`ls: ${pathArg}: No such file or directory`); break; }
        if (node.type === "file") { print(target[target.length - 1] ?? ""); break; }
        const entries = Object.entries(node.children)
          .sort(([a, na], [b, nb]) => {
            if (na.type !== nb.type) return na.type === "dir" ? -1 : 1;
            return a.localeCompare(b);
          });
        if (!entries.length) { print("(empty)"); break; }
        if (flags.includes("l")) {
          print("total " + entries.length);
          for (const [name, n] of entries) {
            const isDir = n.type === "dir";
            const size = isDir ? "-" : String(n.content.join("\n").length);
            print(`${isDir ? "d" : "-"}rwxr-xr-x  ${size.padStart(6)}  ${name}${isDir ? "/" : ""}`);
          }
        } else {
          print(entries.map(([n, nd]) => nd.type === "dir" ? n + "/" : n).join("  "));
        }
        break;
      }

      case "cd": {
        const arg = args[0];
        const newPath = !arg || arg === "~" ? [] : resolve(arg);
        const node = getNode(currentVFS.root, newPath);
        if (!node) { err(`cd: ${arg}: No such file or directory`); break; }
        if (node.type !== "dir") { err(`cd: ${arg}: Not a directory`); break; }
        setVFS(v => ({ ...v, cwd: newPath }));
        break;
      }

      case "mkdir": {
        const recursive = args.includes("-p");
        const targets = args.filter(a => !a.startsWith("-"));
        for (const arg of targets) {
          const p = resolve(arg);
          if (getNode(currentVFS.root, p)) {
            if (!recursive) err(`mkdir: ${arg}: File exists`);
            continue;
          }
          if (recursive) {
            setVFS(v => {
              let root = v.root;
              const acc: string[] = [];
              for (const seg of p) {
                acc.push(seg);
                if (!getNode(root, [...acc])) root = setNode(root, [...acc], makeDir());
              }
              return { ...v, root };
            });
          } else {
            const parent = getNode(currentVFS.root, p.slice(0, -1));
            if (!parent || parent.type !== "dir") { err(`mkdir: ${arg}: No such file or directory`); continue; }
            setVFS(v => ({ ...v, root: setNode(v.root, p, makeDir()) }));
          }
        }
        break;
      }

      case "touch": {
        for (const arg of args) {
          const p = resolve(arg);
          if (!getNode(currentVFS.root, p)) {
            setVFS(v => ({ ...v, root: setNode(v.root, p, makeFile([""])) }));
          }
        }
        break;
      }

      case "cat": {
        for (const arg of args.filter(a => !a.startsWith("-"))) {
          const p = resolve(arg);
          const node = getNode(currentVFS.root, p);
          if (!node) { err(`cat: ${arg}: No such file or directory`); break; }
          if (node.type !== "file") { err(`cat: ${arg}: Is a directory`); break; }
          node.content.forEach(line => print(line));
        }
        break;
      }

      case "echo": {
        const rest = trimmed.slice(4).trim();
        const appendIdx = rest.lastIndexOf(">>");
        const writeIdx = rest.lastIndexOf(">");
        if (appendIdx >= 0) {
          const text = rest.slice(0, appendIdx).trim().replace(/^["']|["']$/g, "");
          const filePath = rest.slice(appendIdx + 2).trim();
          const p = resolve(filePath);
          setVFS(v => {
            const existing = getNode(v.root, p);
            const content = existing?.type === "file" ? [...existing.content, text] : [text];
            return { ...v, root: setNode(v.root, p, makeFile(content)) };
          });
        } else if (writeIdx >= 0) {
          const text = rest.slice(0, writeIdx).trim().replace(/^["']|["']$/g, "");
          const filePath = rest.slice(writeIdx + 1).trim();
          const p = resolve(filePath);
          setVFS(v => ({ ...v, root: setNode(v.root, p, makeFile([text])) }));
        } else {
          print(rest.replace(/^["']|["']$/g, ""));
        }
        break;
      }

      case "rm": {
        const recursive = args.some(a => a.includes("r"));
        const targets = args.filter(a => !a.startsWith("-"));
        for (const arg of targets) {
          const p = resolve(arg);
          const node = getNode(currentVFS.root, p);
          if (!node) { err(`rm: ${arg}: No such file or directory`); break; }
          if (node.type === "dir" && !recursive) { err(`rm: ${arg}: Is a directory`); break; }
          setVFS(v => ({ ...v, root: deleteNode(v.root, p) }));
        }
        break;
      }

      case "cp": {
        if (args.length < 2) { err("cp: missing destination"); break; }
        const src = resolve(args[0]);
        const dst = resolve(args[1]);
        const srcNode = getNode(currentVFS.root, src);
        if (!srcNode) { err(`cp: ${args[0]}: No such file or directory`); break; }
        setVFS(v => ({ ...v, root: setNode(v.root, dst, srcNode) }));
        break;
      }

      case "mv": {
        if (args.length < 2) { err("mv: missing destination"); break; }
        const src = resolve(args[0]);
        const dst = resolve(args[1]);
        const srcNode = getNode(currentVFS.root, src);
        if (!srcNode) { err(`mv: ${args[0]}: No such file or directory`); break; }
        setVFS(v => ({ ...v, root: setNode(deleteNode(v.root, src), dst, srcNode) }));
        break;
      }

      case "nvim": {
        if (!args[0]) { err("nvim: missing filename"); break; }
        return { lines: out, action: { type: "open", pathStr: args[0] } };
      }

      case "clear":
        return { lines: [], action: { type: "clear" } };

      case "reset": {
        const confirm = args[0];
        if (confirm !== "-y") {
          print("This will reset the VFS to defaults (all changes lost).");
          print("Run 'reset -y' to confirm.");
          break;
        }
        setVFS(createInitialVFS());
        return { lines: [{ kind: "output", text: "VFS reset to defaults." }], action: { type: "clear" } };
      }

      case "tree": {
        const targetPath = args[0] ? resolve(args[0]) : currentVFS.cwd;
        const targetNode = getNode(currentVFS.root, targetPath);
        if (!targetNode) { err(`tree: ${args[0]}: No such file or directory`); break; }
        if (targetNode.type !== "dir") { err(`tree: ${args[0]}: Not a directory`); break; }
        const label = args[0] ?? pathToStr(currentVFS.cwd);
        print(label);
        let count = { files: 0, dirs: 0 };
        function walkTree(dir: typeof targetNode & { type: "dir" }, prefix: string) {
          const entries = Object.entries(dir.children).sort(([a, na], [b, nb]) => {
            if (na.type !== nb.type) return na.type === "dir" ? -1 : 1;
            return a.localeCompare(b);
          });
          entries.forEach(([name, node], i) => {
            const isLast = i === entries.length - 1;
            const connector = isLast ? "└── " : "├── ";
            const childPrefix = prefix + (isLast ? "    " : "│   ");
            print(prefix + connector + name + (node.type === "dir" ? "/" : ""));
            if (node.type === "dir") { count.dirs++; walkTree(node, childPrefix); }
            else count.files++;
          });
        }
        walkTree(targetNode as typeof targetNode & { type: "dir" }, "");
        print(`\n${count.dirs} director${count.dirs === 1 ? "y" : "ies"}, ${count.files} file${count.files === 1 ? "" : "s"}`);
        break;
      }

      case "head":
      case "tail": {
        const nFlag = args.indexOf("-n");
        const n = nFlag >= 0 ? parseInt(args[nFlag + 1] ?? "10", 10) : 10;
        const fileArg = args.find(a => !a.startsWith("-") && !/^\d+$/.test(a));
        if (!fileArg) { err(`${cmd}: missing file operand`); break; }
        const p = resolve(fileArg);
        const node = getNode(currentVFS.root, p);
        if (!node) { err(`${cmd}: ${fileArg}: No such file or directory`); break; }
        if (node.type !== "file") { err(`${cmd}: ${fileArg}: Is a directory`); break; }
        const lines2 = cmd === "head" ? node.content.slice(0, n) : node.content.slice(-n);
        lines2.forEach(l => print(l));
        break;
      }

      case "grep": {
        if (args.length < 2) { err("grep: usage: grep <pattern> <file>"); break; }
        const patArg = args[0];
        const fileArg = args[1];
        let re: RegExp;
        try { re = new RegExp(patArg, "g"); } catch { err(`grep: invalid pattern: ${patArg}`); break; }
        const p = resolve(fileArg);
        const node = getNode(currentVFS.root, p);
        if (!node) { err(`grep: ${fileArg}: No such file or directory`); break; }
        if (node.type !== "file") { err(`grep: ${fileArg}: Is a directory`); break; }
        let matched = 0;
        node.content.forEach((line, i) => {
          re.lastIndex = 0;
          if (re.test(line)) { print(`${i + 1}: ${line}`); matched++; }
        });
        if (matched === 0) print("(no matches)");
        break;
      }

      case "wc": {
        const fileArg = args.find(a => !a.startsWith("-"));
        if (!fileArg) { err("wc: missing file operand"); break; }
        const p = resolve(fileArg);
        const node = getNode(currentVFS.root, p);
        if (!node) { err(`wc: ${fileArg}: No such file or directory`); break; }
        if (node.type !== "file") { err(`wc: ${fileArg}: Is a directory`); break; }
        const text = node.content.join("\n");
        const lineCount = node.content.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const charCount = text.length;
        if (args.includes("-l")) { print(String(lineCount)); break; }
        if (args.includes("-w")) { print(String(wordCount)); break; }
        if (args.includes("-c")) { print(String(charCount)); break; }
        print(`${lineCount}\t${wordCount}\t${charCount}\t${fileArg}`);
        break;
      }

      case "export": {
        return { lines: out, action: { type: "export" as "export" } };
      }

      case "history":
        return { lines: out, action: { type: "history" as "history" } };

      case "help":
        print("Available commands:");
        print("  ls [-l] [path]         list directory");
        print("  cd [path]              change directory (~ = home)");
        print("  pwd                    print working directory");
        print("  mkdir [-p] <dir>       create directory");
        print("  touch <file>           create empty file");
        print("  cat <file>             show file content");
        print("  echo <text>            print text");
        print('  echo <text> > <file>   write to file');
        print('  echo <text> >> <file>  append to file');
        print("  rm [-rf] <path>        remove file/directory");
        print("  cp <src> <dst>         copy file");
        print("  mv <src> <dst>         move/rename file");
        print("  head [-n N] <file>     first N lines (default 10)");
        print("  tail [-n N] <file>     last N lines (default 10)");
        print("  grep <pattern> <file>  search file with regex");
        print("  wc [-l|-w|-c] <file>   count lines/words/chars");
        print("  tree [path]            show directory tree");
        print("  nvim <file>            open file in editor");
        print("  clear                  clear terminal");
        print("  reset [-y]             reset VFS to defaults");
        print("  export                 download VFS as JSON");
        print("  history                show command history");
        break;

      default:
        err(`${cmd}: command not found  (type 'help' for commands)`);
    }

    return { lines: out };
  }, []);

  const saveFile = useCallback((path: string[], content: string[]) => {
    setVFS(v => ({ ...v, root: setNode(v.root, path, makeFile(content)) }));
  }, []);

  const createDir = useCallback((path: string[]) => {
    setVFS(v => ({ ...v, root: setNode(v.root, path, makeDir()) }));
  }, []);

  const deleteItem = useCallback((path: string[]) => {
    setVFS(v => {
      const newRoot = deleteNode(v.root, path);
      // Reset cwd if it was inside deleted path
      const cwdStr = v.cwd.join("/");
      const delStr = path.join("/");
      const newCwd = cwdStr.startsWith(delStr) ? path.slice(0, -1) : v.cwd;
      return { root: newRoot, cwd: newCwd };
    });
  }, []);

  const renameItem = useCallback((oldPath: string[], newName: string) => {
    setVFS(v => {
      const node = getNode(v.root, oldPath);
      if (!node) return v;
      const newPath = [...oldPath.slice(0, -1), newName];
      const withNew = setNode(v.root, newPath, node);
      const withoutOld = deleteNode(withNew, oldPath);
      return { ...v, root: withoutOld };
    });
  }, []);

  const openFile = useCallback((pathStr: string, cwd: string[]): OpenedFile => {
    const p = resolvePath(cwd, pathStr);
    const existing = getNode(vfs.root, p);
    if (!existing) {
      setVFS(v => ({ ...v, root: setNode(v.root, p, makeFile([""])) }));
      return { path: p, name: p[p.length - 1] ?? "untitled", content: [""] };
    }
    if (existing.type !== "file") {
      return { path: p, name: p[p.length - 1] ?? "untitled", content: [""] };
    }
    return {
      path: p,
      name: p[p.length - 1] ?? "untitled",
      content: existing.content.length ? existing.content : [""],
    };
  }, [vfs]);

  const getCompletions = useCallback((input: string, currentVFS: VFS): string[] => {
    const tokens = tokenize(input);
    const COMMANDS = ["ls", "cd", "pwd", "mkdir", "touch", "cat", "echo", "rm", "cp", "mv",
      "nvim", "clear", "reset", "tree", "head", "tail", "grep", "wc", "export", "history", "help"];

    // Complete command name
    if (tokens.length === 0 || (tokens.length === 1 && !input.endsWith(" "))) {
      const partial = tokens[0] ?? "";
      return COMMANDS.filter(c => c.startsWith(partial));
    }

    // Complete path argument
    const partial = input.endsWith(" ") ? "" : (tokens[tokens.length - 1] ?? "");
    const slashIdx = partial.lastIndexOf("/");
    const dirPart = slashIdx >= 0 ? partial.slice(0, slashIdx) : "";
    const namePart = slashIdx >= 0 ? partial.slice(slashIdx + 1) : partial;

    const dirPath = dirPart
      ? resolvePath(currentVFS.cwd, dirPart)
      : currentVFS.cwd;
    const dirNode = getNode(currentVFS.root, dirPath);
    if (!dirNode || dirNode.type !== "dir") return [];

    return Object.entries(dirNode.children)
      .filter(([name]) => name.startsWith(namePart))
      .map(([name, node]) => (dirPart ? dirPart + "/" : "") + name + (node.type === "dir" ? "/" : ""));
  }, []);

  return { vfs, runCommand, saveFile, openFile, createDir, deleteItem, renameItem, getCompletions };
}
