interface Props {
  modified: boolean;
  filename?: string;
}

export default function Tabline({ modified, filename }: Props) {
  const name = filename ?? "lesson.txt";
  const icon = filename ? " " : " ";
  return (
    <div className="tabline">
      <div className="tab active">
        <span className="tab-icon">{icon}</span>
        <span className="tab-name">{name}</span>
        <span className={"tab-mod" + (modified ? " show" : "")}>●</span>
      </div>
      {!filename && (
        <div className="tab dim">
          <span className="tab-icon"> </span>
          <span className="tab-name">course.md</span>
        </div>
      )}
      <div className="tab-spacer" />
      <div className="tab-info">{filename ? "VFS" : "1/2"}</div>
    </div>
  );
}
