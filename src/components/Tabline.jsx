export default function Tabline({ modified }) {
  return (
    <div className="tabline">
      <div className="tab active">
        <span className="tab-icon"> </span>
        <span className="tab-name">lesson.txt</span>
        <span className={"tab-mod" + (modified ? " show" : "")}>●</span>
      </div>
      <div className="tab dim">
        <span className="tab-icon"> </span>
        <span className="tab-name">course.md</span>
      </div>
      <div className="tab-spacer" />
      <div className="tab-info">1/2</div>
    </div>
  );
}
