import { useEffect, useRef, useState } from "react";

interface Props {
  type: "files" | "grep" | "buffers";
  onClose: () => void;
  onSelect: (item: string) => void;
}

const FILES = [
  "lua/plugins/init.lua",
  "lua/plugins/ui.lua",
  "lua/plugins/lsp.lua",
  "lua/chadrc.lua",
  "lua/options.lua",
  "lua/mappings.lua",
  "lua/plugins/telescope.lua",
  "lua/plugins/treesitter.lua",
  "lua/plugins/cmp.lua",
  "lua/plugins/null-ls.lua",
  ".stylua.toml",
  ".editorconfig",
  "README.md",
  "lazy-lock.json",
];

const GREP_RESULTS = [
  "lua/mappings.lua:12:  map('n', '<leader>ff', '<cmd>Telescope find_files<CR>')",
  "lua/mappings.lua:13:  map('n', '<leader>fw', '<cmd>Telescope live_grep<CR>')",
  "lua/mappings.lua:14:  map('n', '<leader>fb', '<cmd>Telescope buffers<CR>')",
  "lua/plugins/telescope.lua:5:  extensions = { 'fzf', 'file_browser' }",
  "lua/chadrc.lua:3:  M.ui = { theme = 'onedark' }",
  "lua/options.lua:8:  vim.opt.number = true",
  "lua/options.lua:9:  vim.opt.relativenumber = true",
];

const BUFFERS = [
  "1 %a  lua/mappings.lua",
  "2  h  lua/chadrc.lua",
  "3  h  lua/options.lua",
  "4  h  lua/plugins/init.lua",
];

function getItems(type: Props["type"]): string[] {
  if (type === "files") return FILES;
  if (type === "grep") return GREP_RESULTS;
  return BUFFERS;
}

function getTitle(type: Props["type"]): string {
  if (type === "files") return "Find Files";
  if (type === "grep") return "Live Grep";
  return "Buffers";
}

export default function Telescope({ type, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const items = getItems(type);

  const filtered = query
    ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selected]) onSelect(filtered[selected]);
        return;
      }
      if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "j")) {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
        return;
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [filtered, selected, onClose, onSelect]);

  return (
    <div className="telescope-overlay" onClick={onClose}>
      <div className="telescope-modal" onClick={(e) => e.stopPropagation()}>
        <div className="telescope-header">
          <span className="telescope-title">Telescope: {getTitle(type)}</span>
          <span className="telescope-hint">↑↓ navigate  Enter select  Esc close</span>
        </div>
        <div className="telescope-input-row">
          <span className="telescope-prompt">&gt; </span>
          <input
            ref={inputRef}
            className="telescope-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            spellCheck={false}
          />
        </div>
        <div className="telescope-results">
          {filtered.length === 0 && (
            <div className="telescope-empty">No results</div>
          )}
          {filtered.map((item, i) => (
            <div
              key={i}
              className={"telescope-item" + (i === selected ? " telescope-item-sel" : "")}
              onMouseEnter={() => setSelected(i)}
              onClick={() => onSelect(item)}
            >
              <span className="telescope-idx">{i + 1}</span>
              <span className="telescope-name">{item}</span>
            </div>
          ))}
        </div>
        <div className="telescope-footer">
          {filtered.length}/{items.length} items
        </div>
      </div>
    </div>
  );
}
