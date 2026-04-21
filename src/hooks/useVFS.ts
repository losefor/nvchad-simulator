import { useState, useCallback } from "react";
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
  action?: { type: "open"; pathStr: string } | { type: "clear" };
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

export function useVFS() {
  const [vfs, setVFS] = useState<VFS>(createInitialVFS);

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
        print("  nvim <file>            open file in editor");
        print("  clear                  clear terminal");
        break;

      default:
        err(`${cmd}: command not found  (type 'help' for commands)`);
    }

    return { lines: out };
  }, []);

  const saveFile = useCallback((path: string[], content: string[]) => {
    setVFS(v => ({ ...v, root: setNode(v.root, path, makeFile(content)) }));
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

  return { vfs, runCommand, saveFile, openFile };
}
