const MODES = {
  normal: { label: "NORMAL", cls: "mode-normal" },
  insert: { label: "INSERT", cls: "mode-insert" },
  visual: { label: "VISUAL", cls: "mode-visual" },
  vline: { label: "V-LINE", cls: "mode-vline" },
  command: { label: "COMMAND", cls: "mode-command" },
  replace: { label: "REPLACE", cls: "mode-replace" }
};

export default function Statusline({ mode, cursor, keyBuf }) {
  const m = MODES[mode] || MODES.normal;
  return (
    <div className="statusline">
      <span className={"mode-indicator " + m.cls}>{m.label}</span>
      <span className="file-indicator">lesson.txt</span>
      <span className="status-spacer" />
      <span className="keys-buffer">{keyBuf}</span>
      <span className="lint-indicator">  0   0</span>
      <span className="pos-indicator">
        {cursor[0] + 1}:{cursor[1] + 1}
      </span>
      <span className="percent-indicator">All</span>
    </div>
  );
}
