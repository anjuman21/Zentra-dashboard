import React, { useEffect, useRef, useState } from "react";
import { icons } from "../data";
import { anchorOf } from "./Modal";
import { openFlow } from "../flows";
import { aiicons, suggestions } from "../aiData";
import { aiStore, ask, newChat, ChatList, CONTEXTS } from "./flows/AiFlows";

const pop = (name, props) => (e) => openFlow(name, { anchor: anchorOf(e.currentTarget), ...props });

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
      <button type="button" className="ai-mhead__more" aria-label="Chats" aria-haspopup="dialog" onClick={() => openFlow("ai.chats")}>
        <img className="mono" src={aiicons.chats} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

// 05A · Voice: a live transcript you review before it sends.
const SPOKEN = "What’s moving the crypto market today";

function Voice({ onDone, onCancel }) {
  const [words, setWords] = useState(0);
  const [stopped, setStopped] = useState(false);
  const all = SPOKEN.split(" ");
  useEffect(() => {
    if (stopped || words >= all.length) return undefined;
    const t = setTimeout(() => setWords((w) => w + 1), 260);
    return () => clearTimeout(t);
  }, [words, stopped, all.length]);
  const text = all.slice(0, words).join(" ");
  const listening = !stopped && words < all.length;
  return (
    <div className="ai-voice" role="dialog" aria-label="Voice input">
      <img className="ai-voice__orb" src={aiicons.orb} alt="" width="76" height="76" />
      <p className="ai-voice__text" aria-live="polite">
        {text || "Listening…"}
      </p>
      <div className="ai-voice__bar">
        <button type="button" className="ai-voice__x" aria-label="Cancel voice input" onClick={onCancel}>
          ×
        </button>
        <span className={`ai-voice__wave${listening ? " is-live" : ""}`} aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <span key={i} style={{ "--h": i > 30 ? `${6 + ((i * 7) % 13)}px` : "3px", "--d": `${(i % 6) * 0.08}s` }} />
          ))}
        </span>
        <button type="button" className="ai-voice__stop" aria-label={listening ? "Stop listening" : "Stopped"} onClick={() => setStopped(true)} disabled={!listening}>
          <span />
        </button>
        <button type="button" className="btn-primary ai-send" aria-label="Send" disabled={!text} onClick={() => onDone(text)}>
          <img src={aiicons.send} alt="" width="20" height="20" />
        </button>
      </div>
    </div>
  );
}

function Composer() {
  const st = aiStore.use();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(false);
  const used = CONTEXTS.filter((c) => st.context[c.key]).map((c) => (c.key === "coin" ? `${st.context.coin}/USDT` : c.key === "file" ? st.context.file : c.label));
  const send = () => {
    const value = text.trim();
    if (!value) return;
    ask(value);
    setText("");
  };
  if (voice) {
    return (
      <Voice
        onCancel={() => setVoice(false)}
        onDone={(t) => {
          setVoice(false);
          setText(t);
        }}
      />
    );
  }
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
      {used.length > 0 && (
        <div className="ai-using">
          {used.map((u) => (
            <span key={u} className="ai-using__chip">
              <img className="mono" src="/assets/i-donut.svg" alt="" width="14" height="14" />
              Using: {u}
            </span>
          ))}
        </div>
      )}
      <div className="ai-input__bar">
        <div className="ai-input__group">
          <button type="button" className="ai-btn ai-btn--white ai-btn--square" aria-label="Add context" aria-haspopup="dialog" onClick={pop("ai.context")}>
            <img className="mono" src={icons.add} alt="" width="18" height="18" />
          </button>
          <button type="button" className="ai-btn ai-btn--white" aria-haspopup="dialog" onClick={pop("ai.mode")}>
            <img src={aiicons.paid} alt="" width="18" height="18" />
            <span>{st.mode}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
        </div>
        <div className="ai-input__group ai-input__group--tight">
          <button type="button" className="ai-btn ai-model" aria-haspopup="dialog" onClick={pop("ai.model")}>
            <span>{st.model}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
          <button type="button" className="ai-btn ai-btn--square" aria-label="Voice input" onClick={() => setVoice(true)}>
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

const go = (route) => (window.location.hash = `#/${route}`);

// 01A · your numbers in a card.
function PortfolioCard() {
  const split = [
    ["BTC", 48, "#f7931a"],
    ["ETH", 27, "#627eea"],
    ["SOL", 12, "#5720f5"],
    ["Stablecoins", 13, "#48b187"],
  ];
  return (
    <div className="ai-card">
      <span className="ai-card__top">
        <span className="ai-card__value">$39,551.76</span>
        <span className="alf-diff is-up">+5.33% · 24h</span>
      </span>
      <span className="sf-split ai-card__split" aria-hidden="true">
        {split.map(([k, v, c]) => (
          <span key={k} style={{ flex: v, background: c }} />
        ))}
      </span>
      <span className="ai-card__legend">
        {split.map(([k, v, c]) => (
          <span key={k}>
            <span className="hf-dot" style={{ background: c }} />
            {k} <strong>{v}%</strong>
          </span>
        ))}
      </span>
      <hr className="fl-hr" />
      <span className="ai-card__rows">
        <span>
          Best today <strong className="sf-up">ETH +4.21%</strong>
        </span>
        <span>
          Worst today <strong className="sf-down">SOL −6.12%</strong>
        </span>
        <span>
          SOL/USDC pool <strong>Still in range · earning fees</strong>
        </span>
      </span>
    </div>
  );
}

// 01B · both sides, your context, and actions that always ask first.
function BuyCard() {
  return (
    <div className="ai-buy">
      <span className="ai-card ai-card--row">
        <img src="/assets/t-btc.svg" alt="" width="22" height="22" />
        <span className="fl-strong">BTC $96,183.23</span>
        <span className="alf-diff is-down">−0.8% · 24h</span>
        <span className="ai-tag">$3,816.77 below $100k</span>
      </span>
      <span className="ai-sides">
        <span className="ai-side is-for">
          <strong>Why some would buy</strong>
          <span>• $95k is 1.2% under today’s price</span>
          <span>• You already have a dip-buy rule at $92,000</span>
          <span>• Buying in parts (DCA) lowers timing risk</span>
        </span>
        <span className="ai-side is-against">
          <strong>What to weigh</strong>
          <span>• BTC is already 48% of your portfolio</span>
          <span>• It moved ±3% a day this week</span>
          <span>• Only 4,812 USDT is free to spend</span>
        </span>
      </span>
      <span className="ai-actions">
        <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("alerts.create", { coin: "BTC" })}>
          Alert me at $95,000
        </button>
        <button type="button" className="ob-btn ob-btn--secondary" onClick={() => go("markets")}>
          Open BTC chart
        </button>
        <button type="button" className="btn-primary ob-btn" onClick={() => go("trade")}>
          Review a buy…
        </button>
      </span>
      <span className="fl-sub fl-sub--11 ai-safe">
        <img className="mono" src="/assets/au-shield.svg" alt="" width="14" height="14" />
        Noa never trades for you — every action opens a screen you confirm.
      </span>
    </div>
  );
}

