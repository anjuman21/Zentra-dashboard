import React, { useEffect, useRef, useState } from "react";
import { icons } from "../data";
import { Field, Language } from "./Auth";
import {
  obicons,
  SETUP_STEPS,
  EXPERIENCE,
  COUNTRIES,
  ID_TYPES,
  WALLETS,
  DEPOSIT,
  markDone,
  go,
} from "../onboardingData";

/* Shared pieces -------------------------------------------------------- */

function Logo() {
  return (
    <a className="ob-logo" href="#/" aria-label="Zentra home">
      <img src={icons.logo} alt="" width="27" height="25" />
      <span>Zentra</span>
    </a>
  );
}

// Desktop: breadcrumb of the four steps plus a thin progress line.
// Mobile: four bars and "Step n of 4 · Name".
function WizardBar({ step, progress }) {
  const index = SETUP_STEPS.findIndex((s) => s.key === step);
  return (
    <header className="ob-top">
      <div className="ob-top__bar">
        <Logo />
        <nav className="ob-crumbs" aria-label="Setup steps">
          {SETUP_STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              {i > 0 && <img className="ob-crumbs__sep" src={obicons.chevron} alt="" width="18" height="18" />}
              <span
                className={`ob-crumbs__item${i === index ? " is-current" : i < index || index === -1 ? " is-done" : ""}`}
                aria-current={i === index ? "step" : undefined}
              >
                {s.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
        <div className="ob-exit">
          {index !== -1 && (
            <a className="ob-exit__later" href="#/">
              Do it later
            </a>
          )}
          <a className="ob-close" href="#/" aria-label="Close setup">
            <img className="mono" src={obicons.close} alt="" width="16" height="16" />
          </a>
        </div>
      </div>
      <div className="ob-line" aria-hidden="true">
        <span style={{ width: `${progress * 100}%` }} />
      </div>
      {index !== -1 && (
        <div className="ob-steps">
          <div className="ob-steps__bars" aria-hidden="true">
            {SETUP_STEPS.map((s, i) => (
              <span key={s.key} className={i <= index ? "is-on" : ""} />
            ))}
          </div>
          <p className="ob-steps__label">
            Step {index + 1} of 4 · {SETUP_STEPS[index].label}
          </p>
        </div>
      )}
    </header>
  );
}

function Help() {
  return (
    <p className="ob-help">
      <img className="mono" src={obicons.help} alt="" width="15" height="15" />
      <span>Need help?</span>
      <a className="ob-link" href="mailto:support@zentra.app">
        Contact support
      </a>
    </p>
  );
}

function Wizard({ step, progress, children, className = "", wide = false }) {
  return (
    <div className={`ob-page ${className}`}>
      <WizardBar step={step} progress={progress} />
      <main className={`ob-body${wide ? " ob-body--wide" : ""}`}>{children}</main>
    </div>
  );
}

function Title({ title, children, size = 26 }) {
  return (
    <div className="ob-title">
      <h1 className={`ob-title__h ob-title__h--${size}`}>{title}</h1>
      {children && <p className="ob-title__sub">{children}</p>}
    </div>
  );
}

function Actions({ children, row = false }) {
  return <div className={`ob-actions${row ? " ob-actions--row" : ""}`}>{children}</div>;
}

function Primary({ children, onClick, type = "button" }) {
  return (
    <button type={type} className="btn-primary ob-btn" onClick={onClick}>
      {children}
    </button>
  );
}

function Ghost({ children, onClick }) {
  return (
    <button type="button" className="ob-btn ob-btn--ghost" onClick={onClick}>
      {children}
    </button>
  );
}

function Secondary({ children, onClick }) {
  return (
    <button type="button" className="ob-btn ob-btn--secondary" onClick={onClick}>
      {children}
    </button>
  );
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div className="ob-seg" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="tab"
          aria-selected={o === value}
          className={`ob-seg__item${o === value ? " is-active" : ""}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function useCopy() {
  const [copied, setCopied] = useState("");
  const copy = (key, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? "" : c)), 1600);
  };
  return [copied, copy];
}

/* 04 · Quick profile ---------------------------------------------------- */

export function QuickProfile() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [level, setLevel] = useState(EXPERIENCE[0].key);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }
    try {
      sessionStorage.setItem("zentra-profile", JSON.stringify({ name: name.trim(), country, level }));
    } catch {
      /* storage unavailable */
    }
    go("setup");
  };

  return (
    <div className="ob-page ob-page--profile">
      <header className="ob-top">
        <div className="ob-top__bar">
          <Logo />
          <Language />
        </div>
      </header>
      <main className="ob-body">
        <form className="ob-profile" onSubmit={submit} noValidate>
          <div className="au-title">
            <h1 className="au-title__h">Tell us a bit about you</h1>
            <p className="au-title__sub">We’ll use this to set up your dashboard. You can change it anytime.</p>
          </div>
          <div className="au-fields">
            <Field
              id="pf-name"
              label="Full name"
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              error={error}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />
            <div className="au-input">
              <label className="au-input__label" htmlFor="pf-country">
                Country of residence
              </label>
              <div className="au-field ob-select">
                {country === "Bangladesh" ? (
                  <img src={obicons.flagBd} alt="" width="22" height="16" />
                ) : (
                  <img className="mono" src={icons.language} alt="" width="18" height="18" />
                )}
                <select id="pf-country" value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <img className="mono ob-select__arrow" src={obicons.select} alt="" width="18" height="18" />
              </div>
            </div>
          </div>
          <fieldset className="ob-level">
            <legend className="ob-level__label">How familiar are you with crypto?</legend>
            <div className="ob-level__options">
              {EXPERIENCE.map((x) => (
                <label key={x.key} className={`ob-option${level === x.key ? " is-selected" : ""}`}>
                  <input type="radio" name="level" value={x.key} checked={level === x.key} onChange={() => setLevel(x.key)} />
                  <span className="ob-option__top">
                    <span className="ob-option__icon">
                      <img src={x.icon} alt="" width="18" height="18" />
                    </span>
                    <span className="ob-radio" aria-hidden="true">
                      <img src={obicons.checkWhite} alt="" width="12" height="12" />
                    </span>
                  </span>
                  <span className="ob-option__text">
                    <span className="ob-option__name">{x.label}</span>
                    <span className="ob-option__sub">{x.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Actions>
            <Primary type="submit">Go to dashboard</Primary>
            <Ghost onClick={() => go("overview")}>Skip for now</Ghost>
          </Actions>
        </form>
      </main>
    </div>
  );
}

/* 06 · Verify identity · Intro ------------------------------------------- */

const NEEDS = [
  { icon: obicons.article, title: "A government ID", sub: "Passport, national ID card or driving licence" },
  { icon: obicons.selfie, title: "A quick selfie", sub: "We’ll match it to your ID photo" },
  { icon: obicons.home, title: "Your home address", sub: "Must match your country of residence" },
];

export function VerifyIntro() {
  return (
    <Wizard step="identity" progress={400 / 1440}>
      <section className="ob-card ob-card--hero">
        <img className="ob-ill" src={obicons.illId} alt="" width="185" height="174" />
        <div className="ob-stack">
          <div className="ob-stack ob-stack--16">
            <Title title="Verify your identity" size={28}>
              We’re required by law to confirm who you are. It keeps your account and your funds safe.
            </Title>
            <div className="ob-chips">
              <span className="ob-chip">
                <img className="mono" src={obicons.schedule} alt="" width="16" height="16" />
                About 3 minutes
              </span>
              <span className="ob-chip">
                <img className="mono" src={obicons.lock14} alt="" width="14" height="14" />
                Bank-level encryption
              </span>
            </div>
          </div>
          <div className="ob-stack">
            <div className="ob-need">
              <p className="ob-eyebrow">What you’ll need</p>
              <ul className="ob-need__list">
                {NEEDS.map((n) => (
                  <li key={n.title} className="ob-need__item">
                    <span className="ob-need__icon">
                      <img className="mono" src={n.icon} alt="" width="20" height="20" />
                    </span>
                    <span className="ob-need__text">
                      <span className="ob-need__title">{n.title}</span>
                      <span className="ob-need__sub">{n.sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="ob-banner ob-banner--green">
              <img src={obicons.lockOpen} alt="" width="16" height="16" />
              <span>Unlocks deposits over $1,000, withdrawals and higher trading limits.</span>
            </p>
          </div>
        </div>
        <Actions>
          <Primary onClick={() => go("verify-id")}>Start verification</Primary>
          <Ghost onClick={() => go("overview")}>I’ll do it later</Ghost>
        </Actions>
      </section>
      <Help />
    </Wizard>
  );
}

/* 07 / 08 · KYC stepper ---------------------------------------------------- */

const KYC = [
  { title: "Details", desc: "Your basic information" },
  { title: "Document", desc: "Upload a government-issued ID" },
  { title: "Selfie", desc: "A quick photo to match your ID" },
];

function KycSteps({ current }) {
  return (
    <aside className="ob-kyc">
      <ol className="ob-kyc__list">
        {KYC.map((s, i) => {
          const state = i < current ? "done" : i === current ? "current" : "upcoming";
          return (
            <li key={s.title} className={`ob-kyc__step is-${state}`} aria-current={state === "current" ? "step" : undefined}>
              <span className="ob-kyc__rail">
                <span className="ob-kyc__dot">
                  {state === "done" && <img src={obicons.stepCheck} alt="" width="22" height="22" />}
                  {state === "current" && <img src={obicons.stepProgress} alt="" width="14" height="14" />}
                  {state === "upcoming" && i + 1}
                </span>
                {i < KYC.length - 1 && <span className="ob-kyc__line" />}
              </span>
              <span className="ob-kyc__text">
                <span className="ob-kyc__title">{s.title}</span>
                <span className="ob-kyc__desc">{s.desc}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <Help />
    </aside>
  );
}

function IdCard() {
  return (
    <span className="ob-idcard" aria-hidden="true">
      <span className="ob-idcard__band" />
      <img className="ob-idcard__photo" src={obicons.idPhoto} alt="" width="40" height="48" />
      <span className="ob-idcard__line" style={{ top: 36, width: 90 }} />
      <span className="ob-idcard__line" style={{ top: 50, width: 70 }} />
      <span className="ob-idcard__line" style={{ top: 64, width: 84 }} />
      <span className="ob-idcard__line" style={{ top: 84, width: 50 }} />
    </span>
  );
}

const sizeLabel = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function UploadSlot({ label, file, onFile, demo }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (f) => {
    if (!f) return;
    onFile({ name: f.name, size: sizeLabel(f.size), url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "" });
  };
  const has = file || demo;
  const shown = file || demo;
  return (
    <div className="ob-upload">
      <p className="ob-upload__label">{label}</p>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        hidden
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {has ? (
        <>
          <div className="ob-upload__preview">{shown.url ? <img src={shown.url} alt={`${label} preview`} /> : <IdCard />}</div>
          <div className="ob-upload__file">
            <span className="ob-ok">
              <img src={obicons.fileOk} alt="" width="12" height="12" />
            </span>
            <span className="ob-upload__name">
              {shown.name} · {shown.size}
            </span>
            <button type="button" className="ob-link ob-link--12" onClick={() => input.current?.click()}>
              Replace
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`ob-drop${over ? " is-over" : ""}`}
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              pick(e.dataTransfer.files?.[0]);
            }}
          >
            <span className="ob-drop__icon">
              <img src={obicons.upload} alt="" width="18" height="18" />
            </span>
            <span className="ob-drop__text">
              Drop file or <span className="ob-link">browse</span>
            </span>
            <span className="ob-drop__hint">JPG, PNG or PDF · max 10 MB</span>
          </button>
          <button type="button" className="ob-camera" onClick={() => input.current?.click()}>
            <img className="mono" src={obicons.camera} alt="" width="14" height="14" />
            Use camera instead
          </button>
        </>
      )}
    </div>
  );
}

function Tips({ items }) {
  return (
    <div className="ob-tips">
      <p className="ob-tips__title">Photo tips</p>
      <ul>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export function UploadId() {
  const [type, setType] = useState(ID_TYPES[1]);
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [error, setError] = useState("");
  const needsBack = type !== "Passport";

  const next = () => {
    if (needsBack && !back) {
      setError("Add the back side of your ID to continue.");
      return;
    }
    go("verify-selfie");
  };

  return (
    <Wizard step="identity" progress={510 / 1440} wide>
      <div className="ob-split">
        <KycSteps current={1} />
        <section className="ob-card ob-card--form">
          <div className="ob-stack ob-stack--40">
            <div className="ob-stack">
              <Title title="Upload your ID">Take a clear photo or upload a scan. Make sure all details are readable.</Title>
              <div className="ob-doc">
                <p className="ob-upload__label">Document type</p>
                <div className="ob-doc__types" role="radiogroup" aria-label="Document type">
                  {ID_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={t === type}
                      className={`ob-doc__type${t === type ? " is-active" : ""}`}
                      onClick={() => {
                        setType(t);
                        setError("");
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="ob-stack ob-stack--32">
              <div className="ob-uploads">
                <UploadSlot
                  label={needsBack ? "Front side" : "Photo page"}
                  file={front}
                  onFile={setFront}
                  demo={{ name: "id-front.jpg", size: "2.4 MB", url: "" }}
                />
                {needsBack && (
                  <UploadSlot
                    label="Back side"
                    file={back}
                    onFile={(f) => {
                      setBack(f);
                      setError("");
                    }}
                  />
                )}
              </div>
              {error && (
                <p className="au-error" role="alert">
                  {error}
                </p>
              )}
              <Tips items={["Use good lighting", "Avoid glare and blur", "Keep all 4 corners in the frame"]} />
            </div>
          </div>
          <Actions row>
            <Secondary onClick={() => go("verify-identity")}>Back</Secondary>
            <Primary onClick={next}>Continue</Primary>
          </Actions>
        </section>
      </div>
      <div className="ob-mobile-help">
        <Help />
      </div>
    </Wizard>
  );
}

export function Selfie() {
  const [flash, setFlash] = useState(false);
  const take = () => {
    setFlash(true);
    setTimeout(() => {
      markDone("identity");
      go("verify-review");
    }, 450);
  };
  return (
    <Wizard step="identity" progress={510 / 1440} wide>
      <div className="ob-split">
        <KycSteps current={2} />
        <section className="ob-card ob-card--form">
          <div className="ob-stack ob-stack--40">
            <Title title="Take a quick selfie">
              We’ll match your face to your ID photo. Remove glasses or hats and look straight at the camera.
            </Title>
            <div className="ob-stack ob-stack--32">
              <div className={`ob-camera-view${flash ? " is-flash" : ""}`}>
                <div className="ob-camera-view__stage">
                  <img className="ob-camera-view__face" src={obicons.face} alt="Camera preview with your face inside the oval" width="168" height="214" />
                  <img className="ob-camera-view__guide" src={obicons.faceGuide} alt="" width="184" height="230" />
                  <img className="ob-camera-view__corners" src={obicons.corners} alt="" width="300" height="260" />
                </div>
                <span className="ob-camera-view__status">
                  <img src={obicons.liveDot} alt="" width="8" height="8" />
                  Face detected · hold still
                </span>
              </div>
              <Tips items={["Use good lighting", "Keep your face in the oval", "Keep your eyes open"]} />
            </div>
          </div>
          <Actions row>
            <Secondary onClick={() => go("verify-id")}>Back</Secondary>
            <Primary onClick={take}>Take selfie</Primary>
          </Actions>
          <p className="ob-privacy">
            <img className="mono" src={obicons.info} alt="" width="14" height="14" />
            Your photo is only used for verification and deleted after review.
          </p>
        </section>
      </div>
      <div className="ob-mobile-help">
        <Help />
      </div>
    </Wizard>
  );
}

/* 09 · Under review ------------------------------------------------------ */

export function UnderReview() {
  return (
    <Wizard step="identity" progress={720 / 1440}>
      <section className="ob-card ob-card--hero">
        <img className="ob-ill" src={obicons.illReview} alt="" width="184" height="174" />
        <div className="ob-stack ob-stack--40">
          <div className="ob-stack">
            <Title title="We’re reviewing your details">
              This usually takes under 10 minutes. We’ll email you and send a notification as soon as it’s done.
            </Title>
            <ol className="ob-timeline">
              <li className="ob-timeline__item is-done">
                <span className="ob-timeline__rail">
                  <span className="ob-timeline__dot">
                    <img src={obicons.tlCheck} alt="" width="14" height="14" />
                  </span>
                  <span className="ob-timeline__line" />
                </span>
                <span className="ob-timeline__text">
                  <span className="ob-timeline__title">Documents submitted</span>
                  <span className="ob-timeline__sub">Today, 10:24 AM</span>
                </span>
              </li>
              <li className="ob-timeline__item is-current">
                <span className="ob-timeline__rail">
                  <img src={obicons.tlCurrent} alt="" width="28" height="28" />
                  <span className="ob-timeline__line" />
                </span>
                <span className="ob-timeline__text">
                  <span className="ob-timeline__title">Under review</span>
                  <span className="ob-timeline__sub">Checking your ID and selfie…</span>
                </span>
                <span className="ob-pill ob-pill--yellow">In progress</span>
              </li>
              <li className="ob-timeline__item is-next">
                <span className="ob-timeline__rail">
                  <img src={obicons.tlNext} alt="" width="28" height="28" />
                </span>
                <span className="ob-timeline__text">
                  <span className="ob-timeline__title">Identity verified</span>
                  <span className="ob-timeline__sub">You’ll get full access to Zentra</span>
                </span>
              </li>
            </ol>
            <div className="ob-meanwhile">
              <span className="ob-meanwhile__icon">
                <img src={obicons.wallet} alt="" width="18" height="18" />
              </span>
              <span className="ob-meanwhile__text">
                <span className="ob-meanwhile__title">Don’t wait around</span>
                <span className="ob-meanwhile__sub">You can connect your wallet while we review your ID.</span>
              </span>
            </div>
          </div>
          <Actions>
            <Primary onClick={() => go("connect-wallet")}>Continue to connect wallet</Primary>
            <Ghost onClick={() => go("overview")}>Back to dashboard</Ghost>
          </Actions>
        </div>
      </section>
      <Help />
    </Wizard>
  );
}

/* 10 · Connect wallet ------------------------------------------------------ */

function WalletChip({ w }) {
  return (
    <span className="ob-wchip">
      <span className={`ob-wchip__coin is-${w.tone}`}>
        <img src={w.icon} alt="" width="14" height="14" />
      </span>
      {w.name}
    </span>
  );
}

function connect(name) {
  try {
    sessionStorage.setItem("zentra-wallet", name);
  } catch {
    /* storage unavailable */
  }
  markDone("wallet");
  go("wallet-connected");
}

export function ConnectWallet() {
  const [mode, setMode] = useState("Mobile wallet (QR)");
  const [left, setLeft] = useState(48);

  useEffect(() => {
    if (mode !== "Mobile wallet (QR)") return undefined;
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const steps = [
    { title: "Open your wallet app", sub: "MetaMask, Trust Wallet, Coinbase" },
    { title: "Tap the scan icon", sub: "Usually in the top corner" },
    { title: "Scan & approve", sub: "Confirm the connection in the app" },
  ];

  return (
    <Wizard step="wallet" progress={870 / 1440}>
      <section className="ob-card ob-card--form">
        <Title title="Connect your wallet">Link a wallet to deposit, withdraw and see all your crypto in one place.</Title>
        <div className="ob-stack">
          <Segmented options={["Mobile wallet (QR)", "Browser extension"]} value={mode} onChange={setMode} label="Connection type" />
          {mode === "Mobile wallet (QR)" ? (
            <div className="ob-stack">
              <div className="ob-stack ob-stack--8">
                <div className="ob-qrbox">
                  <button
                    type="button"
                    className={`ob-qr${left === 0 ? " is-expired" : ""}`}
                    title="Scan with your wallet app"
                    onClick={() => left > 0 && connect("MetaMask")}
                  >
                    <img src={obicons.qr} alt="QR code to connect your wallet" width="200" height="200" />
                    <span className="ob-qr__logo">
                      <img src={icons.logo} alt="" width="23" height="21" />
                    </span>
                  </button>
                  <ol className="ob-howto">
                    {steps.map((s, i) => (
                      <li key={s.title}>
                        <span className="ob-num">{i + 1}</span>
                        <span className="ob-howto__text">
                          <span className="ob-howto__title">{s.title}</span>
                          <span className="ob-howto__sub">{s.sub}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="ob-status">
                  <span className="ob-status__wait">
                    <img className="ob-wait" src={obicons.wait} alt="" width="26" height="6" />
                    {left > 0 ? "Waiting for scan…" : "Code expired"}
                  </span>
                  <span className="ob-status__expiry">
                    {left > 0 && <span>Expires in 0:{String(left).padStart(2, "0")}</span>}
                    <button type="button" className="ob-link ob-renew" onClick={() => setLeft(48)}>
                      <img src={obicons.renew} alt="" width="14" height="14" />
                      New code
                    </button>
                  </span>
                </div>
              </div>
              <div className="ob-works">
                <p className="ob-eyebrow ob-eyebrow--12">Works with</p>
                <div className="ob-works__list">
                  {WALLETS.map((w) => (
                    <WalletChip key={w.name} w={w} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ul className="ob-extensions">
              {WALLETS.map((w) => (
                <li key={w.name}>
                  <button type="button" className="ob-extension" onClick={() => connect(w.name)}>
                    <span className={`ob-wchip__coin ob-wchip__coin--lg is-${w.tone}`}>
                      <img src={w.icon} alt="" width="20" height="20" />
                    </span>
                    <span className="ob-extension__name">{w.name}</span>
                    <span className="ob-extension__go">Connect</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Actions>
          <Ghost onClick={() => go("overview")}>I’ll connect a wallet later</Ghost>
        </Actions>
      </section>
      <Help />
    </Wizard>
  );
}

/* 11 · Wallet connected ---------------------------------------------------- */

export function WalletConnected() {
  const [copied, copy] = useCopy();
  let name = "MetaMask";
  try {
    name = sessionStorage.getItem("zentra-wallet") || name;
  } catch {
    /* storage unavailable */
  }
  const w = WALLETS.find((x) => x.name === name) || WALLETS[0];
  return (
    <Wizard step="wallet" progress={960 / 1440}>
      <section className="ob-card ob-card--hero">
        <img className="ob-ill" src={obicons.illWallet} alt="" width="185" height="174" />
        <div className="ob-stack">
          <Title title="Wallet connected">Nice! Your wallet is linked. You can now deposit and withdraw directly from it.</Title>
          <div className="ob-stack ob-stack--32">
            <div className="ob-wallet">
              <div className="ob-wallet__top">
                <span className={`ob-wchip__coin ob-wchip__coin--xl is-${w.tone}`}>
                  <img src={w.icon} alt="" width="26" height="24" />
                </span>
                <span className="ob-wallet__name">
                  <span className="ob-wallet__title">{w.name}</span>
                  <button type="button" className="ob-wallet__addr" onClick={() => copy("addr", "0x12F4c9e1a07b5d3f88aB92")}>
                    {copied === "addr" ? "Copied" : "0x12F4…aB92"}
                    <img className="mono" src={obicons.copy13} alt="" width="13" height="13" />
                  </button>
                </span>
                <span className="ob-network">
                  <img src={obicons.ethDot} alt="" width="8" height="8" />
                  Ethereum
                </span>
              </div>
              <span className="ob-wallet__rule" />
              <div className="ob-wallet__balance">
                <span className="ob-wallet__left">
                  <span className="ob-wallet__label">Wallet balance</span>
                  <span className="ob-wallet__value">2.4518 ETH</span>
                </span>
                <span className="ob-wallet__fiat">≈ $7,960.11</span>
              </div>
            </div>
            <div className="ob-perms">
              <p className="ob-eyebrow ob-eyebrow--12">Zentra can</p>
              <ul>
                <li>
                  <span className="ob-perm is-yes">
                    <img src={obicons.permYes} alt="" width="14" height="14" />
                  </span>
                  View your wallet balance and activity
                </li>
                <li>
                  <span className="ob-perm is-yes">
                    <img src={obicons.permYes} alt="" width="14" height="14" />
                  </span>
                  Request approval for deposits and withdrawals
                </li>
                <li className="is-no">
                  <span className="ob-perm is-no">
                    <img className="mono" src={obicons.permNo} alt="" width="11" height="11" />
                  </span>
                  Move funds without your approval
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Actions>
          <Primary onClick={() => go("deposit")}>Continue to first deposit</Primary>
          <Ghost onClick={() => go("connect-wallet")}>Connect another wallet</Ghost>
        </Actions>
      </section>
      <Help />
    </Wizard>
  );
}

/* 12 · First deposit ------------------------------------------------------- */

export function Deposit() {
  const [method, setMethod] = useState("Crypto");
  const [copied, copy] = useCopy();
  const share = () => {
    if (navigator.share) navigator.share({ title: "My BTC deposit address", text: DEPOSIT.address }).catch(() => {});
    else copy("share", DEPOSIT.address);
  };
  return (
    <Wizard step="deposit" progress={1150 / 1440}>
      <section className="ob-card ob-card--form">
        <div className="ob-stack">
          <Title title="Make your first deposit">Send crypto from any wallet or exchange to your Zentra address.</Title>
          <Segmented options={["Crypto", "Card", "Bank transfer"]} value={method} onChange={setMethod} label="Deposit method" />
        </div>
        {method === "Crypto" ? (
          <div className="ob-stack ob-stack--32">
            <div className="ob-stack">
              <div className="ob-selects">
                <div className="ob-selectbox">
                  <p className="ob-upload__label">Coin</p>
                  <button type="button" className="ob-pick">
                    <img src={obicons.btc} alt="" width="24" height="24" />
                    <span>{DEPOSIT.coin}</span>
                    <img className="mono" src={obicons.arrow} alt="" width="18" height="18" />
                  </button>
                </div>
                <div className="ob-selectbox">
                  <p className="ob-upload__label">Network</p>
                  <button type="button" className="ob-pick">
                    <img src={obicons.btcDot} alt="" width="8" height="8" />
                    <span>{DEPOSIT.network}</span>
                    <img className="mono" src={obicons.arrow} alt="" width="18" height="18" />
                  </button>
                </div>
              </div>
              <div className="ob-stack ob-stack--16">
                <div className="ob-address">
                  <span className="ob-address__qr">
                    <img src={obicons.qrBtc} alt="QR code of your BTC deposit address" width="116" height="116" />
                  </span>
                  <div className="ob-address__body">
                    <div className="ob-address__text">
                      <p className="ob-address__label">Your BTC deposit address</p>
                      <p className="ob-address__value">{DEPOSIT.address}</p>
                    </div>
                    <div className="ob-address__btns">
                      <button type="button" className="ob-mini" onClick={() => copy("addr", DEPOSIT.address)}>
                        <img className="mono" src={obicons.copy} alt="" width="14" height="14" />
                        {copied === "addr" ? "Copied" : "Copy address"}
                      </button>
                      <button type="button" className="ob-mini" onClick={share}>
                        <img className="mono" src={obicons.share} alt="" width="14" height="14" />
                        {copied === "share" ? "Copied" : "Share"}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="ob-banner ob-banner--orange">
                  <img src={obicons.alert} alt="" width="16" height="16" />
                  <span>
                    <strong>Send only BTC on the Bitcoin network.</strong> Other coins or networks may result in lost funds.
                  </span>
                </p>
              </div>
            </div>
            <dl className="ob-details">
              <div>
                <dt>Minimum deposit</dt>
                <dd>{DEPOSIT.min}</dd>
              </div>
              <div>
                <dt>Confirmations</dt>
                <dd>{DEPOSIT.confirmations} blocks</dd>
              </div>
              <div>
                <dt>Arrives in</dt>
                <dd>{DEPOSIT.arrives}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="ob-banner ob-banner--grey">
            <img className="mono" src={obicons.info} alt="" width="16" height="16" />
            <span>
              {method === "Card"
                ? "Card deposits open in a secure checkout from the Trade page."
                : "Bank transfers can take 1–3 business days. You’ll find our account details on the Portfolio page."}
            </span>
          </p>
        )}
        <Actions>
          {method === "Crypto" ? (
            <Primary onClick={() => go("deposit-pending")}>I’ve sent it</Primary>
          ) : (
            <Primary onClick={() => go(method === "Card" ? "trade" : "portfolio")}>Continue</Primary>
          )}
          <Ghost onClick={() => setMethod(method === "Crypto" ? "Card" : "Crypto")}>
            {method === "Crypto" ? "Pay with card or bank instead" : "Deposit crypto instead"}
          </Ghost>
        </Actions>
      </section>
      <Help />
    </Wizard>
  );
}

/* 13 · Deposit on its way -------------------------------------------------- */

export function DepositPending() {
  const [blocks, setBlocks] = useState(1);
  const [copied, copy] = useCopy();
  const total = DEPOSIT.confirmations;
  const credited = blocks >= total;

  useEffect(() => {
    if (credited) {
      markDone("deposit");
      const id = setTimeout(() => go("all-set"), 1800);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setBlocks((b) => b + 1), 4000);
    return () => clearTimeout(id);
  }, [blocks, credited]);

  return (
    <Wizard step="deposit" progress={1260 / 1440}>
      <section className="ob-card ob-card--hero">
        <img className="ob-ill" src={obicons.illDeposit} alt="" width="185" height="174" />
        <div className="ob-stack">
          <Title title="Your deposit is on its way">
            We’ve spotted your transaction on the blockchain. It’ll land in your account once it’s confirmed.
          </Title>
          <div className="ob-stack ob-stack--28">
            <div className="ob-stack ob-stack--16">
              <div className="ob-amount">
                <span className="ob-amount__row">
                  <span className="ob-amount__coin">B</span>
                  <span className="ob-amount__value">{DEPOSIT.amount}</span>
                </span>
                <span className="ob-amount__fiat">{DEPOSIT.fiat}</span>
              </div>
              <div className="ob-tracker" role="status" aria-live="polite">
                <div className="ob-stage is-done">
                  <span className="ob-stage__bar" />
                  <span className="ob-stage__label">
                    <span className="ob-ok ob-ok--16">
                      <img src={obicons.ok} alt="" width="14" height="14" />
                    </span>
                    Detected
                  </span>
                  <span className="ob-stage__sub">10:41 AM</span>
                </div>
                <div className={`ob-stage${credited ? " is-done" : " is-current"}`}>
                  <span className="ob-stage__bar">
                    <span style={{ width: `${(Math.min(blocks, total) / total) * 100}%` }} />
                  </span>
                  <span className="ob-stage__label">
                    {credited && (
                      <span className="ob-ok ob-ok--16">
                        <img src={obicons.ok} alt="" width="14" height="14" />
                      </span>
                    )}
                    Confirming
                  </span>
                  <span className="ob-stage__sub">
                    {Math.min(blocks, total)} of {total} blocks
                  </span>
                </div>
                <div className={`ob-stage${credited ? " is-done" : ""}`}>
                  <span className="ob-stage__bar" />
                  <span className="ob-stage__label">
                    {credited && (
                      <span className="ob-ok ob-ok--16">
                        <img src={obicons.ok} alt="" width="14" height="14" />
                      </span>
                    )}
                    Credited
                  </span>
                  <span className="ob-stage__sub">{credited ? "Just now" : "~20 min"}</span>
                </div>
              </div>
            </div>
            <div className="ob-tx">
              <span className="ob-tx__left">
                <span className="ob-tx__label">Transaction ID</span>
                <button type="button" className="ob-tx__id" onClick={() => copy("tx", DEPOSIT.txId)}>
                  {copied === "tx" ? "Copied" : DEPOSIT.txId}
                  <img className="mono" src={obicons.copy} alt="" width="14" height="14" />
                </button>
              </span>
              <a className="ob-link ob-tx__explorer" href="https://mempool.space" target="_blank" rel="noreferrer">
                View on explorer
                <img src={obicons.open} alt="" width="12" height="12" />
              </a>
            </div>
          </div>
        </div>
        <div className="ob-stack">
          <p className="ob-banner ob-banner--grey">
            <img className="mono" src={obicons.bell} alt="" width="16" height="16" />
            <span>We’ll notify you when it arrives. You can safely leave this page.</span>
          </p>
          <Actions>
            <Primary onClick={() => go("overview")}>Go to dashboard</Primary>
          </Actions>
        </div>
      </section>
      <Help />
    </Wizard>
  );
}

/* 14 · All set -------------------------------------------------------------- */

export function AllSet() {
  return (
    <Wizard step="done" progress={1} className="ob-page--done">
      <img className="ob-confetti" src={obicons.confetti} alt="" aria-hidden="true" />
      <section className="ob-card ob-card--done">
        <img className="ob-ill" src={obicons.illTrophy} alt="" width="185" height="174" />
        <div className="ob-done-title">
          <h1 className="ob-title__h ob-title__h--32">You’re all set!</h1>
          <p className="ob-title__sub">Your Zentra account is fully set up. Time to make your first move.</p>
        </div>
        <div className="ob-ticket">
          <span className="ob-ticket__icon">
            <img src={obicons.ticket} alt="" width="24" height="24" />
          </span>
          <span className="ob-ticket__text">
            <span className="ob-ticket__title">0% fees on your first trade</span>
            <span className="ob-ticket__sub">Reward unlocked · valid for 30 days</span>
          </span>
        </div>
        <ul className="ob-summary">
          {SETUP_STEPS.map((s) => (
            <li key={s.key}>
              <span className="ob-ok ob-ok--24">
                <img src={obicons.ok} alt="" width="14" height="14" />
              </span>
              {s.label}
            </li>
          ))}
        </ul>
        <div className="ob-mobile-help ob-mobile-help--done">
          <Help />
        </div>
        <Actions>
          <Primary onClick={() => go("trade")}>Start trading</Primary>
          <Ghost onClick={() => go("overview")}>Explore dashboard</Ghost>
        </Actions>
      </section>
      <div className="ob-desktop-help">
        <Help />
      </div>
    </Wizard>
  );
}
