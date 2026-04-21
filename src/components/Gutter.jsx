export default function Gutter({ lineCount, currentRow }) {
  const lines = [];
  for (let r = 0; r < lineCount; r++) {
    lines.push(
      <div key={r} className={"gutter-line" + (r === currentRow ? " current" : "")}>
        {r === currentRow ? r + 1 : Math.abs(r - currentRow)}
      </div>
    );
  }
  return <div className="gutter">{lines}</div>;
}
