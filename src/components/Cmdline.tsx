interface Props {
  active: boolean;
  prefix: string;
  text: string;
}

export default function Cmdline({ active, prefix, text }: Props) {
  if (!active) return null;
  return (
    <div className="cmdline">
      <span className="cmd-prefix">{prefix}</span>
      <span className="cmd-text">{text}</span>
      <span className="cmd-cursor">▌</span>
    </div>
  );
}
