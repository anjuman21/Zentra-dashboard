import React, { useEffect, useRef, useState } from "react";
import { icons } from "../data";
import { auicons, testimonials, brandStats, passwordStrength, isEmail } from "../authData";

const EMAIL_KEY = "zentra-signup-email";
const go = (route) => {
  window.location.hash = route === "overview" ? "#/" : `#/${route}`;
};

function readEmail() {
  try {
    return sessionStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

function saveEmail(email) {
  try {
    sessionStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* storage unavailable */
  }
}

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* Brand panel ------------------------------------------------------------ */

function slotOf(i, active, total) {
  const d = (i - active + total) % total;
  return d === 0 ? "center" : d === 1 ? "right" : d === total - 1 ? "left" : "hidden";
}

function Quote({ t, slot }) {
  return (
    <figure className={`au-quote is-${slot}`} aria-hidden={slot !== "center"}>
      <p className="au-quote__stars" aria-label="5 out of 5 stars">
        ★★★★★
      </p>
      <blockquote className="au-quote__text">{t.quote}</blockquote>
      <figcaption className="au-quote__author">
        <img className="au-quote__avatar" src={t.avatar} alt="" width="32" height="32" />
        <span className="au-quote__name">
          <span className="au-quote__who">{t.name}</span>
          <span className="au-quote__role">{t.role}</span>
        </span>
        <span className="au-verified">Verified</span>
      </figcaption>
    </figure>
  );
}

function BrandPanel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;

  useEffect(() => {
    if (paused || reducedMotion()) return undefined;
    const id = setInterval(() => setActive((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [paused, total]);

  return (
    <aside className="au-brand" aria-label="Why traders use Zentra">
      <img className="au-brand__glow" src={auicons.glow} alt="" width="484" height="520" />
      <img className="au-brand__warm" src={auicons.glowWarm} alt="" width="480" height="512" />
      <img className="au-brand__dots" src={auicons.dots} alt="" width="664" height="120" />

      <div
        className="au-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <img className="au-stage__glow" src={auicons.glowCards} alt="" width="664" height="553" />
        <img className="au-stage__arc" src={auicons.arc} alt="" width="560" height="150" />
        <div className="au-quotes" aria-live="polite">
          {testimonials.map((t, i) => (
            <Quote key={t.name} t={t} slot={slotOf(i, active, total)} />
          ))}
        </div>
        <span className="au-stage__veil au-stage__veil--left" />
        <span className="au-stage__veil au-stage__veil--right" />
        <span className="au-node au-node--left">
          <img src={auicons.nodeLeft} alt="" width="40" height="40" />
        </span>
        <span className="au-node au-node--right">
          <img src={auicons.nodeRight} alt="" width="40" height="40" />
        </span>
        <span className="au-node au-node--mark">
          <img src={icons.logo} alt="" width="56" height="52" />
        </span>
        <div className="au-trusted">
          <div className="au-dots" role="tablist" aria-label="Testimonials">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show review from ${t.name}`}
                className={`au-dot${i === active ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <p className="au-trusted__text">Trusted by 120,000+ traders in 40+ countries</p>
        </div>
      </div>

      <div className="au-brand__copy">
        <div className="au-brand__headline">
          <h2 className="au-brand__title">Trade, track and grow your crypto in one place.</h2>
          <p className="au-brand__sub">Join 120K+ traders using Zentra to manage portfolios, convert coins and earn rewards.</p>
        </div>
        <dl className="au-brand__stats">
          {brandStats.map((s) => (
            <div key={s.label} className="au-brand__stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

/* Shared form parts ------------------------------------------------------ */

function Language() {
  return (
    <button type="button" className="au-lang">
      <img className="mono" src={icons.language} alt="" width="18" height="18" />
      <span>English (United States)</span>
      <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
    </button>
  );
}

export function AuthLayout({ children, brand = true }) {
  return (
    <div className={`au-page${brand ? "" : " au-page--plain"}`}>
      {brand && <BrandPanel />}
      <section className="au-area">
        <header className="au-top">
          <a className="au-logo" href="#/" aria-label="Zentra home">
            <img src={icons.logo} alt="" width="22" height="20" />
            <span>Zentra</span>
          </a>
          <Language />
        </header>
        {children}
      </section>
    </div>
  );
}

function Social({ onPick }) {
  return (
    <div className="au-social">
      <button type="button" className="au-social__btn" onClick={() => onPick("Google")}>
        <img src={auicons.google} alt="" width="18" height="18" />
        <span>Google</span>
      </button>
      <button type="button" className="au-social__btn" onClick={() => onPick("Apple")}>
        <img className="mono" src={auicons.apple} alt="" width="18" height="18" />
        <span>Apple</span>
      </button>
    </div>
  );
}

function Divider({ children }) {
  return (
    <div className="au-divider" role="separator">
      <span>{children}</span>
    </div>
  );
}

function Field({ id, label, error, trailing, ...input }) {
  return (
    <div className="au-input">
      <label className="au-input__label" htmlFor={id}>
        {label}
      </label>
      <div className={`au-field${error ? " is-error" : ""}`}>
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...input} />
        {trailing}
      </div>
      {error && (
        <p className="au-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({ id, value, onChange, error, autoComplete }) {
  const [shown, setShown] = useState(false);
  return (
    <Field
      id={id}
      label="Password"
      type={shown ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={error}
      autoComplete={autoComplete}
      placeholder="Enter your password"
      trailing={
        <button
          type="button"
          className={`au-eye${shown ? " is-on" : ""}`}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
        >
          <img className="mono" src={auicons.eye} alt="" width="18" height="18" />
        </button>
      }
    />
  );
}

function Checkbox({ checked, onChange, children, error }) {
  return (
    <label className={`au-check${error ? " is-error" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="au-check__box" aria-hidden="true">
        <img src={auicons.check} alt="" width="12" height="12" />
      </span>
      <span className="au-check__text">{children}</span>
    </label>
  );
}

function Note({ icon, children }) {
  return (
    <p className="au-note">
      <img className={icon === auicons.info ? "mono" : undefined} src={icon} alt="" width="16" height="16" />
      <span>{children}</span>
    </p>
  );
}

function Switch({ text, link, to }) {
  return (
    <p className="au-switch">
      {text}{" "}
      <a href={`#/${to}`} className="au-link">
        {link}
      </a>
    </p>
  );
}

/* 01 · Sign up ----------------------------------------------------------- */

export function SignUp() {
  const [email, setEmail] = useState(readEmail);
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const strength = passwordStrength(password);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!agree) next.terms = true;
    setErrors(next);
    if (Object.keys(next).length) return;
    saveEmail(email.trim());
    go("verify-email");
  };

  return (
    <AuthLayout>
      <form className="au-form au-form--signup" onSubmit={submit} noValidate>
        <div className="au-group">
          <div className="au-title">
            <h1 className="au-title__h">Create your account</h1>
            <p className="au-title__sub">Start trading in under a minute.</p>
          </div>
          <Social onPick={() => go("verify-email")} />
        </div>
        <Divider>or continue with email</Divider>
        <div className="au-group au-group--wide">
          <div className="au-fields">
            <Field
              id="su-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="au-pass">
              <PasswordField
                id="su-password"
                value={password}
                autoComplete="new-password"
                error={errors.password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={`au-strength is-${strength.tone || "empty"}`} aria-live="polite">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={`au-strength__bar${n <= strength.score ? " is-on" : ""}`} />
                ))}
                <span className="au-strength__label">{strength.label}</span>
              </div>
            </div>
          </div>
          <Checkbox checked={agree} onChange={setAgree} error={errors.terms}>
            I agree to the{" "}
            <a className="au-link" href="#/signup">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="au-link" href="#/signup">
              Privacy Policy
            </a>
          </Checkbox>
        </div>
        <div className="au-footer">
          <button type="submit" className="btn-primary au-submit">
            Create account
          </button>
          <Switch text="Already have an account?" link="Log in" to="login" />
        </div>
      </form>
    </AuthLayout>
  );
}

/* 02 · Log in ------------------------------------------------------------ */

export function LogIn() {
  const [email, setEmail] = useState(readEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    go("overview");
  };

  return (
    <AuthLayout>
      <form className="au-form au-form--login" onSubmit={submit} noValidate>
        <div className="au-title">
          <h1 className="au-title__h">Welcome back</h1>
          <p className="au-title__sub">Log in to your Zentra account to continue.</p>
        </div>
        <Social onPick={() => go("overview")} />
        <Divider>or log in with email</Divider>
        <div className="au-fields">
          <Field
            id="li-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            id="li-password"
            value={password}
            autoComplete="current-password"
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="au-options">
          <Checkbox checked={remember} onChange={setRemember}>
            Remember me
          </Checkbox>
          <a className="au-link au-link--sm" href="#/login">
            Forgot password?
          </a>
        </div>
        <button type="submit" className="btn-primary au-submit">
          Log in
        </button>
        <Note icon={auicons.shield}>Protected with 2-step verification and end-to-end encryption.</Note>
        <div className="au-footer">
          <Switch text="New to Zentra?" link="Create an account" to="signup" />
        </div>
      </form>
    </AuthLayout>
  );
}

/* 03 · Verify email ------------------------------------------------------ */

const LENGTH = 6;
const RESEND_AFTER = 30;

export function VerifyEmail() {
  const email = readEmail() || "your email address";
  const [digits, setDigits] = useState(() => Array(LENGTH).fill(""));
  const [error, setError] = useState("");
  const [left, setLeft] = useState(RESEND_AFTER);
  const [focused, setFocused] = useState(0);
  const boxes = useRef([]);

  useEffect(() => {
    boxes.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (left <= 0) return undefined;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const focusBox = (i) => boxes.current[Math.max(0, Math.min(LENGTH - 1, i))]?.focus();

  const fill = (start, text) => {
    const chars = text.replace(/\D/g, "").slice(0, LENGTH - start).split("");
    if (!chars.length) return;
    setDigits((d) => {
      const next = [...d];
      chars.forEach((c, k) => {
        next[start + k] = c;
      });
      return next;
    });
    setError("");
    focusBox(start + chars.length);
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setDigits((d) => {
        const next = [...d];
        if (next[i]) next[i] = "";
        else if (i > 0) next[i - 1] = "";
        return next;
      });
      if (!digits[i]) focusBox(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (digits.some((d) => !d)) {
      setError("Enter all 6 digits of the code.");
      focusBox(digits.findIndex((d) => !d));
      return;
    }
    go("overview");
  };

  const resend = () => {
    setLeft(RESEND_AFTER);
    setDigits(Array(LENGTH).fill(""));
    setError("");
    focusBox(0);
  };

  const mmss = `0:${String(left).padStart(2, "0")}`;

  return (
    <AuthLayout>
      <form className="au-form au-form--verify" onSubmit={submit} noValidate>
        <a className="au-back" href="#/signup">
          <img className="mono" src={auicons.back} alt="" width="16" height="16" />
          <span>Back</span>
        </a>
        <div className="au-title au-title--verify">
          <div className="au-title__stack">
            <h1 className="au-title__h">Check your email</h1>
            <p className="au-title__sub au-title__sub--muted">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your account.
            </p>
          </div>
          <a className="au-link au-link--md" href="#/signup">
            Change email
          </a>
        </div>
        <div className="au-code-group">
          <div className="au-code" role="group" aria-label="Verification code">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                className={`au-digit${d ? " is-filled" : ""}${error && !d ? " is-error" : ""}`}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={d}
                aria-label={`Digit ${i + 1}`}
                data-focused={focused === i}
                onFocus={(e) => {
                  setFocused(i);
                  e.target.select();
                }}
                onChange={(e) => fill(i, e.target.value.slice(-1))}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  fill(i, e.clipboardData.getData("text"));
                }}
              />
            ))}
          </div>
          {error ? (
            <p className="au-error" role="alert">
              {error}
            </p>
          ) : null}
          <p className="au-resend">
            Didn’t get it?{" "}
            {left > 0 ? (
              <span className="au-resend__wait">Resend code in {mmss}</span>
            ) : (
              <button type="button" className="au-link" onClick={resend}>
                Resend code
              </button>
            )}
          </p>
        </div>
        <div className="au-group">
          <button type="submit" className="btn-primary au-submit">
            Verify email
          </button>
          <Note icon={auicons.info}>Can’t find it? Check your spam or promotions folder.</Note>
        </div>
      </form>
    </AuthLayout>
  );
}
