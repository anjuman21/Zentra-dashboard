import React, { useState } from "react";
import { Drawer, Popover, CloseButton } from "../Modal";
import { Toggle } from "../Settings";
import { openFlow, closeFlow, createStore } from "../../flows";

const a = (name) => `/assets/${name}`;
const go = (route) => {
  closeFlow();
  window.location.hash = `#/${route}`;
};

/* ───────────── Shared state ───────────── */

export const MODES = [
  { key: "Market insight", sub: "Prices, news and trends across the market", icon: "insert-chart.svg" },
  { key: "Portfolio review", sub: "Your holdings, P&L and risk", icon: "i-donut.svg" },
  { key: "Trade ideas", sub: "Setups with entry, stop and target — research only", icon: "tool-target.svg" },
  { key: "Learn crypto", sub: "Plain-language explanations, no jargon", icon: "ob-help.svg" },
];
export const MODELS = [
  { key: "Cortex 5.0", sub: "Balanced · answers in a few seconds" },
  { key: "Cortex 5.0 Deep", sub: "Slower, checks more sources — best for research" },
];
export const CONTEXTS = [
  { key: "portfolio", label: "My portfolio", sub: "Holdings, P&L and open orders", icon: "i-donut.svg", toggle: true },
  { key: "coin", label: "A coin or pair", sub: "Live price, chart and news", icon: "search.svg", pick: ["BTC", "ETH", "SOL"] },
  { key: "trades", label: "Trade history", sub: "Your last 90 days of trades", icon: "history.svg", toggle: true },
  { key: "file", label: "Upload a file", sub: "Screenshot or CSV, up to 10 MB", icon: "p-upload.svg", file: true },
];

const CHATS = [
  { id: "c1", q: "How is my portfolio doing?", when: "2h", group: "Pinned", pinned: true },
  { id: "c2", q: "Should I buy BTC under $95k?", when: "10m", group: "Today" },
  { id: "c3", q: "Why did SOL drop 6% today?", when: "3h", group: "Today" },
  { id: "c4", q: "Set a price alert for ETH at $3,500", when: "5h", group: "Today" },
  { id: "c5", q: "Explain impermanent loss simply", when: "1d", group: "Yesterday" },
  { id: "c6", q: "ETH vs SOL staking — which pays more?", when: "1d", group: "Yesterday" },
  { id: "c7", q: "Is my ADA stop loss too tight?", when: "Oct 16", group: "Past 7 days" },
  { id: "c8", q: "How do DCA rules work?", when: "Oct 14", group: "Past 7 days" },
  { id: "c9", q: "When should I rebalance my portfolio?", when: "Oct 13", group: "Past 7 days" },
  { id: "c10", q: "What does a 0.3% fee tier mean?", when: "Oct 12", group: "Past 7 days" },
  { id: "c11", q: "How are staking rewards taxed?", when: "Oct 10", group: "Past 7 days" },
];

export const aiStore = createStore({
  chats: CHATS,
  active: null,
  threads: {},
  mode: "Market insight",
  model: "Cortex 5.0",
  context: { portfolio: true, trades: false, coin: null, file: null },
  feedback: {},
  query: "",
});

/* ───────────── Answers ───────────── */

let n = 0;
const stamp = () => `Oct 19, 10:${String(45 + (n++ % 14)).padStart(2, "0")} AM`;