function Follow({ items }) {
  return (
    <span className="ai-follow">
      {items.map((t) => (
        <button key={t} type="button" className="ai-follow__chip" onClick={() => ask(t)}>
          {t}
        </button>
      ))}
    </span>
  );
}

function NoaMessage({ m }) {
  const st = aiStore.use();
  const [copied, setCopied] = useState(false);
  const fb = st.feedback[m.id];
  const rate = (v) => aiStore.set((s) => ({ ...s, feedback: { ...s.feedback, [m.id]: s.feedback[m.id] === v ? undefined : v } }));
  return (
    <div className="ai-msg ai-msg--noa">
      <img className="ai-msg__avatar" src={aiicons.orb} alt="" width="28" height="28" />
      <div className="ai-msg__body">
        <p className="ai-msg__text">{m.text}</p>
        {m.kind === "portfolio" && m.card && (
          <>
            <PortfolioCard />
            <Follow items={["Show my best performer", "Should I rebalance?", "Set a SOL alert"]} />
          </>
        )}
        {m.kind === "buy" && <BuyCard />}
        {m.kind === "alert" && (
          <button type="button" className="btn-primary ob-btn fl-btn-auto ai-inline-cta" onClick={() => openFlow("alerts.create", { coin: "ETH" })}>
            Set up the alert
          </button>
        )}
        <span className="ai-msg__foot">
          <span className="fl-sub fl-sub--11">{m.source}</span>
          <span className="ai-msg__acts">
            <button
              type="button"
              className="ai-act"
              onClick={() => {
                navigator.clipboard?.writeText(m.text).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" className={`ai-act${fb === "good" ? " is-on" : ""}`} aria-pressed={fb === "good"} onClick={() => rate("good")}>
              Helpful
            </button>
            <button type="button" className={`ai-act${fb === "bad" ? " is-on" : ""}`} aria-pressed={fb === "bad"} aria-haspopup="dialog" onClick={pop("ai.feedback", { msg: m.id })}>
              Not helpful
            </button>
          </span>
        </span>
      </div>
    </div>
  );
}

function Conversation({ messages }) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length]);
  return (
    <div className="ai-thread" aria-live="polite">
      {messages.map((m) =>
        m.from === "noa" ? (
          <NoaMessage key={m.id} m={m} />
        ) : (
          <div key={m.id} className="ai-msg ai-msg--you">
            <p className="ai-msg__bubble">{m.text}</p>
          </div>
        ),
      )}
      <div ref={end} />
    </div>
  );
}

function Chats() {
  const st = aiStore.use();
  return (
    <aside className="card ai-recent ai-chats">
      <div className="pf-card__title">
        <h2 className="card-title">Chats</h2>
        <span className="fl-sub fl-sub--13">{st.chats.length + 13}</span>
      </div>
      <ChatList />
      <p className="fl-sub fl-sub--11 ai-chats__more">Scroll for 10 older chats</p>
    </aside>
  );
}

export default function AiAssistant({ onBack }) {
  const st = aiStore.use();
  const messages = (st.active && st.threads[st.active]) || [];
  const chatting = messages.length > 0;
  // ⌘K jumps to chat search; leaving the page starts fresh next time.
  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector(".ai-chats .aif-search input")?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      newChat();
    };
  }, []);

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
          <Composer />
          <p className="ai-help">Try asking about market trends, portfolio analysis, trading strategies, or general crypto questions.</p>
        </div>
      </section>
      <Chats />
    </main>
  );
}
