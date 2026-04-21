import { useEffect, useMemo, useRef, useState } from "react";
import type { VFSDir } from "../vfs";

interface Props {
  root: VFSDir;
  openFilePath: string[] | null;
  onSelect: (path: string[]) => void;
  onClose: () => void;
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

export default function NvimTree({ root, openFilePath, onSelect, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  // Expand top-level dirs by default
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    Object.entries(root.children).forEach(([name, node]) => {
      if (node.type === "dir") s.add(name);
    });
    return s;
  });

  const [cursor, setCursor] = useState(0);

  const items = useMemo(() => buildList(root, expanded), [root, expanded]);

  // Focus container on open
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Scroll cursor item into view
  useEffect(() => {
    itemsRef.current[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

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
    if (item.type === "dir") {
      toggle(item.path.join("/"));
    } else {
      onSelect(item.path);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "j":
      case "ArrowDown":
        e.preventDefault();
        setCursor(c => Math.min(c + 1, items.length - 1));
        break;
      case "k":
      case "ArrowUp":
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
        break;
      case "Enter":
      case "l":
      case "ArrowRight":
        e.preventDefault();
        activate(cursor);
        break;
      case "h":
      case "ArrowLeft": {
        e.preventDefault();
        const item = items[cursor];
        if (!item) break;
        const key = item.path.join("/");
        if (item.type === "dir" && expanded.has(key)) {
          toggle(key);
        } else {
          // Move cursor to parent
          const parentPath = item.path.slice(0, -1);
          if (parentPath.length === 0) break;
          const parentKey = parentPath.join("/");
          const parentIdx = items.findIndex(i => i.path.join("/") === parentKey);
          if (parentIdx >= 0) setCursor(parentIdx);
        }
        break;
      }
      case "q":
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "g":
        e.preventDefault();
        setCursor(0);
        break;
      case "G":
        e.preventDefault();
        setCursor(items.length - 1);
        break;
      default:
        break;
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
        <span className="nvimtree-keys">j/k ↕ · l/h open/close · q quit</span>
        <button className="nvimtree-close" onClick={onClose} title="Close (q)">×</button>
      </div>
      <div className="nvimtree-root-label">~/</div>
      <div className="nvimtree-body">
        {items.map((item, i) => {
          const isCursor = i === cursor;
          const isOpen = item.path.join("/") === openKey;
          const indent = item.depth * 14 + 6;

          return (
            <div
              key={item.path.join("/")}
              ref={el => { if (el) itemsRef.current[i] = el; }}
              className={[
                "nt-item",
                item.type === "dir" ? "nt-dir" : "nt-file",
                isCursor ? "nt-cursor" : "",
                isOpen ? "nt-active" : "",
              ].filter(Boolean).join(" ")}
              style={{ paddingLeft: indent }}
              onClick={() => { setCursor(i); activate(i); }}
            >
              {item.type === "dir" ? (
                <span className="nt-arrow">{item.expanded ? "▾" : "▸"}</span>
              ) : (
                <span className="nt-arrow"> </span>
              )}
              <span className="nt-icon">
                {item.type === "dir" ? "󰉖" : fileIcon(item.name)}
              </span>
              <span className="nt-name">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
