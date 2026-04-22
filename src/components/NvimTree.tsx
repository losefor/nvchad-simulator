import { useEffect, useMemo, useRef, useState } from "react";
import type { VFSDir } from "../vfs";

interface Props {
  root: VFSDir;
  cwd: string[];
  openFilePath: string[] | null;
  onSelect: (path: string[]) => void;
  onClose: () => void;
  onCreate: (path: string[], isDir: boolean) => void;
  onRename: (oldPath: string[], newName: string) => void;
  onDelete: (path: string[]) => void;
}

interface FlatItem {
  path: string[];
  name: string;
  type: "file" | "dir";
  depth: number;
  expanded: boolean;
}

function buildList(root: VFSDir, expanded: Set<string>): FlatItem[] {
  const items: FlatItem[] = [];
  function walk(dir: VFSDir, base: string[], depth: number) {
    const entries = Object.entries(dir.children).sort(([a, na], [b, nb]) => {
      if (na.type !== nb.type) return na.type === "dir" ? -1 : 1;
      return a.localeCompare(b);
    });
    for (const [name, node] of entries) {
      const path = [...base, name];
      const key = path.join("/");
      const isExpanded = expanded.has(key);
      items.push({ path, name, type: node.type, depth, expanded: isExpanded });
      if (node.type === "dir" && isExpanded) walk(node, path, depth + 1);
    }
  }
  walk(root, [], 0);
  return items;
}

function fileIcon(name: string): string {
  const ext = name.split(".").pop() ?? "";
  if (ext === "html") return "󰌹";
  if (ext === "css") return "󰌜";
  if (ext === "js" || ext === "ts") return "󰌞";
  if (ext === "lua") return "󰢱";
  if (ext === "md") return "󰍔";
  if (ext === "json") return "󰘦";
  return "󰈔";
}

type InputAction = { kind: "create"; parentPath: string[] } | { kind: "rename"; item: FlatItem };

