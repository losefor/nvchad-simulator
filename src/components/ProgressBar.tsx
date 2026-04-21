interface Props {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: Props) {
  const pct = total ? (completed / total) * 100 : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>Progress</span>
        <span>{completed} / {total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
