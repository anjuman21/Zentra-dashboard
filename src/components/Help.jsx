import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/help.css";
import {
  hicons,
  POPULAR_SEARCHES,
  TOPICS,
  topicById,
  ARTICLES,
  articleById,
  GROUP_TOTALS,
  GROUP_PREVIEW,
  POPULAR_ARTICLES,
  MOST_READ,
  RELATED,
  ARTICLE_BODY,
  SYSTEM_STATUS,
  TICKETS,
  RECENT_SEARCHES,
  CHAT,
  TICKET_DETAIL,
  searchArticles,
  searchTopics,
} from "../helpData";

const go = (route) => {
  window.location.hash = `#/${route}`;
};
const searchRoute = (q) => `help/search/${encodeURIComponent(q.trim())}`;

// The mobile top bar shows a back arrow on every help screen below the home page.
export function helpBack(sub) {
  const [view, id] = sub.split("/");
  if (view === "article") return { label: topicById(articleById(id).topic).title, route: `help/topic/${articleById(id).topic}` };
  if (view === "topic") return { label: "Help & Docs", route: "help" };
  if (view === "search") return { label: "Search", route: "help" };
  if (view === "chat") return { label: "Maya · Support", route: "help" };
  return null;
}

export function helpTitle(sub) {
  const [view, id] = sub.split("/");
  if (view === "article") return articleById(id).title;
  if (view === "topic") return topicById(id).title;
  if (view === "search") return "Search results";
  if (view === "chat") return "Support chat";
  return "Help & Docs";
}

/* ───────────── Shared pieces ───────────── */