export default function NvimTree({ root, cwd, openFilePath, onSelect, onClose, onCreate, onRename, onDelete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    Object.entries(root.children).forEach(([name, node]) => {
      if (node.type === "dir") s.add(name);
    });
    return s;
  });

  const [cursor, setCursor] = useState(0);
  const [inputAction, setInputAction] = useState<InputAction | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [confirm, setConfirm] = useState<FlatItem | null>(null);

  const items = useMemo(() => buildList(root, expanded), [root, expanded]);

  // Clamp cursor when items shrink
  useEffect(() => {
    setCursor(c => Math.min(c, Math.max(0, items.length - 1)));
  }, [items.length]);

  useEffect(() => { containerRef.current?.focus(); }, []);

  useEffect(() => {
    itemsRef.current[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // Focus input when action starts
  useEffect(() => {
    if (inputAction) setTimeout(() => inputRef.current?.focus(), 0);
  }, [inputAction]);

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const activate = (idx: number) => {
    const item = items[idx];
    if (!item) return;
    if (item.type === "dir") toggle(item.path.join("/"));
    else onSelect(item.path);
  };

  const currentItem = items[cursor];

  // Determine parent dir for "create" — if cursor is on a dir, use it; else use parent
  const createParent = (): string[] => {
    if (!currentItem) return cwd;
    if (currentItem.type === "dir" && expanded.has(currentItem.path.join("/")))
      return currentItem.path;
    return currentItem.path.slice(0, -1);
  };

  const startCreate = () => {
    setInputAction({ kind: "create", parentPath: createParent() });
    setInputValue("");
    setConfirm(null);
  };

  const startRename = () => {
    if (!currentItem) return;
    setInputAction({ kind: "rename", item: currentItem });
    setInputValue(currentItem.name);
    setConfirm(null);
  };

  const commitInput = () => {
    const name = inputValue.trim();
    if (!name || !inputAction) { cancelInput(); return; }

    if (inputAction.kind === "create") {
      const isDir = name.endsWith("/");
      const cleanName = isDir ? name.slice(0, -1) : name;
      if (!cleanName) { cancelInput(); return; }
      onCreate([...inputAction.parentPath, cleanName], isDir);
      // Expand parent if needed
      const parentKey = inputAction.parentPath.join("/");
      if (parentKey) setExpanded(prev => new Set([...prev, parentKey]));
    } else {
      onRename(inputAction.item.path, name);
    }
    cancelInput();
  };

  const cancelInput = () => {
    setInputAction(null);
    setInputValue("");
    setTimeout(() => containerRef.current?.focus(), 0);
  };

  const confirmDelete = () => {
    if (!currentItem) return;
    setConfirm(currentItem);
    setInputAction(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (inputAction || confirm) return; // handled separately

    switch (e.key) {
      case "j": case "ArrowDown":
        e.preventDefault(); setCursor(c => Math.min(c + 1, items.length - 1)); break;
      case "k": case "ArrowUp":
        e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); break;
      case "Enter": case "l": case "ArrowRight":
        e.preventDefault(); activate(cursor); break;
      case "h": case "ArrowLeft": {
        e.preventDefault();
        if (!currentItem) break;
        const key = currentItem.path.join("/");
        if (currentItem.type === "dir" && expanded.has(key)) {
          toggle(key);
        } else {
          const parentPath = currentItem.path.slice(0, -1);
          if (!parentPath.length) break;
          const pi = items.findIndex(i => i.path.join("/") === parentPath.join("/"));
          if (pi >= 0) setCursor(pi);
        }
        break;
      }
      case "a": e.preventDefault(); startCreate(); break;
      case "r": e.preventDefault(); startRename(); break;
      case "d": e.preventDefault(); confirmDelete(); break;
      case "q": case "Escape": e.preventDefault(); onClose(); break;
      case "g": e.preventDefault(); setCursor(0); break;
      case "G": e.preventDefault(); setCursor(items.length - 1); break;
    }
  };

  const openKey = openFilePath?.join("/") ?? null;

  return (
    <div
      ref={containerRef}
      className="nvimtree"
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ outline: "none" }}
    >
      <div className="nvimtree-header">
        <span className="nvimtree-title">NvimTree</span>
        <span className="nvimtree-keys">a new · r rename · d delete · q quit</span>
        <button className="nvimtree-close" onClick={onClose} title="Close (q)">×</button>
      </div>
      <div className="nvimtree-root-label">~/</div>
      <div className="nvimtree-body">
        {items.map((item, i) => {
          const isCursor = i === cursor;
          const isOpen = item.path.join("/") === openKey;
          const indent = item.depth * 14 + 6;
          const isRenamingThis = inputAction?.kind === "rename" && inputAction.item.path.join("/") === item.path.join("/");

          return (
            <div
              key={item.path.join("/")}
              ref={el => { if (el) itemsRef.current[i] = el; }}
              className={["nt-item", item.type === "dir" ? "nt-dir" : "nt-file", isCursor ? "nt-cursor" : "", isOpen ? "nt-active" : ""].filter(Boolean).join(" ")}
              style={{ paddingLeft: indent }}
              onClick={() => { setCursor(i); activate(i); }}
            >
              {item.type === "dir" ? (
                <span className="nt-arrow">{item.expanded ? "▾" : "▸"}</span>
              ) : (
                <span className="nt-arrow"> </span>
              )}
              <span className="nt-icon">{item.type === "dir" ? "󰉖" : fileIcon(item.name)}</span>
              {isRenamingThis ? (
                <input
                  ref={inputRef}
                  className="nt-inline-input"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); commitInput(); }
                    if (e.key === "Escape") { e.preventDefault(); cancelInput(); }
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="nt-name">{item.name}</span>
              )}
            </div>
          );
        })}

        {/* Inline create input — shown after the parent dir */}
        {inputAction?.kind === "create" && (() => {
          const parentKey = inputAction.parentPath.join("/");
          const parentIdx = parentKey
            ? items.findIndex(i => i.path.join("/") === parentKey)
            : -1;
          const depth = parentIdx >= 0 ? (items[parentIdx]?.depth ?? 0) + 1 : 0;
          const indent = depth * 14 + 6;
          return (
            <div className="nt-item nt-new" style={{ paddingLeft: indent }}>
              <span className="nt-arrow"> </span>
              <span className="nt-icon">󰈔</span>
              <input
                ref={inputRef}
                className="nt-inline-input"
                value={inputValue}
                placeholder="name (add / for dir)"
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.preventDefault(); commitInput(); }
                  if (e.key === "Escape") { e.preventDefault(); cancelInput(); }
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          );
        })()}

        {/* Delete confirmation */}
        {confirm && (
          <div className="nt-confirm">
            <span>Delete <strong>{confirm.name}</strong>? </span>
            <button className="nt-confirm-yes" onClick={() => { onDelete(confirm.path); setConfirm(null); setTimeout(() => containerRef.current?.focus(), 0); }}>Yes</button>
            <button className="nt-confirm-no" onClick={() => { setConfirm(null); setTimeout(() => containerRef.current?.focus(), 0); }}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}
