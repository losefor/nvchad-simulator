import { useState } from "react";
import type { VFSDir, VFSNode } from "../vfs";

interface Props {
  root: VFSDir;
  openFilePath: string[] | null;
  onSelect: (path: string[]) => void;
  onClose: () => void;
}

interface NodeProps {
  name: string;
  node: VFSNode;
  path: string[];
  openFilePath: string[] | null;
  depth: number;
  onSelect: (path: string[]) => void;
}

function TreeNode({ name, node, path, openFilePath, depth, onSelect }: NodeProps) {
  const [open, setOpen] = useState(depth <= 1);
  const indent = depth * 12;
  const isActive = openFilePath !== null && openFilePath.join("/") === path.join("/");

  if (node.type === "dir") {
    const entries = Object.entries(node.children).sort(([a, na], [b, nb]) => {
      if (na.type !== nb.type) return na.type === "dir" ? -1 : 1;
      return a.localeCompare(b);
    });
    return (
      <div>
        <div
          className="nt-item nt-dir"
          style={{ paddingLeft: indent + 4 }}
          onClick={() => setOpen(o => !o)}
        >
          <span className="nt-arrow">{open ? "▾" : "▸"}</span>
          <span className="nt-icon">󰉖</span>
          <span className="nt-name">{name}</span>
        </div>
        {open && entries.map(([childName, childNode]) => (
          <TreeNode
            key={childName}
            name={childName}
            node={childNode}
            path={[...path, childName]}
            openFilePath={openFilePath}
            depth={depth + 1}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  const ext = name.split(".").pop() ?? "";
  const icon = ext === "lua" ? "󰢱" : ext === "md" ? "󰍔" : ext === "txt" ? "󰈙" : "󰈔";

  return (
    <div
      className={"nt-item nt-file" + (isActive ? " nt-active" : "")}
      style={{ paddingLeft: indent + 4 }}
      onClick={() => onSelect(path)}
    >
      <span className="nt-arrow"> </span>
      <span className="nt-icon">{icon}</span>
      <span className="nt-name">{name}</span>
    </div>
  );
}

export default function NvimTree({ root, openFilePath, onSelect, onClose }: Props) {
  const entries = Object.entries(root.children).sort(([a, na], [b, nb]) => {
    if (na.type !== nb.type) return na.type === "dir" ? -1 : 1;
    return a.localeCompare(b);
  });

  return (
    <div className="nvimtree">
      <div className="nvimtree-header">
        <span className="nvimtree-title">NvimTree</span>
        <button className="nvimtree-close" onClick={onClose} title="Close (Ctrl-n)">×</button>
      </div>
      <div className="nvimtree-root-label">~/</div>
      <div className="nvimtree-body">
        {entries.map(([name, node]) => (
          <TreeNode
            key={name}
            name={name}
            node={node}
            path={[name]}
            openFilePath={openFilePath}
            depth={1}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