// Noa is a front-end demo: answers are canned and picked by keyword.
export function answer(q, st) {
  const t = q.toLowerCase();
  const id = `m${Date.now()}${n}`;
  if (/should i buy|buy btc|buy bitcoin/.test(t)) return { id, from: "noa", kind: "buy", text: "I can’t tell you what to do, but here’s how it looks for you right now.", source: `Live prices · ${stamp()} · Not financial advice` };
  if (/portfolio|doing|holdings/.test(t))
    return {
      id,
      from: "noa",
      kind: "portfolio",
      text: st.context.portfolio ? "You’re up 5.33% today — ETH did most of the work. One thing to watch: SOL fell 6.12% in the last 3 hours." : "Turn on “My portfolio” with + so I can see your holdings — for now, here’s the market: BTC is flat and ETH is up 4.21% today.",
      source: `${st.context.portfolio ? "Your portfolio + live prices" : "Live prices"} · ${stamp()} · Not financial advice`,
      card: st.context.portfolio,
    };
  if (/eth.*close|close.*eth|yesterday/.test(t)) return { id, from: "noa", text: "ETH closed at $3,088.70 yesterday (UTC), and it’s up 4.21% since then.", source: `Live prices · ${stamp()}` };
  if (/sol/.test(t)) return { id, from: "noa", text: "SOL fell 6.12% in 3 hours after a large holder moved 1.2M SOL to exchanges. Your SOL/USDC pool is still in range and earning fees.", source: `Live prices + news · ${stamp()} · Not financial advice` };
  if (/impermanent/.test(t)) return { id, from: "noa", text: "Impermanent loss is what you give up by holding two tokens in a pool instead of holding them yourself. If one token’s price moves a lot, the pool rebalances and you end up with more of the weaker one. A 40% move costs about 1.4% versus just holding.", source: `Zentra Learn · ${stamp()}` };
  if (/alert/.test(t)) return { id, from: "noa", kind: "alert", text: "I can set that up — you’ll review it before it’s saved.", source: `${stamp()}` };
  if (/dca|rebalanc|stop loss/.test(t)) return { id, from: "noa", text: "Automations run rules for you: DCA buys a fixed amount on a schedule, rebalance keeps your target weights, and stop loss sells if price drops to your level. Each one has spend limits and you can pause it any time.", source: `Zentra Learn · ${stamp()}` };
  if (/stak/.test(t)) return { id, from: "noa", text: "ETH pays 3.45% APY flexible, SOL 2.67% with a 14-day lock. Per $1,000 a year that’s about $34.50 vs $26.70 — ETH pays more and you can leave any time.", source: `Live rates · ${stamp()} · Not financial advice` };
  if (/fee tier|0\.3%/.test(t)) return { id, from: "noa", text: "A 0.3% fee tier means every swap through that pool pays 0.3% to liquidity providers, split by pool share. Busy, volatile pairs usually use 0.3%; stablecoin pairs use 0.01%.", source: `Zentra Learn · ${stamp()}` };
  if (/tax/.test(t)) return { id, from: "noa", text: "In most countries staking rewards count as income when you receive them, valued at that day’s price, and selling them later can create a gain or loss. History → Export → Tax report lists every reward for you.", source: `Zentra Learn · ${stamp()} · Not tax advice` };
  return { id, from: "noa", text: "Good question! The market is up 2.1% today, led by Layer-2 and DeFi tokens. Ask me about a coin, your portfolio or a strategy for more detail.", source: `Live prices · ${stamp()} · Not financial advice` };
}

export function ask(q) {
  const st = aiStore.get();
  let id = st.active;
  let chats = st.chats;
  if (!id) {
    const hit = st.chats.find((c) => c.q.toLowerCase() === q.toLowerCase());
    id = hit ? hit.id : `c${Date.now()}`;
    if (!hit) chats = [{ id, q, when: "now", group: "Today" }, ...chats];
  }
  const thread = [...(st.threads[id] || []), { id: `u${Date.now()}`, from: "you", text: q }, answer(q, st)];
  aiStore.set((s) => ({ ...s, chats, active: id, threads: { ...s.threads, [id]: thread } }));
}

export function openChat(id) {
  const st = aiStore.get();
  if (st.threads[id]) aiStore.set((s) => ({ ...s, active: id }));
  else {
    aiStore.set((s) => ({ ...s, active: null }));
    ask(st.chats.find((c) => c.id === id).q);
    aiStore.set((s) => ({ ...s, active: id }));
  }
}

export const newChat = () => aiStore.set((s) => ({ ...s, active: null }));

/* ───────────── 02A · Mode ───────────── */

export function ModeMenu({ anchor }) {
  const st = aiStore.use();
  return (
    <Popover onClose={closeFlow} label="Mode" anchor={anchor} align="left" width={316}>
      <div className="fl-menu">
        <span className="fl-menu__label aif-label">MODE</span>
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`aif-opt${st.mode === m.key ? " is-on" : ""}`}
            aria-pressed={st.mode === m.key}
            onClick={() => {
              aiStore.set((s) => ({ ...s, mode: m.key }));
              closeFlow();
            }}
          >
            <span className="aif-opt__icon">
              <img className="mono" src={a(m.icon)} alt="" width="16" height="16" />
            </span>
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">{m.key}</span>
              <span className="fl-sub fl-sub--11">{m.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </Popover>
  );
}

/* ───────────── 02B · Model ───────────── */

