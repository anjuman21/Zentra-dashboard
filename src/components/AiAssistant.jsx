import React, { useEffect, useRef, useState } from "react";
import { icons } from "../data";
import { CardTitle } from "./Portfolio";
import { aiicons, MODES, MODELS, suggestions, recentChats, noaReply } from "../aiData";

const next = (list, value) => list[(list.indexOf(value) + 1) % list.length];

function MobileHeader({ onBack }) {
  return (
    <div className="ai-mhead">
      <div className="ai-mhead__title">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}>
          <img className="mono" src={aiicons.back} alt="" width="24" height="24" />
        </button>
        <span className="ai-mhead__text">
          <span className="ai-mhead__name">Noa</span>
          <span className="ai-mhead__sub">Your AI assistant</span>
        </span>
      </div>
      <button type="button" className="ai-mhead__more" aria-label="More options">
        <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

function Composer({ onSend }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState(MODES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
  };
  return (
    <form
      className="ai-input"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <textarea
        className="ai-input__field"
        rows={1}
        value={text}
        placeholder="Ask about coins, portfolio or market trends..."
        aria-label="Message Noa"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
      />
      <div className="ai-input__bar">
        <div className="ai-input__group">
          <button type="button" className="ai-btn ai-btn--white ai-btn--square" aria-label="Add attachment">
            <img className="mono" src={icons.add} alt="" width="18" height="18" />
          </button>
          <button type="button" className="ai-btn ai-btn--white" onClick={() => setMode((m) => next(MODES, m))}>
            <img src={aiicons.paid} alt="" width="18" height="18" />
            <span>{mode}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
        </div>
        <div className="ai-input__group ai-input__group--tight">
          <button type="button" className="ai-btn ai-model" onClick={() => setModel((m) => next(MODELS, m))}>
            <span>{model}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
          <button type="button" className="ai-btn ai-btn--square" aria-label="Voice input">
            <img className="mono" src={aiicons.mic} alt="" width="20" height="20" />
          </button>
          <button type="submit" className="btn-primary ai-send" aria-label="Send" disabled={!text.trim()}>
            <img src={aiicons.send} alt="" width="20" height="20" />
          </button>
        </div>
      </div>
    </form>
  );
}

function Conversation({ messages }) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length]);
  return (
    <div className="ai-thread" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={`ai-msg ai-msg--${m.from}`}>
          {m.from === "noa" && <img className="ai-msg__avatar" src={aiicons.orb} alt="" width="28" height="28" />}
          <p className="ai-msg__bubble">{m.text}</p>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}

function RecentChats({ onPick }) {
  return (
    <aside className="card ai-recent">
      <CardTitle title="Recent Chats" />
      <ul className="ai-recent__list">
        {recentChats.map((c) => (
          <li key={c.q}>
            <button type="button" className="ai-recent__item" onClick={() => onPick(c.q)}>
              <span className="ai-recent__row">
                <span className="ai-recent__q">{c.q}</span>
                <img className="mono" src={aiicons.chevron} alt="" width="16" height="16" />
              </span>
              <span className="ai-recent__when">{c.when}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function AiAssistant({ onBack }) {
  const [messages, setMessages] = useState([]);
  const ask = (text) => setMessages((list) => [...list, { from: "you", text }, { from: "noa", text: noaReply(text) }]);
  const chatting = messages.length > 0;

  return (
    <main className={`ai-page${chatting ? " is-chatting" : ""}`}>
      <section className="ai-chat">
        <img className="ai-chat__grid" src={aiicons.grid} alt="" width="850" height="952" aria-hidden="true" />
        <MobileHeader onBack={onBack} />
        {chatting ? (
          <Conversation messages={messages} />
        ) : (
          <div className="ai-hero">
            <img className="ai-hero__orb" src={aiicons.orb} alt="" width="170" height="170" />
            <div className="ai-hero__text">
              <h1 className="ai-hero__title">Hey! I’m Noa. Your AI assistant</h1>
              <p className="ai-hero__sub">Ask me anything about crypto, trading, portfolio, or market trends</p>
            </div>
          </div>
        )}
        <div className="ai-bottom">
          {!chatting && (
            <div className="ai-suggest">
              <p className="ai-suggest__title">Suggest for you</p>
              <div className="ai-suggest__list">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="ai-chip" onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Composer onSend={ask} />
          <p className="ai-help">
            Try asking about market trends, portfolio analysis, trading strategies, or general crypto questions.
          </p>
        </div>
      </section>
      <RecentChats onPick={ask} />
    </main>
  );
}
