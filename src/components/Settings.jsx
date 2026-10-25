import React, { useEffect, useRef, useState } from "react";
import "../styles/settings.css";
import Modal, { CloseButton } from "./Modal";
import { Header, Badge } from "./Help";
import {
  sicons,
  TABS,
  PROFILE,
  LANGUAGES,
  CURRENCIES,
  TIMEZONES,
  DEVICES,
  ACTIVITY,
  NOA_ACCESS,
  NOA_PERMISSIONS,
  NOA_PROMISES,
  API_KEYS,
  KEY_SAFETY,
  PERMISSIONS,
  NOTIFICATIONS,
  LINKED,
  hasPasskey,
  savePasskey,
} from "../settingsData";

const go = (route) => {
  window.location.hash = `#/${route}`;
};
const tabRoute = (t) => (t.route ? `settings/${t.route}` : "settings");

export function settingsBack(sub) {
  return sub ? { label: "Settings", route: "settings" } : null;
}

export function settingsTitle(sub) {
  const tab = TABS.find((t) => t.route === sub.split("/")[0]);
  return tab && tab.route ? tab.label : "Settings";
}

/* ───────────── Small controls ───────────── */

export function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`sg-toggle${on ? " is-on" : ""}`} onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}

export function Segmented({ options, value, onChange, label, className = "" }) {
  return (
    <div className={`sg-seg ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={o === value} className={`sg-seg__item${o === value ? " is-active" : ""}`} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="sg-field">
      <span className="sg-field__label">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, options, onChange }) {
  return (
    <span className="sg-input sg-select">
      <span className="sg-input__value">{value}</span>
      <img className="mono" src={sicons.chevron} alt="" width="16" height="16" />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </span>
  );
}

function Check({ tone = "green", children }) {
  return (
    <li className="sg-check">
      <span className={`sg-check__mark is-${tone}`}>
        <img src={tone === "green" ? sicons.check : tone === "orange" ? sicons.add : sicons.error} alt="" width="14" height="14" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function Side({ title, extra, children, className = "" }) {
  return (
    <section className={`hp-side sg-side ${className}`}>
      {(title || extra) && (
        <div className="hp-side__row">
          {title && <h2 className="hp-side__title">{title}</h2>}
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}

function IconRow({ icon, title, sub, children, iconClass = "mono" }) {
  return (
    <div className="sg-irow">
      <span className="sg-irow__icon">
        <img className={iconClass} src={icon} alt="" width="20" height="20" />
      </span>
      <span className="sg-irow__text">
        <span className="sg-irow__title">{title}</span>
        <span className="sg-irow__sub">{sub}</span>
      </span>
      {children}
    </div>
  );
}

/* ───────────── Profile ───────────── */

function ThemeField({ theme, setTheme }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("zentra-theme-mode") || (theme === "dark" ? "Dark" : "Light");
    } catch {
      return theme === "dark" ? "Dark" : "Light";
    }
  });
  const pick = (m) => {
    setMode(m);
    try {
      localStorage.setItem("zentra-theme-mode", m);
    } catch {
      /* storage unavailable */
    }
    const dark = m === "Dark" || (m === "System" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    setTheme(dark ? "dark" : "light");
  };
  // The sidebar switch can change the theme too; keep the control in step.
  useEffect(() => {
    if (mode !== "System") setMode(theme === "dark" ? "Dark" : "Light");
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="sg-field">
      <span className="sg-field__label">Theme</span>
      <Segmented options={["Light", "Dark", "System"]} value={mode} onChange={pick} label="Theme" className="sg-seg--field" />
    </div>
  );
}

function PreferenceFields({ theme, setTheme }) {
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [cur, setCur] = useState(CURRENCIES[0]);
  const [tz, setTz] = useState(TIMEZONES[0]);
  return (
    <div className="sg-grid">
      <Field label="Language">
        <Select value={lang} options={LANGUAGES} onChange={setLang} />
      </Field>
      <Field label="Display currency">
        <Select value={cur} options={CURRENCIES} onChange={setCur} />
      </Field>
      <Field label="Time zone">
        <Select value={tz} options={TIMEZONES} onChange={setTz} />
      </Field>
      <ThemeField theme={theme} setTheme={setTheme} />
    </div>
  );
}

function ProfilePanel({ theme, setTheme }) {
  const [form, setForm] = useState({ name: PROFILE.name, display: PROFILE.display });
  const [photo, setPhoto] = useState(null);
  const [saved, setSaved] = useState(false);
  const file = useRef(null);
  const dirty = form.name !== PROFILE.name || form.display !== PROFILE.display || photo;

  useEffect(() => () => photo && URL.revokeObjectURL(photo), [photo]);

  const save = () => {
    PROFILE.name = form.name;
    PROFILE.display = form.display;
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="sg-panel sg-profile">
      <div className="sg-profile__head">
        <img className="sg-avatar" src={photo || sicons.avatar} alt="" width="64" height="64" />
        <div className="sg-profile__who">
          <span className="sg-profile__name">{form.name || PROFILE.name}</span>
          <span className="sg-profile__meta">
            <span>{PROFILE.since}</span>
            <Badge tone="green">Verified · Level 2</Badge>
          </span>
        </div>
        <button type="button" className="ob-btn ob-btn--secondary sg-photo-btn" onClick={() => file.current?.click()}>
          Change photo
        </button>
        <input
          ref={file}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && setPhoto(URL.createObjectURL(e.target.files[0]))}
        />
      </div>
      <hr className="sg-divider" />
      <h2 className="sg-h">Personal info</h2>
      <div className="sg-grid">
        <Field label="Full name">
          <input className="sg-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Display name">
          <input className="sg-input" value={form.display} onChange={(e) => setForm({ ...form, display: e.target.value })} />
        </Field>
        <Field label="Email">
          <span className="sg-input">
            <span className="sg-input__value">{PROFILE.email}</span>
            <span className="sg-verified">Verified</span>
          </span>
        </Field>
        <Field label="Phone">
          <span className="sg-input">
            <span className="sg-input__value">{PROFILE.phone}</span>
            <span className="sg-verified">Verified</span>
          </span>
        </Field>
      </div>
      <hr className="sg-divider" />
      <h2 className="sg-h">Preferences</h2>
      <PreferenceFields theme={theme} setTheme={setTheme} />
      <div className="sg-actions">
        <button
          type="button"
          className="ob-btn ob-btn--secondary"
          disabled={!dirty}
          onClick={() => {
            setForm({ name: PROFILE.name, display: PROFILE.display });
            setPhoto(null);
          }}
        >
          Discard
        </button>
        <button type="button" className="btn-primary ob-btn" onClick={save}>
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function ProfileAside() {
  const passkey = hasPasskey();
  return (
    <>
      <Side title="Account level" extra={<Badge tone="purple">Level 2</Badge>}>
        <div className="sg-level">
          <div className="hp-ticket-info__row">
            <dt>Daily withdrawal limit</dt>
            <dd>$50,000.00</dd>
          </div>
          <span className="sg-level__bar">
            <span style={{ width: "16%" }} />
          </span>
          <span className="hp-meta">$8,046.83 used today · resets at 00:00 UTC</span>
        </div>
        <button type="button" className="ob-btn ob-btn--secondary hp-btn-40" onClick={() => go("help/article/raise-limit")}>
          Raise my limit
        </button>
      </Side>
      <Side title="Security check" extra={<span className={`sg-count${passkey ? " is-done" : ""}`}>{passkey ? "4 of 4" : "3 of 4"}</span>}>
        <ul className="sg-checks">
          <Check>Two-factor authentication</Check>
          <Check>Email verified</Check>
          <Check>Withdrawal allowlist</Check>
          {passkey ? <Check>Passkey added</Check> : <Check tone="orange">Add a passkey</Check>}
        </ul>
        {!passkey && (
          <button type="button" className="btn-primary ob-btn hp-btn-40" onClick={() => go("settings/security/passkey")}>
            Add a passkey
          </button>
        )}
      </Side>
      <Devices />
    </>
  );
}

function Devices() {
  const [list, setList] = useState(DEVICES);
  return (
    <Side title="Signed-in devices">
      <div className="sg-devices">
        <ul className="sg-devices__list">
          {list.map((d) => (
            <li key={d.name} className="sg-device">
              <span className="hp-related__text">
                <span className="hp-article-row__title">{d.name}</span>
                <span className="hp-meta">{d.meta}</span>
              </span>
              {d.current ? (
                <Badge tone="green">Current</Badge>
              ) : (
                <button type="button" className="sg-danger-link sg-danger-link--sm" onClick={() => setList((l) => l.filter((x) => x !== d))}>
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
        {list.length > 1 && (
          <button type="button" className="sg-danger-link" onClick={() => setList((l) => l.filter((x) => x.current))}>
            Sign out of all other devices
          </button>
        )}
      </div>
    </Side>
  );
}

/* ───────────── S1 / S1b / S2 · Security ───────────── */

function SecurityPanel({ passkey, onAdd, onRemove }) {
  const [allow, setAllow] = useState(true);
  const [hold, setHold] = useState(true);
  const score = passkey ? 100 : 75;
  const steps = [
    { label: "2FA", done: true },
    { label: "Email", done: true },
    { label: passkey ? "Withdrawal allowlist" : "Withdrawal list", done: true },
    { label: "Passkey", done: passkey },
  ];
  return (
    <div className="sg-panel sg-security">
      <div className={`sg-score${passkey ? " is-full" : ""}`}>
        <div className="sg-score__top">
          <div className="sg-score__hero">
            <span className="sg-score__label">Security score</span>
            <span className="sg-score__value">
              <span className="sg-score__pct">{score}%</span>
              <span className="sg-score__pill">{passkey ? "Fully protected" : "Well protected"}</span>
            </span>
            {!passkey && <span className="sg-score__note">One step left to make your account phishing-proof.</span>}
          </div>
          {passkey && <span className="sg-score__label">Reviewed today</span>}
        </div>
        <ol className="sg-score__steps">
          {steps.map((s) => (
            <li key={s.label} className={s.done ? "is-done" : ""}>
              <span className="sg-score__seg" />
              <span className="sg-score__step">
                {s.done && <img src={sicons.checkWhite} alt="" width="14" height="14" />}
                {s.label}
              </span>
            </li>
          ))}
        </ol>
        {!passkey && (
          <div className="sg-next">
            <span className="sg-next__icon">
              <img src={sicons.passkey} alt="" width="20" height="20" />
            </span>
            <span className="sg-next__text">
              <span className="sg-next__title">
                Add a passkey <Badge tone="green">+25%</Badge>
              </span>
              <span className="sg-irow__sub">Takes 1 minute · sign in with Touch ID, can’t be phished</span>
            </span>
            <button type="button" className="btn-primary ob-btn sg-next__btn" onClick={onAdd}>
              Add passkey
            </button>
          </div>
        )}
      </div>

      <section className="sg-section">
        <h2 className="sg-section__title">Sign-in</h2>
        <div className="sg-rows">
          <IconRow icon={sicons.lock} title="Password" sub="Last changed Jul 02, 2026">
            <button type="button" className="ob-btn ob-btn--secondary sg-row-btn">
              Change
            </button>
          </IconRow>
          <IconRow icon={sicons.encrypted} title="Two-factor authentication" sub="Authenticator app">
            <span className="sg-on">On</span>
            <button type="button" className="ob-btn ob-btn--secondary sg-row-btn">
              Manage
            </button>
          </IconRow>
          <IconRow
            icon={sicons.passkey}
            iconClass="mono sg-gray-icon"
            title="Passkey"
            sub={passkey ? "MacBook Pro · Chrome · added today" : "Fingerprint, face or device PIN — can’t be phished"}
          >
            {passkey ? (
              <>
                <span className="sg-on">On</span>
                <button type="button" className="ob-btn ob-btn--secondary sg-row-btn" onClick={onRemove}>
                  Remove
                </button>
              </>
            ) : (
              <>
                <Badge tone="orange">Not set up</Badge>
                <button type="button" className="btn-primary ob-btn sg-row-btn" onClick={onAdd}>
                  Add
                </button>
              </>
            )}
          </IconRow>
        </div>
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Withdrawals</h2>
        <div className="sg-rows">
          <IconRow icon={sicons.shield} title="Withdrawal allowlist" sub="Only send to your 3 saved addresses">
            <Toggle on={allow} onChange={setAllow} label="Withdrawal allowlist" />
          </IconRow>
          <IconRow icon={sicons.schedule} title="24-hour hold on new addresses" sub="New addresses can be used one day after you add them">
            <Toggle on={hold} onChange={setHold} label="24-hour hold on new addresses" />
          </IconRow>
          <IconRow icon={sicons.ticket} title="Anti-phishing code" sub="Shown in every real email from Zentra: “OCEAN-42”">
            <button type="button" className="ob-btn ob-btn--secondary sg-row-btn">
              Change
            </button>
          </IconRow>
        </div>
      </section>
    </div>
  );
}

function SecurityAside() {
  const [frozen, setFrozen] = useState(false);
  return (
    <>
      <Side title="Recent security activity">
        <div className="sg-stack-12">
          <ul className="sg-timeline">
            {ACTIVITY.map((x) => (
              <li key={x.title}>
                <img src={x.warn ? sicons.dotOrange : sicons.dotGreen} alt="" width="8" height="8" />
                <span className="hp-related__text">
                  <span className="sg-timeline__title">{x.title}</span>
                  <span className="hp-meta">{x.meta}</span>
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="hp-link">
            Not you? Review this device
          </button>
        </div>
      </Side>
      <Side>
        <div className="hp-side__head">
          <h2 className="hp-side__title">{frozen ? "Account frozen" : "Lost your phone?"}</h2>
          <p className="sg-muted">
            {frozen ? "Trading and withdrawals are paused. Unfreezing needs ID verification." : "Freeze trading and withdrawals instantly. Unfreezing needs ID verification."}
          </p>
        </div>
        <button type="button" className={`ob-btn hp-btn-40 ${frozen ? "ob-btn--secondary" : "sg-btn-danger"}`} onClick={() => setFrozen((f) => !f)}>
          {frozen ? "Start unfreezing" : "Freeze my account"}
        </button>
      </Side>
    </>
  );
}

function PasskeyModal({ onClose, onDone }) {
  const [name, setName] = useState("MacBook Pro · Chrome");
  const [busy, setBusy] = useState(false);
  const add = () => {
    setBusy(true);
    // Stands in for the browser's Touch ID prompt.
    setTimeout(() => {
      savePasskey(true);
      onDone();
    }, 900);
  };
  return (
    <Modal onClose={onClose} labelledBy="sg-passkey-title" width={424}>
      <div className="sg-modal sg-modal--passkey">
        <div className="sg-modal__body">
          <div className="sg-modal__top">
            <span className="sg-modal__icon">
              <img src={sicons.passkey} alt="" width="32" height="32" />
            </span>
            <div className="sg-modal__text">
              <h2 id="sg-passkey-title" className="sg-modal__title">
                Add a passkey
              </h2>
              <p className="sg-modal__sub">Sign in with your fingerprint, face or device PIN. No password to steal, and it can’t be phished.</p>
            </div>
          </div>
          <ul className="sg-benefits">
            {["Works on this device and syncs with your iCloud Keychain", "Your 2FA app still works as a backup", "You can remove it any time in Security"].map((b) => (
              <li key={b}>
                <span className="sg-check__mark is-green sg-check__mark--24">
                  <img src={sicons.check} alt="" width="14" height="14" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <label className="sg-field sg-field--modal">
            <span className="sg-field__label">Name this passkey</span>
            <input className="sg-input sg-input--sunk" value={name} onChange={(e) => setName(e.target.value)} />
            <span className="hp-meta">So you can tell your passkeys apart later</span>
          </label>
        </div>
        <div className="sg-modal__actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={onClose}>
            Not now
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={add} disabled={busy || !name.trim()}>
            {busy ? "Waiting for Touch ID…" : "Continue with Touch ID"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── S3 · AI & privacy ───────────── */

function AiPanel() {
  const [perms, setPerms] = useState(() => Object.fromEntries(NOA_PERMISSIONS.map((p) => [p.key, p.on])));
  const [keep, setKeep] = useState("90 days");
  const [chats, setChats] = useState(24);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="sg-panel sg-ai">
      <section className="sg-section">
        <h2 className="sg-h sg-h--muted">What Noa can see</h2>
        <ul className="sg-list">
          {NOA_PERMISSIONS.map((p) => (
            <li key={p.key} className="sg-list__row">
              <span className="sg-irow__text">
                <span className="sg-irow__title">{p.title}</span>
                <span className="sg-irow__sub">{p.sub}</span>
              </span>
              <Toggle on={perms[p.key]} onChange={(v) => setPerms({ ...perms, [p.key]: v })} label={p.title} />
            </li>
          ))}
        </ul>
      </section>
      <section className="sg-section">
        <h2 className="sg-h sg-h--muted">Chat history</h2>
        <ul className="sg-list sg-list--loose">
          <li className="sg-list__row">
            <span className="sg-irow__text">
              <span className="sg-irow__title">Keep chats for</span>
              <span className="sg-irow__sub">Older chats are deleted automatically</span>
            </span>
            <Segmented options={["30 days", "90 days", "Forever"]} value={keep} onChange={setKeep} label="Keep chats for" className="sg-seg--keep" />
          </li>
          <li className="sg-list__row">
            <span className="sg-irow__text">
              <span className="sg-irow__title">Your AI data</span>
              <span className="sg-irow__sub">{chats ? `${chats} chats · 3 shared files` : "No chats saved"}</span>
            </span>
            <span className="sg-data-btns">
              <button type="button" className="ob-btn ob-btn--secondary hp-btn-40" disabled={!chats}>
                Download
              </button>
              {confirm ? (
                <button
                  type="button"
                  className="ob-btn sg-btn-danger hp-btn-40"
                  onClick={() => {
                    setChats(0);
                    setConfirm(false);
                  }}
                >
                  Yes, delete all
                </button>
              ) : (
                <button type="button" className="ob-btn sg-btn-danger hp-btn-40" disabled={!chats} onClick={() => setConfirm(true)}>
                  Delete all chats
                </button>
              )}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function AiAside() {
  return (
    <>
      <Side title="Recent Noa access">
        <ul className="sg-timeline sg-timeline--purple">
          {NOA_ACCESS.map((x) => (
            <li key={x.title}>
              <span className="sg-dot" />
              <span className="hp-related__text">
                <span className="sg-timeline__title">{x.title}</span>
                <span className="hp-meta">{x.meta}</span>
              </span>
            </li>
          ))}
        </ul>
      </Side>
      <Side title="How Noa uses your data">
        <div className="sg-stack-12">
          <ul className="sg-promises">
            {NOA_PROMISES.map((p) => (
              <li key={p}>
                <img src={sicons.check} alt="" width="14" height="14" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="hp-link" onClick={() => go("help/topic/security")}>
            Read the full article
          </button>
        </div>
      </Side>
    </>
  );
}

/* ───────────── S4 / S5 / S6 · API keys ───────────── */

function KeyCard({ k, onEdit, onDelete, onFix }) {
  const risky = k.unused;
  const open = !k.ips;
  return (
    <article className={`sg-key${risky || open ? " is-flagged" : ""}`}>
      <div className="sg-key__top">
        <div className="sg-key__head">
          <span className="sg-key__icon">
            <img src={sicons.key} alt="" width="24" height="24" />
          </span>
          <span className="sg-key__id">
            <span className="sg-key__name">{k.name}</span>
            <code className="sg-key__code">{k.key}</code>
          </span>
        </div>
        <div className="sg-key__chips">
          {k.perms.map((p) => (
            <span key={p} className={`sg-chip${p === "Trade" ? " is-purple" : p === "Withdraw" ? " is-red" : ""}`}>
              {p}
            </span>
          ))}
          {risky ? (
            <span className="sg-chip is-red">Unused {k.unused} days</span>
          ) : k.ips ? (
            <span className="sg-chip is-green">
              {k.ips} IP address{k.ips === 1 ? "" : "es"}
            </span>
          ) : (
            <span className="sg-chip is-orange">No IP limit</span>
          )}
        </div>
        {(risky || open) && (
          <p className={`sg-tip${risky ? " is-red" : ""}`}>
            <img src={risky ? sicons.errorRed : sicons.error} alt="" width="16" height="16" />
            <span>{risky ? "Delete it — unused keys are a risk" : "Add an IP allowlist"}</span>
            <button type="button" className={risky ? "sg-danger-link sg-danger-link--sm" : "hp-link sg-tip__fix"} onClick={risky ? onDelete : onFix}>
              {risky ? "Delete" : "Fix"}
            </button>
          </p>
        )}
      </div>
      <div className="sg-key__foot">
        <span className="sg-key__meta">
          {k.used} · {k.created}
        </span>
        <button type="button" className="hp-link" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="sg-danger-link" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

function KeyModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name ?? "Portfolio dashboard");
  const [perms, setPerms] = useState(initial?.perms ?? ["Read"]);
  const [ips, setIps] = useState(initial ? (initial.ips ? "203.0.113.24, 198.51.100.7".split(", ").slice(0, initial.ips).join(", ") : "") : "203.0.113.24");
  const [expiry, setExpiry] = useState("90 days");
  const hasIps = ips.trim().length > 0;
  const toggle = (p) => setPerms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));
  useEffect(() => {
    if (!hasIps) setPerms((list) => list.filter((x) => x !== "Withdraw"));
  }, [hasIps]);

  return (
    <Modal onClose={onClose} labelledBy="sg-key-title">
      <form
        className="sg-modal sg-modal--key"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && perms.length) onSave({ name: name.trim(), perms, ips: hasIps ? ips.split(",").filter((x) => x.trim()).length : 0, expiry });
        }}
      >
        <div className="sg-modal__head">
          <div className="sg-modal__text sg-modal__text--left">
            <h2 id="sg-key-title" className="sg-modal__title">
              {initial ? "Edit API key" : "Create API key"}
            </h2>
            <p className="sg-modal__sub">{initial ? "Change what this key can do" : "Step 1 of 2 · Choose what this key can do"}</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="sg-modal__groups">
          <div className="sg-modal__group">
            <label className="sg-field sg-field--modal">
              <span className="sg-field__label">Name</span>
              <input className="sg-input sg-input--sunk" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <div className="sg-field sg-field--modal">
              <span className="sg-field__label">Permissions</span>
              <div className="sg-perms">
                {PERMISSIONS.map((p) => {
                  const locked = p.key === "Withdraw" && !hasIps;
                  const on = perms.includes(p.key);
                  return (
                    <label key={p.key} className={`sg-perm${locked ? " is-locked" : ""}`}>
                      <input type="checkbox" checked={on} disabled={locked} onChange={() => toggle(p.key)} />
                      <span className={`sg-box${on ? " is-on" : ""}`}>
                        {locked ? <img className="mono" src={sicons.lock} alt="" width="14" height="14" /> : on && <img src={sicons.checkWhite} alt="" width="14" height="14" />}
                      </span>
                      <span className="sg-irow__text">
                        <span className="sg-irow__title">{p.key}</span>
                        <span className="hp-meta">{locked ? p.sub : p.key === "Withdraw" ? "Send funds to allowlisted addresses" : p.sub}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="sg-modal__group">
            <label className="sg-field sg-field--modal">
              <span className="sg-field__label">IP allowlist (recommended)</span>
              <input className="sg-input sg-input--sunk" value={ips} onChange={(e) => setIps(e.target.value)} placeholder="e.g. 203.0.113.24" />
              <span className="hp-meta">Separate with commas. Leave empty to allow any IP — not recommended.</span>
            </label>
            <div className="sg-field sg-field--modal">
              <span className="sg-field__label">Expires after</span>
              <Segmented options={["30 days", "90 days", "Never"]} value={expiry} onChange={setExpiry} label="Expires after" className="sg-seg--wide" />
            </div>
          </div>
        </div>
        <div className="sg-modal__actions sg-modal__actions--split">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary ob-btn" disabled={!name.trim() || !perms.length}>
            {initial ? "Save changes" : "Create key"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CopyButton({ text, label }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="sg-round"
      aria-label={done ? "Copied" : label}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
    >
      <img src={done ? sicons.check : sicons.copy} alt="" width="18" height="18" />
    </button>
  );
}

function CreatedModal({ created, onClose }) {
  const [shown, setShown] = useState(false);
  const [saved, setSaved] = useState(false);
  const secret = "zx_sec_9Hq2f81cB7e04aD3Lk7P";
  const masked = "zx_sec_9Hq2 •••• •••• •••• Lk7P";
  const scope = created.perms.length === 1 ? `${created.perms[0]} only` : created.perms.join(" + ");
  return (
    <Modal onClose={() => saved && onClose()} labelledBy="sg-created-title">
      <div className="sg-modal sg-modal--created">
        <div className="sg-modal__top">
          <span className="sg-modal__icon is-green">
            <img src={sicons.checkWhite} alt="" width="32" height="32" />
          </span>
          <div className="sg-modal__text">
            <h2 id="sg-created-title" className="sg-modal__title sg-modal__title--20">
              Key created — copy your secret now
            </h2>
            <p className="sg-modal__sub sg-modal__sub--13">
              {created.name} · {scope} · Expires {created.expiry === "Never" ? "never" : created.expiry === "30 days" ? "Nov 18, 2026" : "Jan 17, 2027"}
            </p>
          </div>
        </div>
        <div className="sg-modal__body">
          <p className="sg-warn">
            <img src={sicons.error} alt="" width="24" height="24" />
            <span>This is the only time we’ll show the secret. If you lose it, create a new key.</span>
          </p>
          <div className="sg-secrets">
            <div className="sg-secret">
              <span className="sg-irow__text">
                <span className="sg-irow__sub">API key</span>
                <code className="sg-secret__value">zx_live_5d2e7a1f90c4b3e8</code>
              </span>
              <CopyButton text="zx_live_5d2e7a1f90c4b3e8" label="Copy API key" />
            </div>
            <div className="sg-secret">
              <span className="sg-irow__text">
                <span className="sg-irow__sub">Secret key</span>
                <code className="sg-secret__value">{shown ? secret : masked}</code>
              </span>
              <button type="button" className="sg-round" aria-label={shown ? "Hide secret" : "Show secret"} aria-pressed={shown} onClick={() => setShown((s) => !s)}>
                <img className="mono" src={sicons.eye} alt="" width="18" height="18" />
              </button>
              <CopyButton text={secret} label="Copy secret key" />
            </div>
          </div>
        </div>
        <div className="sg-modal__foot">
          <label className="sg-confirm">
            <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
            <span className={`sg-box sg-box--24${saved ? " is-on" : ""}`}>{saved && <img src={sicons.checkWhite} alt="" width="14" height="14" />}</span>
            <span>I’ve saved my secret somewhere safe</span>
          </label>
          <button type="button" className="btn-primary ob-btn" disabled={!saved} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ApiPanel({ sub }) {
  const [keys, setKeys] = useState(API_KEYS);
  const [editing, setEditing] = useState(null);
  const [created, setCreated] = useState(null);
  const creating = sub === "api/new";
  const close = () => {
    setEditing(null);
    if (creating) go("settings/api");
  };

  const save = (data) => {
    if (editing) {
      setKeys((list) => list.map((k) => (k.id === editing.id ? { ...k, ...data, unused: 0 } : k)));
      setEditing(null);
      return;
    }
    const key = {
      id: `k${Date.now()}`,
      key: "zx_live_5d2e…b3e8",
      used: "Never used",
      created: "Created Oct 19, 2026",
      ...data,
    };
    setKeys((list) => [key, ...list]);
    setCreated(key);
    go("settings/api");
  };

  return (
    <div className="sg-panel sg-api">
      <div className="sg-api__intro">
        <div className="sg-api__head">
          <span className="sg-irow__text">
            <span className="sg-api__title">Your API keys</span>
            <span className="sg-irow__sub">Connect bots and apps to your account</span>
          </span>
          <button type="button" className="btn-primary ob-btn hp-btn-40 sg-api__create" onClick={() => go("settings/api/new")}>
            Create API key
          </button>
        </div>
        <p className="sg-info">
          <img src={sicons.shieldBlue} alt="" width="18" height="18" />
          <span>Never share your secret key. Keys that can withdraw must have an IP allowlist.</span>
        </p>
      </div>
      <div className="sg-keys">
        {keys.map((k) => (
          <KeyCard
            key={k.id}
            k={k}
            onEdit={() => setEditing(k)}
            onFix={() => setEditing(k)}
            onDelete={() => setKeys((list) => list.filter((x) => x !== k))}
          />
        ))}
        {keys.length === 0 && <p className="hp-empty-line">No API keys yet. Create one to connect a bot or app.</p>}
      </div>
      {(creating || editing) && <KeyModal initial={editing} onClose={close} onSave={save} />}
      {created && <CreatedModal created={created} onClose={() => setCreated(null)} />}
    </div>
  );
}

function ApiAside() {
  return (
    <>
      <Side title="Key safety">
        <ul className="sg-promises">
          {KEY_SAFETY.map((x) => (
            <li key={x.text}>
              <img src={x.ok ? sicons.check : sicons.error} alt="" width="14" height="14" />
              <span>{x.text}</span>
            </li>
          ))}
        </ul>
      </Side>
      <Side>
        <div className="hp-side__head">
          <h2 className="hp-side__title">API documentation</h2>
          <p className="hp-side__note">Endpoints, rate limits and code samples.</p>
        </div>
        <button type="button" className="ob-btn ob-btn--secondary" onClick={() => go("help/topic/security")}>
          Open API docs
        </button>
      </Side>
    </>
  );
}

/* ───────────── Notifications, Preferences, Linked accounts (no Figma frame; built from the same parts) ───────────── */

function NotificationsPanel() {
  const [rows, setRows] = useState(NOTIFICATIONS);
  const set = (key, field, v) => setRows((list) => list.map((r) => (r.key === key ? { ...r, [field]: v } : r)));
  return (
    <div className="sg-panel">
      <section className="sg-section">
        <div className="sg-notif-head">
          <h2 className="sg-h sg-h--muted">What we tell you about</h2>
          <span className="sg-notif-cols" aria-hidden="true">
            <span>Push</span>
            <span>Email</span>
          </span>
        </div>
        <ul className="sg-list">
          {rows.map((r) => (
            <li key={r.key} className="sg-list__row">
              <span className="sg-irow__text">
                <span className="sg-irow__title">{r.title}</span>
                <span className="sg-irow__sub">{r.sub}</span>
              </span>
              <span className="sg-notif-cols">
                <Toggle on={r.push} onChange={(v) => set(r.key, "push", v)} label={`${r.title} push`} />
                <Toggle on={r.email} onChange={(v) => set(r.key, "email", v)} label={`${r.title} email`} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PreferencesPanel({ theme, setTheme }) {
  return (
    <div className="sg-panel">
      <h2 className="sg-h">Preferences</h2>
      <PreferenceFields theme={theme} setTheme={setTheme} />
    </div>
  );
}

function LinkedPanel() {
  const [list, setList] = useState(LINKED);
  return (
    <div className="sg-panel">
      <section className="sg-section">
        <h2 className="sg-h sg-h--muted">Connected</h2>
        <div className="sg-rows">
          {list.map((x) => (
            <IconRow key={x.key} icon={x.icon} iconClass="" title={x.name} sub={x.sub}>
              <button type="button" className="ob-btn ob-btn--secondary sg-row-btn sg-row-btn--wide" onClick={() => setList((l) => l.filter((y) => y !== x))}>
                Disconnect
              </button>
            </IconRow>
          ))}
          {list.length === 0 && <p className="hp-empty-line">Nothing linked.</p>}
        </div>
      </section>
      <button type="button" className="btn-primary ob-btn sg-link-btn" onClick={() => go("connect-wallet")}>
        Link a wallet
      </button>
    </div>
  );
}

/* ───────────── Mobile settings list (742:159251) ───────────── */

function MobileRow({ icon, label, value, badge, onClick, danger, children }) {
  return (
    <li>
      <button type="button" className={`sg-mrow${danger ? " is-danger" : ""}`} onClick={onClick}>
        {typeof icon === "string" ? <img className={danger ? "" : "mono"} src={icon} alt="" width="18" height="18" /> : icon}
        <span className="sg-mrow__label">{label}</span>
        {badge}
        {value && <span className="sg-mrow__value">{value}</span>}
        {children || (!danger && <img className="mono" src={sicons.chevron} alt="" width="16" height="16" />)}
      </button>
    </li>
  );
}

function MobileList({ theme, setTheme }) {
  const passkey = hasPasskey();
  const dark = theme === "dark";
  return (
    <div className="sg-mobile">
      <Header title="Settings" crumbs={[{ label: "Profile, security and preferences." }]} />
      <button type="button" className="sg-mcard" onClick={() => go("settings/profile")}>
        <img className="sg-avatar sg-avatar--48" src={sicons.avatar} alt="" width="48" height="48" />
        <span className="sg-mcard__text">
          <span className="sg-mcard__name">{PROFILE.name}</span>
          <span className="sg-irow__sub">{PROFILE.email}</span>
          <Badge tone="green">Verified · Level 2</Badge>
        </span>
        <img className="mono" src={sicons.chevron} alt="" width="16" height="16" />
      </button>
      <p className="sg-mlabel">ACCOUNT</p>
      <ul className="sg-mgroup">
        <MobileRow icon={sicons.shield} label="Security" badge={<Badge tone={passkey ? "green" : "orange"}>{passkey ? "4 of 4" : "3 of 4"}</Badge>} onClick={() => go("settings/security")} />
        <MobileRow icon={sicons.eye} label="Notifications" value="Push, email" onClick={() => go("settings/notifications")} />
        <MobileRow icon={sicons.lock} label="API keys" value="3" onClick={() => go("settings/api")} />
        <MobileRow icon={sicons.linked} label="Linked accounts" value="2" onClick={() => go("settings/linked")} />
      </ul>
      <p className="sg-mlabel">PREFERENCES</p>
      <ul className="sg-mgroup">
        <MobileRow icon={sicons.language} label="Language" value="English (US)" onClick={() => go("settings/preferences")} />
        <MobileRow icon={<span className="sg-dollar">$</span>} label="Currency" value="USD" onClick={() => go("settings/preferences")} />
        <li>
          <div className="sg-mrow">
            <img className="mono" src={sicons.moon} alt="" width="18" height="18" />
            <span className="sg-mrow__label">Dark mode</span>
            <Toggle on={dark} onChange={(v) => setTheme(v ? "dark" : "light")} label="Dark mode" />
          </div>
        </li>
      </ul>
      <p className="sg-mlabel">MORE</p>
      <ul className="sg-mgroup">
        <MobileRow icon={sicons.encrypted} label="AI & privacy" onClick={() => go("settings/ai")} />
        <MobileRow icon={sicons.help} label="Help & Docs" onClick={() => go("help")} />
        <MobileRow icon={sicons.logout} label="Log out" danger onClick={() => go("login")} />
      </ul>
    </div>
  );
}

/* ───────────── Page ───────────── */

const CRUMBS = {
  security: () => "Last reviewed Oct 19, 2026",
  ai: () => "Noa only uses what you allow",
  api: () => "3 keys",
  notifications: () => "Push and email",
  preferences: () => "Language, currency and theme",
  linked: () => "2 connected",
};

export default function Settings({ sub = "", theme, setTheme }) {
  const [view, extra] = sub.split("/");
  const tab = TABS.find((t) => t.key !== "profile" && t.route === view) || TABS[0];
  const [passkey, setPasskeyState] = useState(hasPasskey);
  const passkeyOpen = tab.key === "security" && extra === "passkey" && !passkey;

  const root = !view;
  const header =
    tab.key === "profile" ? (
      <Header title="Settings" crumbs={[{ label: "Manage your profile, security, notifications and preferences." }]} />
    ) : (
      <Header title={tab.label} crumbs={[{ label: "Settings", route: "settings" }, { label: tab.label }, { label: CRUMBS[tab.key]() }]} />
    );

  let panel;
  let aside;
  if (tab.key === "security") {
    panel = (
      <SecurityPanel
        passkey={passkey}
        onAdd={() => go("settings/security/passkey")}
        onRemove={() => {
          savePasskey(false);
          setPasskeyState(false);
        }}
      />
    );
    aside = <SecurityAside />;
  } else if (tab.key === "ai") {
    panel = <AiPanel />;
    aside = <AiAside />;
  } else if (tab.key === "api") {
    panel = <ApiPanel sub={sub} />;
    aside = <ApiAside />;
  } else if (tab.key === "notifications") {
    panel = <NotificationsPanel />;
    aside = <ProfileAside />;
  } else if (tab.key === "preferences") {
    panel = <PreferencesPanel theme={theme} setTheme={setTheme} />;
    aside = <ProfileAside />;
  } else if (tab.key === "linked") {
    panel = <LinkedPanel />;
    aside = <SecurityAside />;
  } else {
    panel = <ProfilePanel theme={theme} setTheme={setTheme} />;
    aside = <ProfileAside />;
  }

  return (
    <main className={`portfolio help settings settings--${tab.key}${root ? " is-root" : ""}`}>
      {root && <MobileList theme={theme} setTheme={setTheme} />}
      <div className="sg-desktop">
        {header}
        <div className="hp-row">
          <section className="hp-main sg-main">
            <nav className="sg-nav" aria-label="Settings sections">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`sg-nav__item${t === tab ? " is-active" : ""}`}
                  aria-current={t === tab ? "page" : undefined}
                  onClick={() => go(tabRoute(t))}
                >
                  <img className={t === tab ? "sg-nav__icon is-active" : "mono sg-nav__icon"} src={t.icon} alt="" width="18" height="18" />
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
            {panel}
          </section>
          <aside className="hp-aside">{aside}</aside>
        </div>
      </div>
      {passkeyOpen && (
        <PasskeyModal
          onClose={() => go("settings/security")}
          onDone={() => {
            setPasskeyState(true);
            go("settings/security");
          }}
        />
      )}
    </main>
  );
}
