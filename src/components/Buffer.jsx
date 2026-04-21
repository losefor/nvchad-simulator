import Cursor from "./Cursor.jsx";

function inRange(r, c, sel) {
  if (sel.line) return r >= sel.start[0] && r <= sel.end[0];
  if (r < sel.start[0] || r > sel.end[0]) return false;
  if (r === sel.start[0] && c < sel.start[1]) return false;
  if (r === sel.end[0] && c > sel.end[1]) return false;
  return true;
}

function renderLine(line, r, sel) {
  if (!line.length) return <span>&nbsp;</span>;
  const parts = [];
  for (let c = 0; c < line.length; c++) {
    const ch = line[c];
    const selected = sel && inRange(r, c, sel);
    parts.push(
      selected ? (
        <span key={c} className="sel">{ch}</span>
      ) : (
        <span key={c}>{ch}</span>
      )
    );
  }
  return parts;
}

export default function Buffer({ buffer, cursor, mode, visualRange }) {
  return (
    <div className="buffer-wrap">
      <div className="buffer">
        {buffer.map((line, r) => (
          <span
            key={r}
            className={"ln" + (r === cursor[0] ? " current-line" : "")}
          >
            {renderLine(line, r, visualRange)}
          </span>
        ))}
      </div>
      <Cursor row={cursor[0]} col={cursor[1]} mode={mode} />
    </div>
  );
}