export function ModelMenu({ anchor }) {
  const st = aiStore.use();
  return (
    <Popover onClose={closeFlow} label="Model" anchor={anchor} width={316}>
      <div className="fl-menu">
        <span className="fl-menu__label aif-label">MODEL</span>
        {MODELS.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`aif-opt${st.model === m.key ? " is-on" : ""}`}
            aria-pressed={st.model === m.key}
            onClick={() => {
              aiStore.set((s) => ({ ...s, model: m.key }));
              closeFlow();
            }}
          >
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">{m.key}</span>
              <span className="fl-sub fl-sub--11">{m.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </Popover>
  );
}

/* ───────────── 03A · Context ───────────── */

export function ContextMenu({ anchor }) {
  const st = aiStore.use();
  const [pick, setPick] = useState(false);
  const set = (k, v) => aiStore.set((s) => ({ ...s, context: { ...s.context, [k]: v } }));
  return (
    <Popover onClose={closeFlow} label="Add context" anchor={anchor} align="left" width={300}>
      <div className="fl-menu">
        <span className="fl-menu__label aif-label">ADD CONTEXT TO THIS CHAT</span>
        {CONTEXTS.map((c) => {
          const on = !!st.context[c.key];
          return (
            <div key={c.key}>
              <div className={`aif-opt aif-opt--row${on ? " is-on" : ""}`}>
                <span className="aif-opt__icon">
                  <img className="mono" src={a(c.icon)} alt="" width="16" height="16" />
                </span>
                <span className="fl-coin__name">
                  <span className="fl-strong fl-strong--13">{c.label}</span>
                  <span className="fl-sub fl-sub--11">{c.key === "coin" && st.context.coin ? `Using ${st.context.coin}/USDT` : c.key === "file" && st.context.file ? st.context.file : c.sub}</span>
                </span>
                {c.toggle ? (
                  <Toggle on={on} onChange={(v) => set(c.key, v)} label={c.label} />
                ) : c.file ? (
                  <label className="aif-file" aria-label="Choose a file">
                    <input type="file" accept="image/*,.csv" onChange={(e) => e.target.files[0] && set("file", e.target.files[0].name)} />
                    <span className="afl-chev">›</span>
                  </label>
                ) : (
                  <button type="button" className="aif-more" aria-expanded={pick} aria-label="Pick a coin" onClick={() => setPick(!pick)}>
                    <span className={`afl-chev alf-chev${pick ? " is-open" : ""}`}>›</span>
                  </button>
                )}
              </div>
              {c.pick && pick && (
                <div className="mf-chips aif-coins">
                  {c.pick.map((x) => (
                    <button key={x} type="button" className={`mf-chip${st.context.coin === x ? " is-on" : ""}`} onClick={() => set("coin", st.context.coin === x ? null : x)}>
                      {x}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <hr className="fl-hr fl-hr--menu" />
        <p className="aif-privacy">
          <img className="mono" src={a("st-lock.svg")} alt="" width="16" height="16" />
          <span>
            Noa only uses what you add, for this chat. Change it any time in{" "}
            <button type="button" className="hp-link" onClick={() => go("settings")}>
              Settings → AI & privacy
            </button>
            .
          </span>
        </p>
      </div>
    </Popover>
  );
}

/* ───────────── 04A · Feedback ───────────── */

const REASONS = ["Wrong numbers", "Out of date", "Didn’t answer", "Too long", "Unsafe advice"];

export function Feedback({ anchor, msg }) {
  const [reasons, setReasons] = useState(["Wrong numbers"]);
  const [note, setNote] = useState("");
  const [share, setShare] = useState(true);
  const [sent, setSent] = useState(false);
  const send = () => {
    aiStore.set((s) => ({ ...s, feedback: { ...s.feedback, [msg]: "bad" } }));
    setSent(true);
    setTimeout(closeFlow, 900);
  };
  return (
    <Popover onClose={closeFlow} label="What went wrong?" anchor={anchor} width={336}>
      <div className="aif-fb">
        {sent ? (
          <p className="hf-status__note is-green">
            <img src={a("st-check.svg")} alt="" width="12" height="12" />
            Thanks — this helps Noa get better{share ? ". The team will check this chat." : "."}
          </p>
        ) : (
          <>
            <div className="fl-head">
              <div className="fl-head__text">
                <h2 className="fl-head__title aif-fb__title">What went wrong?</h2>
              </div>
              <CloseButton onClick={closeFlow} />
            </div>
            <div className="mf-chips">
              {REASONS.map((r) => (
                <button key={r} type="button" aria-pressed={reasons.includes(r)} className={`mf-chip${reasons.includes(r) ? " is-on" : ""}`} onClick={() => setReasons((x) => (x.includes(r) ? x.filter((y) => y !== r) : [...x, r]))}>
                  {r}
                </button>
              ))}
            </div>
            <input className="aif-note" value={note} placeholder="Tell us more (optional)" aria-label="Tell us more" onChange={(e) => setNote(e.target.value)} />
            <label className="aif-share">
              <Toggle on={share} onChange={setShare} label="Share this chat so the team can check it" />
              <span>Share this chat so the team can check it</span>
            </label>
            <div className="sf-foot">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
                Cancel
              </button>
              <button type="button" className="btn-primary ob-btn" disabled={!reasons.length && !note.trim()} onClick={send}>
                Send feedback
              </button>
            </div>
          </>
        )}
      </div>
    </Popover>
  );
}

/* ───────────── Chats list (side panel and phone drawer) ───────────── */

export function ChatList({ onPick }) {
  const st = aiStore.use();
  const [menu, setMenu] = useState(null);
  const q = st.query.trim().toLowerCase();
  const list = st.chats.filter((c) => !q || c.q.toLowerCase().includes(q));
  const groups = ["Pinned", "Today", "Yesterday", "Past 7 days"];
  const pin = (id) => aiStore.set((s) => ({ ...s, chats: s.chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned, group: !c.pinned ? "Pinned" : "Today" } : c)) }));
  const del = (id) => aiStore.set((s) => ({ ...s, chats: s.chats.filter((c) => c.id !== id), active: s.active === id ? null : s.active }));
  return (
    <div className="aif-chats">
      <button
        type="button"
        className="btn-primary aif-new"
        onClick={() => {
          newChat();
          onPick?.();
        }}
      >
        <img src={a("add.svg")} alt="" width="18" height="18" className="alf-white" />
        New chat
      </button>
      <label className="aif-search">
        <img className="mono" src={a("search.svg")} alt="" width="18" height="18" />
        <input value={st.query} placeholder="Search chats" aria-label="Search chats" onChange={(e) => aiStore.set((s) => ({ ...s, query: e.target.value }))} />
        <kbd className="pf-desktop-only">⌘K</kbd>
      </label>
      <div className="aif-groups">
        {groups.map((g) => {
          const rows = list.filter((c) => c.group === g);
          if (!rows.length) return null;
          return (
            <div key={g} className="aif-group">
              <span className="aif-group__title">{g.toUpperCase()}</span>
              {rows.map((c) => (
                <div key={c.id} className={`aif-chat${st.active === c.id ? " is-on" : ""}`}>
                  <button
                    type="button"
                    className="aif-chat__q"
                    onClick={() => {
                      openChat(c.id);
                      onPick?.();
                    }}
                  >
                    {c.pinned && <img src={a("tool-target.svg")} alt="Pinned" width="12" height="12" className="aif-pin" />}
                    <span>{c.q}</span>
                  </button>
                  <span className="aif-chat__when">{c.when}</span>
                  <button type="button" className="aif-chat__more" aria-label={`Options for ${c.q}`} aria-expanded={menu === c.id} onClick={() => setMenu(menu === c.id ? null : c.id)}>
                    ⋯
                  </button>
                  {menu === c.id && (
                    <span className="aif-chat__menu">
                      <button type="button" onClick={() => { pin(c.id); setMenu(null); }}>
                        {c.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button type="button" className="afl-delete" onClick={() => { del(c.id); setMenu(null); }}>
                        Delete
                      </button>
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
        {!list.length && <p className="fl-sub fl-sub--13">No chats match “{st.query}”.</p>}
      </div>
    </div>
  );
}

export function ChatsDrawer() {
  return (
    <Drawer onClose={closeFlow} labelledBy="aif-chats-title" width={340}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="aif-chats-title" className="fl-head__title">
              Chats
            </h2>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="fl-drawer__scroll">
          <ChatList onPick={closeFlow} />
        </div>
        <p className="fl-sub fl-sub--11">Tap ⋯ on a chat to pin or delete it</p>
      </div>
    </Drawer>
  );
}