export function Header({ title, crumbs, small }) {
  return (
    <div className="pf-header hp-header">
      <div className={`pf-header__text hp-header__text${small ? " is-small" : ""}`}>
        <h1 className="pf-header__title hp-header__title">{title}</h1>
        <p className="pf-header__sub hp-crumbs">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 && <span className="hp-crumbs__sep">{i === 1 ? "/" : "·"}</span>}
              {c.route ? (
                <button type="button" className="hp-crumbs__link" onClick={() => go(c.route)}>
                  {c.label}
                </button>
              ) : (
                <span>{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </p>
      </div>
      <button type="button" className="pf-square hp-more" aria-label="More options">
        <img className="mono" src={hicons.more} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

function Chevron() {
  return <img className="mono hp-chevron" src={hicons.chevron} alt="" width="16" height="16" />;
}

export function Badge({ tone, children }) {
  return <span className={`hp-badge is-${tone}`}>{children}</span>;
}

function AskNoaButton({ className = "" }) {
  return (
    <span className={`hp-noa-btn ${className}`}>
      <span className="hp-noa-btn__glow" aria-hidden="true" />
      <button type="button" className="ob-btn ob-btn--secondary" onClick={() => go("ai")}>
        Ask Noa
      </button>
    </span>
  );
}

function ChatButton({ className = "" }) {
  return (
    <button type="button" className={`btn-primary ob-btn ${className}`} onClick={() => go("help/chat")}>
      Chat with support
    </button>
  );
}

function SideArticles({ title, ids }) {
  return (
    <section className="hp-side hp-related">
      <h2 className="hp-related__title">{title}</h2>
      <ul className="hp-related__list">
        {ids.map((id) => {
          const x = articleById(id);
          return (
            <li key={id}>
              <button type="button" className="hp-related__item" onClick={() => go(`help/article/${id}`)}>
                <span className="hp-related__text">
                  <span className="hp-related__name">{x.title}</span>
                  <span className="hp-meta">{x.read} min read</span>
                </span>
                <Chevron />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DidntFind() {
  return (
    <section className="hp-side">
      <div className="hp-side__head">
        <h2 className="hp-side__title">Didn’t find it?</h2>
        <p className="hp-side__note">Ask Noa in plain words, or talk to our team.</p>
      </div>
      <div className="hp-stack-8">
        <AskNoaButton />
        <ChatButton />
      </div>
    </section>
  );
}

function RecentSearches() {
  return (
    <section className="hp-side hp-side--tight">
      <h2 className="hp-side__title">Recent searches</h2>
      <div className="hp-recent">
        {RECENT_SEARCHES.map((q) => (
          <button key={q} type="button" className="hp-recent__chip" onClick={() => go(searchRoute(q))}>
            <img className="mono" src={hicons.history} alt="" width="14" height="14" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SearchField({ value, onChange, onSubmit, onClear, placeholder, active, autoFocus, inputRef, shortcut }) {
  return (
    <form
      className={`hp-search${active ? " is-active" : ""}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <img className="mono" src={hicons.search} alt="" width="18" height="18" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      {shortcut && !value && <span className="hp-kbd">⌘ K</span>}
      {onClear && value && (
        <button type="button" className="hp-search__clear" aria-label="Clear search" onClick={onClear}>
          <img className="mono" src={hicons.close} alt="" width="24" height="24" />
        </button>
      )}
    </form>
  );
}

/* ───────────── Help & Docs home ───────────── */

function TopicCard({ topic }) {
  return (
    <button type="button" className="hp-topic" onClick={() => go(`help/topic/${topic.id}`)}>
      <span className="hp-topic__icon">
        <img src={topic.icon} alt="" width={topic.small ? 18 : 24} height={topic.small ? 18 : 24} />
      </span>
      <span className="hp-topic__text">
        <span className="hp-topic__title">{topic.title}</span>
        <span className="hp-topic__desc">{topic.desc}</span>
        <span className="hp-topic__count">{topic.count} articles</span>
      </span>
    </button>
  );
}

function ArticleRow({ id, meta }) {
  const x = articleById(id);
  return (
    <li className="hp-article-row">
      <button type="button" className="hp-article-row__btn" onClick={() => go(`help/article/${id}`)}>
        <img className="mono" src={hicons.article} alt="" width="24" height="24" />
        <span className="hp-article-row__text">
          <span className="hp-article-row__title">{x.title}</span>
          <span className="hp-meta">{meta ?? `${topicById(x.topic).title} · ${x.read} min read`}</span>
        </span>
        <Chevron />
      </button>
    </li>
  );
}

function ContactCard() {
  return (
    <section className="hp-side hp-contact">
      <div className="hp-contact__head">
        <div className="hp-side__row">
          <h2 className="hp-side__title">Contact support</h2>
          <Badge tone="green">Online</Badge>
        </div>
        <p className="hp-side__note">Average reply time: 4 minutes. Available 24/7 in English.</p>
      </div>
      <div className="hp-stack-8">
        <button type="button" className="btn-primary ob-btn hp-btn-40" onClick={() => go("help/chat")}>
          Chat with support
        </button>
        <a className="ob-btn ob-btn--secondary hp-btn-40" href="mailto:support@zentra.app">
          Email us
        </a>
      </div>
    </section>
  );
}

function AskNoaCard() {
  const [text, setText] = useState("");
  return (
    <section className="hp-noa">
      <span className="hp-noa__glow" aria-hidden="true" />
      <div className="hp-noa__card">
        <img className="hp-noa__grid" src={hicons.grid} alt="" />
        <img className="hp-noa__orb" src={hicons.orb} alt="" width="64" height="64" />
        <div className="hp-noa__body">
          <div className="hp-noa__text">
            <h2 className="hp-noa__title">Ask Noa</h2>
            <p className="hp-side__note">Instant answers about your account, fees and features.</p>
          </div>
          <form
            className="hp-noa__input"
            onSubmit={(e) => {
              e.preventDefault();
              go("ai");
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about fees, limits…" aria-label="Ask Noa" />
            <button type="button" className="hp-noa__mic" aria-label="Speak">
              <img className="mono" src={hicons.mic} alt="" width="20" height="20" />
            </button>
            <button type="submit" className="btn-primary hp-noa__send" aria-label="Send">
              <img src={hicons.northEast} alt="" width="20" height="20" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function StatusCard() {
  return (
    <section className="hp-side">
      <div className="hp-side__row">
        <h2 className="hp-side__title">System status</h2>
        <span className="hp-meta">Updated 1 min ago</span>
      </div>
      <div className="hp-stack-16">
        <ul className="hp-status">
          {SYSTEM_STATUS.map((s) => (
            <li key={s.label} className="hp-status__row">
              <img src={s.ok ? hicons.dotGreen : hicons.dotOrange} alt="" width="8" height="8" />
              <span className="hp-status__label">{s.label}</span>
              <span className={`hp-status__value${s.ok ? "" : " is-warn"}`}>{s.status}</span>
            </li>
          ))}
        </ul>
        <p className="hp-meta">Maintenance: Oct 22, 02:00 – 04:00 AM UTC</p>
      </div>
    </section>
  );
}

function TicketsCard() {
  return (
    <section className="hp-side hp-tickets">
      <div className="hp-tickets__head">
        <h2 className="hp-side__title">Your tickets</h2>
        <span className="hp-meta">1 open · 1 resolved</span>
      </div>
      <ul className="hp-tickets__list">
        {TICKETS.map((t) => (
          <li key={t.id}>
            <button type="button" className="hp-ticket" onClick={() => t.tone === "blue" && go("help/chat")}>
              <span className="hp-ticket__top">
                <span className="hp-meta">{t.id}</span>
                <Badge tone={t.tone}>{t.status}</Badge>
              </span>
              <span className="hp-ticket__title">{t.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HelpHome() {
  const [q, setQ] = useState("");
  const input = useRef(null);

  // ⌘K / Ctrl+K jumps to the search box, as its hint says.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Header title="Help & Docs" crumbs={[{ label: "Guides, answers and support — we usually reply in under 5 minutes." }]} />
      <div className="hp-row">
        <section className="hp-main">
          <div className="hp-hero">
            <h2 className="hp-hero__title">How can we help?</h2>
            <div className="hp-hero__body">
              <SearchField
                value={q}
                onChange={setQ}
                inputRef={input}
                shortcut
                placeholder="Search articles, e.g. “withdrawal limits”"
                onSubmit={(v) => v.trim() && go(searchRoute(v))}
              />
              <div className="hp-popular">
                <span className="hp-popular__label">Popular:</span>
                {POPULAR_SEARCHES.map((p) => (
                  <button key={p} type="button" className="hp-popular__chip" onClick={() => go(searchRoute(p))}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hp-block">
            <h2 className="hp-block__title">Browse topics</h2>
            <div className="hp-topics">
              {TOPICS.map((t) => (
                <TopicCard key={t.id} topic={t} />
              ))}
            </div>
          </div>

          <div className="hp-block">
            <div className="hp-block__head">
              <h2 className="hp-block__title">Popular articles</h2>
              <button type="button" className="hp-link" onClick={() => go("help/topic/deposits")}>
                View all
              </button>
            </div>
            <ul className="hp-popular-list">
              {POPULAR_ARTICLES.map((id) => (
                <ArticleRow key={id} id={id} />
              ))}
            </ul>
          </div>
        </section>
        <aside className="hp-aside">
          <ContactCard />
          <AskNoaCard />
          <StatusCard />
          <TicketsCard />
        </aside>
      </div>
    </>
  );
}

/* ───────────── H1 · Article ───────────── */

function HelpArticle({ id }) {
  const article = articleById(id);
  const topic = topicById(article.topic);
  // Only the pending-withdrawal guide has a full body; the rest open as a short summary.
  const body =
    article.id === "withdrawal-pending"
      ? ARTICLE_BODY
      : { intro: article.snippet.replace(/…$/, "."), sections: [], steps: [], warning: ARTICLE_BODY.warning, helpful: 38 };
  const [active, setActive] = useState(body.sections[0]?.id);
  const [vote, setVote] = useState(null);
  const refs = useRef({});

  useEffect(() => {
    if (!body.sections.length || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.dataset.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [body]);

  const jump = (sid) => {
    setActive(sid);
    refs.current[sid]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Header
        small
        title={article.title}
        crumbs={[
          { label: "Help & Docs", route: "help" },
          { label: topic.title, route: `help/topic/${topic.id}` },
          { label: `${article.read} min read` },
          { label: "Updated Oct 12, 2026" },
        ]}
      />
      <div className="hp-row">
        <section className="hp-main">
          <article className="hp-article">
            <div className="hp-article__content">
              <p className="hp-article__intro">{body.intro}</p>
              {body.sections.length > 0 && (
                <div className="hp-article__sections">
                  {body.sections.map((s, i) => (
                    <section key={s.id} className="hp-article__section" data-id={s.id} ref={(el) => (refs.current[s.id] = el)}>
                      <h2 className="hp-article__h">
                        {i + 1}. {s.title}
                      </h2>
                      <p className="hp-article__p">{s.text}</p>
                    </section>
                  ))}
                </div>
              )}
            </div>
            <div className="hp-article__notes">
              {body.steps.length > 0 && (
                <div className="hp-todo">
                  <h3 className="hp-todo__title">What you can do</h3>
                  <ol className="hp-todo__list">
                    {body.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              <p className="hp-warning">
                <img src={hicons.error} alt="" width="24" height="24" />
                <span>{body.warning}</span>
              </p>
            </div>
            <div className="hp-helpful">
              <span className="hp-helpful__q">{vote ? "Thanks for your feedback!" : "Was this article helpful?"}</span>
              {!vote && (
                <span className="hp-helpful__btns">
                  <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setVote("yes")}>
                    Yes
                  </button>
                  <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setVote("no")}>
                    No
                  </button>
                </span>
              )}
              <span className="hp-meta hp-helpful__count">
                {body.helpful + (vote === "yes" ? 1 : 0)} people found this helpful
              </span>
            </div>
          </article>
        </section>
        <aside className="hp-aside hp-aside--article">
          {body.sections.length > 0 && (
            <nav className="hp-side hp-toc" aria-label="On this page">
              <h2 className="hp-side__title">On this page</h2>
              <ul className="hp-toc__list">
                {body.sections.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`hp-toc__item${active === s.id ? " is-active" : ""}`}
                      aria-current={active === s.id ? "true" : undefined}
                      onClick={() => jump(s.id)}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <SideArticles title="Related articles" ids={RELATED.filter((x) => x !== article.id)} />
          <section className="hp-stuck">
            <img className="hp-stuck__bg" src="/assets/setup-bg.jpg" alt="" />
            <div className="hp-stuck__text">
              <h2 className="hp-stuck__title">Still stuck?</h2>
              <p className="hp-side__note">Our team replies in about 4 minutes, 24/7.</p>
            </div>
            <ChatButton className="hp-stuck__btn" />
          </section>
        </aside>
      </div>
    </>
  );
}

/* ───────────── H2 · Topic ───────────── */

function HelpTopic({ id }) {
  const topic = topicById(id);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState({});
  const groups = useMemo(() => {
    const list = ARTICLES.filter((x) => x.topic === topic.id);
    const names = [...new Set(list.map((x) => x.group))];
    const needle = q.trim().toLowerCase();
    return names
      .map((name) => ({
        name,
        total: GROUP_TOTALS[name] ?? list.filter((x) => x.group === name).length,
        items: list.filter((x) => x.group === name && (!needle || x.title.toLowerCase().includes(needle))),
      }))
      .filter((g) => g.items.length);
  }, [topic, q]);

  return (
    <>
      <Header
        title={topic.title}
        crumbs={[{ label: "Help & Docs", route: "help" }, { label: `${topic.count} articles` }, { label: topic.desc }]}
      />
      <div className="hp-row">
        <section className="hp-main hp-main--gap16">
          <SearchField value={q} onChange={setQ} placeholder={`Search in ${topic.title}`} onClear={() => setQ("")} />
          <div className="hp-groups">
            {groups.map((g) => {
              const preview = GROUP_PREVIEW[g.name] ?? 4;
              const shown = open[g.name] || q ? g.items : g.items.slice(0, preview);
              return (
                <div key={g.name} className="hp-group">
                  <div className="hp-group__head">
                    <h2 className="hp-block__title">{g.name}</h2>
                    {!q && g.items.length > 0 && (
                      <button type="button" className="hp-link" onClick={() => setOpen((o) => ({ ...o, [g.name]: !o[g.name] }))}>
                        {open[g.name] ? "Show less" : `View all ${g.total} articles`}
                      </button>
                    )}
                  </div>
                  <ul className="hp-group__list">
                    {shown.map((x) => (
                      <ArticleRow key={x.id} id={x.id} meta={`${x.read} min read${x.id === "withdrawal-pending" ? " · Most read" : ""}`} />
                    ))}
                  </ul>
                </div>
              );
            })}
            {groups.length === 0 && <p className="hp-empty-line">No articles in {topic.title} match “{q}”.</p>}
          </div>
        </section>
        <aside className="hp-aside">
          <section className="hp-side">
            <h2 className="hp-side__title">Most read this week</h2>
            <ol className="hp-mostread">
              {MOST_READ.map((mid, i) => {
                const x = articleById(mid);
                return (
                  <li key={mid}>
                    <button type="button" className="hp-mostread__item" onClick={() => go(`help/article/${mid}`)}>
                      <span className="hp-mostread__n">{i + 1}</span>
                      <span className="hp-related__text">
                        <span className="hp-article-row__title">{x.title}</span>
                        <span className="hp-meta">{x.views} views</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="hp-side">
            <p className="hp-alert">
              <img src={hicons.dotOrange} alt="" width="8" height="8" />
              <span>ETH withdrawals are delayed</span>
            </p>
            <div className="hp-stack-12">
              <p className="hp-side__note">Expected back to normal by 2:00 PM UTC. Other networks are working normally.</p>
              <button type="button" className="hp-link" onClick={() => go("help")}>
                View system status
              </button>
            </div>
          </section>
          <section className="hp-side">
            <h2 className="hp-side__title">Can’t find your answer?</h2>
            <div className="hp-stack-8">
              <AskNoaButton className="hp-btn-40" />
              <ChatButton className="hp-btn-40" />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

/* ───────────── H3 / H4 · Search results and no results ───────────── */

const TABS = ["All", "Articles", "Topics"];

function QuickAnswer() {
  return (
    <div className="hp-quick">
      <div className="hp-quick__answer">
        <div className="hp-quick__text">
          <p className="hp-quick__head">
            <img src={hicons.orb} alt="" width="32" height="32" />
            <span>Quick answer from Noa</span>
          </p>
          <p className="hp-quick__body">
            Level 2 accounts can withdraw up to $50,000 a day, and the limit resets at 00:00 UTC. You’ve used $8,046.83 today.
          </p>
        </div>
        <button type="button" className="hp-quick__source" onClick={() => go("help/article/withdrawal-limits")}>
          <img src={hicons.articleSm} alt="" width="16" height="16" />
          <span>Withdrawal limits by account level</span>
        </button>
      </div>
      <div className="hp-usage">
        <span className="hp-usage__label">Used today</span>
        <div className="hp-usage__body">
          <div className="hp-usage__amount">
            <span className="hp-usage__value">$8,046.83</span>
            <span className="hp-usage__of">of $50,000 daily limit</span>
          </div>
          <span className="hp-usage__bar">
            <span style={{ width: `${(8046.83 / 50000) * 100}%` }} />
          </span>
        </div>
        <span className="hp-meta">Resets at 00:00 UTC</span>
      </div>
    </div>
  );
}

function HelpSearch({ query }) {
  const [q, setQ] = useState(query);
  const [tab, setTab] = useState(TABS[0]);
  const input = useRef(null);
  useEffect(() => setQ(query), [query]);

  const articles = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/);
    const score = (x) => words.filter((w) => x.title.toLowerCase().includes(w)).length;
    return searchArticles(query).sort((a, b) => score(b) - score(a));
  }, [query]);
  const topics = useMemo(() => searchTopics(query), [query]);
  const total = articles.length + topics.length;
  const quick = /withdraw/i.test(query) && /limit/i.test(query);
  const clear = () => {
    setQ("");
    input.current?.focus();
  };

  return (
    <>
      <Header
        title="Search results"
        crumbs={[
          { label: "Help & Docs", route: "help" },
          { label: total ? `${total} result${total === 1 ? "" : "s"} for “${query}”` : `No results for “${query}”` },
        ]}
      />
      <div className="hp-row">
        <section className="hp-main hp-main--gap24">
          <SearchField
            active
            value={q}
            onChange={setQ}
            inputRef={input}
            placeholder="Search articles"
            onClear={clear}
            onSubmit={(v) => go(v.trim() ? searchRoute(v) : "help")}
          />
          {total > 0 ? (
            <div className="hp-results">
              <div className="mk-tabs hp-tabs" role="tablist" aria-label="Result types">
                {TABS.map((t) => {
                  const n = t === "All" ? total : t === "Articles" ? articles.length : topics.length;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={t === tab}
                      className={`hp-tab${t === tab ? " is-active" : ""}`}
                      onClick={() => setTab(t)}
                    >
                      {t} · {n}
                    </button>
                  );
                })}
              </div>
              <div className="hp-results__body">
                {quick && tab === "All" && <QuickAnswer />}
                {tab !== "Topics" && articles.length > 0 && (
                  <ul className="hp-hits">
                    {articles.map((x) => (
                      <li key={x.id}>
                        <button type="button" className="hp-hit" onClick={() => go(`help/article/${x.id}`)}>
                          <span className="hp-hit__topic">{topicById(x.topic).title}</span>
                          <span className="hp-hit__text">
                            <span className="hp-hit__title">{x.title}</span>
                            <span className="hp-hit__snippet">{x.snippet}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {tab !== "Articles" && topics.length > 0 && (
                  <div className="hp-topics hp-topics--hits">
                    {topics.map((t) => (
                      <TopicCard key={t.id} topic={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hp-empty">
              <div className="hp-empty__top">
                <div className="hp-empty__hero">
                  <span className="hp-empty__icon">
                    <img className="mono" src={hicons.searchOff} alt="" width="32" height="32" />
                  </span>
                  <div className="hp-empty__text">
                    <h2 className="hp-empty__title">No articles match “{query}”</h2>
                    <p className="hp-empty__sub">Check the spelling or try fewer, different words.</p>
                  </div>
                </div>
                <div className="hp-empty__tips">
                  <ul className="hp-empty__list">
                    <li>• Check the spelling</li>
                    <li>• Try fewer or different words</li>
                    <li>• Or browse a topic below</li>
                  </ul>
                  <div className="hp-empty__topics">
                    {["staking", "trading", "security"].map((tid) => (
                      <button key={tid} type="button" className="hp-empty__topic" onClick={() => go(`help/topic/${tid}`)}>
                        {topicById(tid).title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hp-empty__still">
                <p className="hp-meta">Still can’t find it?</p>
                <div className="hp-empty__actions">
                  <AskNoaButton />
                  <ChatButton />
                </div>
              </div>
            </div>
          )}
        </section>
        <aside className="hp-aside">
          <DidntFind />
          <RecentSearches />
        </aside>
      </div>
    </>
  );
}

/* ───────────── H5 · Support chat ───────────── */

function Avatar({ size = 32 }) {
  return (
    <span className="hp-avatar" style={{ width: size, height: size }}>
      MS
    </span>
  );
}

function HelpChat() {
  const [messages, setMessages] = useState(CHAT);
  const [typing, setTyping] = useState(true);
  const [text, setText] = useState("");
  const [ended, setEnded] = useState(false);
  const thread = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    // The agent's pending reply lands a moment after the page opens.
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "agent", text: "You’re welcome! Anything else I can help with?" }]);
    }, 2400);
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    const v = text.trim();
    if (!v || ended) return;
    setText("");
    setMessages((m) => [...m, { from: "me", text: v }]);
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "agent", text: "Got it — I’ve added that to ticket #ZX-4821. I’ll update you here." }]);
    }, 1800);
  };

  // An agent bubble shows the avatar only when the next message isn't also from the agent.
  const showAvatar = (i) => messages[i].from === "agent" && (messages[i + 1]?.from !== "agent" || (i === messages.length - 1 && !typing));

  return (
    <>
      <Header
        title="Support chat"
        crumbs={[{ label: "Help & Docs", route: "help" }, { label: "Ticket #ZX-4821" }, { label: "Withdrawal pending" }]}
      />
      <div className="hp-row">
        <section className="hp-chat">
          <div className="hp-chat__agent">
            <Avatar size={48} />
            <span className="hp-chat__who">
              <span className="hp-chat__name">Maya S. · Zentra Support</span>
              <span className="hp-chat__sub">Usually replies in 4 minutes</span>
            </span>
            <Badge tone="green">Online</Badge>
          </div>
          <div className="hp-chat__body">
            <div className="hp-chat__thread" ref={thread}>
              <p className="hp-chat__system">
                <span>Chat started · Oct 19, 2026 · 11:02 AM</span>
              </p>
              <div className="hp-chat__context">
                <span className="hp-chat__coin">
                  <img src={hicons.eth} alt="" width="24" height="24" />
                </span>
                <span className="hp-chat__ctx-text">
                  <span className="hp-chat__ctx-title">Withdrawal · 2.5 ETH</span>
                  <span className="hp-meta">Ticket #ZX-4821 · Oct 18, 06:32 PM</span>
                </span>
                <Badge tone={ended ? "green" : "orange"}>{ended ? "Completed" : "Pending"}</Badge>
              </div>
              {messages.map((m, i) =>
                m.from === "me" ? (
                  <div key={i} className="hp-msg is-me">
                    <p className="hp-bubble is-me">{m.text}</p>
                  </div>
                ) : (
                  <div key={i} className="hp-msg is-agent">
                    <span className="hp-msg__avatar">{showAvatar(i) && <Avatar />}</span>
                    {m.status ? (
                      <div className="hp-status-card">
                        <span className="hp-status-card__check">
                          <img src={hicons.check} alt="" width="14" height="14" />
                        </span>
                        <span className="hp-status-card__text">
                          <span className="hp-status-card__title">{m.status.title}</span>
                          <span className="hp-chat__sub">{m.status.sub}</span>
                        </span>
                      </div>
                    ) : (
                      <p className="hp-bubble">{m.text}</p>
                    )}
                  </div>
                ),
              )}
              {typing && (
                <div className="hp-msg is-agent hp-typing">
                  <span className="hp-msg__avatar">
                    <Avatar />
                  </span>
                  <span className="hp-typing__dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="hp-meta">Maya is typing…</span>
                </div>
              )}
              {ended && <p className="hp-chat__system"><span>Chat ended · ticket closed</span></p>}
            </div>
            <form
              className="hp-composer"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <button type="button" className="hp-composer__add" aria-label="Attach a file">
                <img className="mono" src={hicons.add} alt="" width="20" height="20" />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={ended ? "This chat has ended" : "Write a message…"}
                aria-label="Write a message"
                disabled={ended}
              />
              <button type="submit" className="hp-composer__send" aria-label="Send" disabled={ended}>
                <img src={hicons.send} alt="" width="18" height="18" />
              </button>
            </form>
          </div>
        </section>
        <aside className="hp-aside">
          <section className="hp-side">
            <div className="hp-side__row">
              <h2 className="hp-side__title">Ticket #ZX-4821</h2>
              <Badge tone={ended ? "green" : "blue"}>{ended ? "Resolved" : "In progress"}</Badge>
            </div>
            <dl className="hp-ticket-info">
              {TICKET_DETAIL.map(([k, v]) => (
                <div key={k} className="hp-ticket-info__row">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <SideArticles title="Helpful articles" ids={["withdrawal-pending", "new-address"]} />
          <section className="hp-side hp-side--gap12">
            <h2 className="hp-side__title">{ended ? "Thanks for chatting" : "Done?"}</h2>
            <p className="hp-side__note">
              {ended ? "The ticket is closed. You can reopen it within 7 days." : "Ending the chat closes the ticket. You can reopen it within 7 days."}
            </p>
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setEnded((x) => !x)}>
              {ended ? "Reopen ticket" : "End chat & rate"}
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}

/* ───────────── Router ───────────── */

export default function Help({ sub = "" }) {
  const [view, ...rest] = sub.split("/");
  const id = decodeURIComponent(rest.join("/"));
  let screen;
  if (view === "article") screen = <HelpArticle key={id} id={id} />;
  else if (view === "topic") screen = <HelpTopic key={id} id={id} />;
  else if (view === "search" && id.trim()) screen = <HelpSearch query={id} />;
  else if (view === "chat") screen = <HelpChat />;
  else screen = <HelpHome />;
  return <main className={`portfolio help help--${view || "home"}`}>{screen}</main>;
}
