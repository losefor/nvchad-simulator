import { CHEATSHEET } from "../data/lessons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Cheatsheet({ open, onClose }: Props) {
  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal" onClick={handleBackdrop}>
      <div className="modal-card">
        <div className="modal-head">
          <h2>NvChad Cheatsheet</h2>
          <button className="btn-ghost" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="cheat-grid">
            {CHEATSHEET.map((g) => (
              <div className="cheat-group" key={g.group}>
                <h3>{g.group}</h3>
                {g.items.map(([k, v]) => (
                  <div className="row" key={k}>
                    <kbd>{k}</kbd>
                    <span className="desc">{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
