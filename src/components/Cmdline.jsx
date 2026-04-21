export default function Cmdline({ active, prefix, text }) {
  if (!active) return null;
  return (
    <div className="cmdline">
      <span className="cmd-prefix">{prefix}</span>
      <span className="cmd-text">{text}</span>
      <span className="cmd-cursor">▌</span>
    </div>
  );
}
