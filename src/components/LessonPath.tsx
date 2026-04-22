import { Fragment, useEffect, useRef } from "react";
import { LESSONS } from "../data/lessons";
import type { Lesson } from "../types";

interface Props {
  currentLesson: number;
  completed: Set<string>;
  onSelect: (idx: number) => void;
}

interface Section {
  title: string;
  entries: { lesson: Lesson; idx: number }[];
}

const SECTION_COLORS: Record<string, string> = {
  BEGINNER:   "#98c379",
  MEDIUM:     "#61afef",
  ADVANCED:   "#c678dd",
  GRADUATION: "#e5c07b",
};

// zigzag offsets: right → center-right → center-left → left
const OFFSETS = [56, 24, -24, -56];
const CONNECTOR_H = 28;

function ConnectorLine({ from, to }: { from: number; to: number }) {
  const dx = to - from;
  const pad = Math.abs(dx) + 10;
  const w = Math.max(pad, 10);
  const cx = w / 2;
  const midX = (from + to) / 2;

  return (
    <svg
      className="lp-connector"
      width={w}
      height={CONNECTOR_H}
      style={{ transform: `translateX(${midX}px)` }}
    >
      <line
        x1={cx - dx / 2}
        y1={0}
        x2={cx + dx / 2}
        y2={CONNECTOR_H}
        stroke="var(--border)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

function groupBySections(lessons: Lesson[]): Section[] {
  const sections: Section[] = [];
  let cur = "";
  lessons.forEach((lesson, idx) => {
    if (lesson.section !== cur) {
      cur = lesson.section;
      sections.push({ title: lesson.section, entries: [] });
    }
    sections[sections.length - 1].entries.push({ lesson, idx });
  });
  return sections;
}

export default function LessonPath({ currentLesson, completed, onSelect }: Props) {
  const sections = groupBySections(LESSONS);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentLesson]);

  const nextIdx = LESSONS.findIndex(l => !completed.has(l.id));
  const firstUnlocked = nextIdx === -1 ? LESSONS.length : nextIdx;

  let globalPos = 0;

  return (
    <div className="lesson-path">
      {sections.map(section => {
        const color = SECTION_COLORS[section.title] ?? "#7aa2f7";
        return (
          <div key={section.title} className="lp-section">
            <div className="lp-section-banner" style={{ background: color }}>
              <span className="lp-section-label">{section.title}</span>
            </div>

            {section.entries.map(({ lesson, idx }, entryIdx) => {
              const offset = OFFSETS[globalPos % OFFSETS.length];
              const nextOffset = OFFSETS[(globalPos + 1) % OFFSETS.length];
              const isLastInSection = entryIdx === section.entries.length - 1;
              globalPos++;

              const isDone = completed.has(lesson.id);
              const isCurrent = idx === firstUnlocked || (nextIdx === -1 && idx === currentLesson);
              const isLocked = !isDone && !isCurrent;

              const stateClass = isDone ? "lp-done" : isCurrent ? "lp-current" : "lp-locked";

              return (
                <Fragment key={lesson.id}>
                  <div
                    ref={isCurrent ? currentRef : undefined}
                    className={`lp-node-row ${stateClass}`}
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {isCurrent && (
                      <div className="lp-start-badge">START</div>
                    )}
                    <button
                      className={`lp-node ${stateClass}`}
                      onClick={() => !isLocked && onSelect(idx)}
                      disabled={isLocked}
                      title={lesson.title}
                    >
                      {isDone ? (
                        <span className="lp-icon">✓</span>
                      ) : isCurrent ? (
                        <span className="lp-icon lp-star">★</span>
                      ) : (
                        <span className="lp-icon lp-lock">🔒</span>
                      )}
                    </button>
                    <div className="lp-node-title">{lesson.title}</div>
                  </div>

                  {!isLastInSection && (
                    <ConnectorLine from={offset} to={nextOffset} />
                  )}
                </Fragment>
              );
            })}
          </div>
        );
      })}

      <div className="lp-end">
        <span>🎓</span>
        <p>All lessons complete!</p>
      </div>
    </div>
  );
}
