const CHAR_W = 8.4;
const LINE_H = 21;

export default function Cursor({ row, col, mode }) {
  const top = 12 + row * LINE_H;
  const left = 14 + col * CHAR_W;
  let cls = "cursor ";
  if (mode === "insert") cls += "cursor-bar";
  else if (mode === "command") cls += "cursor-hidden";
  else cls += "cursor-block";
  return <div className={cls} style={{ top: `${top}px`, left: `${left}px` }} />;
}
