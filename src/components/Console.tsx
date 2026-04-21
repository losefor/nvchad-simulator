import { useState } from "react";
import type { Lesson, Message, KeyLogEntry } from "../types";

interface HintsPaneProps {
  lesson: Lesson;
}

function HintsPane({ lesson }: HintsPaneProps) {
  return (
    <div className="ctab-pane active">
      <div className="hint-title">Hints</div>
      <ul>
        {lesson.hints.map((h, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: h }} />
        ))}
      </ul>
    </div>
  );
}

interface KeyLogPaneProps {
  entries: KeyLogEntry[];
}

function KeyLogPane({ entries }: KeyLogPaneProps) {
  return (
    <div className="ctab-pane active">
      {entries.map((k, i) => (
        <div key={i} className="key-log-line">
          <span className="ch">{k.key}</span> <em>{k.time}</em>
        </div>
      ))}
    </div>
  );
}

interface MessagesPaneProps {
  messages: Message[];
}

function MessagesPane({ messages }: MessagesPaneProps) {
  return (
    <div className="ctab-pane active">
      {messages.map((m, i) => (
        <div key={i} className={"msg " + m.kind}>{m.text}</div>
      ))}
    </div>
  );
}

interface Props {
  lesson: Lesson;
  messages: Message[];
  keyLog: KeyLogEntry[];
  onCheck: () => void;
  onSkip: () => void;
}

export default function Console({
  lesson,
  messages,
  keyLog,
  onCheck,
  onSkip
}: Props) {
  const [tab, setTab] = useState("hints");

  return (
    <section className="console">
      <div className="console-head">
        <div className="console-tabs">
          {["hints", "keys", "messages"].map((t) => (
            <button
              key={t}
              className={"ctab" + (tab === t ? " active" : "")}
              onClick={() => setTab(t)}
            >
              {t === "keys" ? "Keys Log" : t === "messages" ? ":messages" : "Hints"}
            </button>
          ))}
        </div>
        <div className="console-actions">
          <button className="btn-primary" onClick={onCheck}>Check ✓</button>
          <button className="btn-ghost" onClick={() => setTab("hints")}>Hint</button>
          <button className="btn-ghost" onClick={onSkip}>Skip →</button>
        </div>
      </div>
      <div className="console-body">
        {tab === "hints" && <HintsPane lesson={lesson} />}
        {tab === "keys" && <KeyLogPane entries={keyLog} />}
        {tab === "messages" && <MessagesPane messages={messages} />}
      </div>
    </section>
  );
}
