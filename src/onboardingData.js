// Onboarding after sign-up (Figma 804:60811 – 804:62442, mobile 804:62703 – 804:63469).
const a = (name) => `/assets/${name}`;

export const obicons = {
  plant: a("ob-plant.svg"),
  moving: a("ob-moving.svg"),
  rocket: a("ob-rocket.svg"),
  flagBd: a("ob-flag-bd.svg"),
  select: a("ob-select.svg"),
  checkWhite: a("ob-check-white.svg"),
  doneCheck: a("ob-done-check.svg"),
  lock: a("ob-lock.svg"),
  lock14: a("ob-lock14.svg"),
  lockOpen: a("ob-lock-open.svg"),
  close: a("ob-close.svg"),
  schedule: a("ob-schedule.svg"),
  gift: a("ob-gift.png"),
  help: a("ob-help.svg"),
  chevron: a("ob-chevron.svg"),
  article: a("ob-article.svg"),
  selfie: a("ob-selfie.svg"),
  home: a("ob-home.svg"),
  stepCheck: a("ob-step-check.svg"),
  stepProgress: a("ob-step-progress.svg"),
  idPhoto: a("ob-id-photo.png"),
  fileOk: a("ob-file-ok.svg"),
  upload: a("ob-upload.svg"),
  camera: a("ob-camera.svg"),
  face: a("ob-face.png"),
  faceGuide: a("ob-face-guide.svg"),
  corners: a("ob-corners.svg"),
  liveDot: a("ob-live-dot.svg"),
  info: a("ob-info.svg"),
  tlCheck: a("ob-tl-check.svg"),
  tlCurrent: a("ob-tl-current.svg"),
  tlNext: a("ob-tl-next.svg"),
  wallet: a("ob-wallet.svg"),
  qr: a("ob-qr.png"),
  wait: a("ob-wait.svg"),
  renew: a("ob-renew.svg"),
  metamask: a("ob-metamask.svg"),
  trust: a("ob-trust.svg"),
  coinbase: a("ob-coinbase.svg"),
  rainbow: a("ob-rainbow.svg"),
  copy13: a("ob-copy13.svg"),
  ethDot: a("ob-eth-dot.svg"),
  permYes: a("ob-perm-yes.svg"),
  permNo: a("ob-perm-no.svg"),
  btc: a("ob-btc.svg"),
  btcDot: a("ob-btc-dot.svg"),
  arrow: a("ob-arrow.svg"),
  copy: a("ob-copy.svg"),
  share: a("ob-share.svg"),
  alert: a("ob-alert.svg"),
  qrBtc: a("ob-qr-btc.png"),
  ok: a("ob-ok16.svg"),
  open: a("ob-open.svg"),
  bell: a("ob-bell.svg"),
  ticket: a("ob-ticket.svg"),
  confetti: a("ob-confetti.svg"),
  illId: a("ob-ill-id.svg"),
  illReview: a("ob-ill-review.svg"),
  illWallet: a("ob-ill-wallet.svg"),
  illDeposit: a("ob-ill-deposit.svg"),
  illTrophy: a("ob-ill-trophy.svg"),
};

// The four setup steps shown in the drawer, the wizard bar and the celebration.
export const SETUP_STEPS = [
  { key: "email", label: "Email", title: "Verify email", route: "verify-email" },
  {
    key: "identity",
    label: "Identity",
    title: "Verify identity",
    desc: "About 3 min · unlocks withdrawals",
    route: "verify-identity",
  },
  { key: "wallet", label: "Wallet", title: "Connect wallet", desc: "MetaMask, Trust Wallet and more", route: "connect-wallet" },
  { key: "deposit", label: "Deposit", title: "Make your first deposit", desc: "Crypto, card or bank transfer", route: "deposit" },
];

export const EXPERIENCE = [
  { key: "beginner", label: "Beginner", sub: "New to crypto", icon: obicons.plant },
  { key: "intermediate", label: "Intermediate", sub: "Trade sometimes", icon: obicons.moving },
  { key: "pro", label: "Pro", sub: "Trade every day", icon: obicons.rocket },
];

export const COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "Singapore",
  "Australia",
];

export const ID_TYPES = ["Passport", "National ID", "Driving licence"];

export const WALLETS = [
  { name: "MetaMask", icon: obicons.metamask, tone: "orange" },
  { name: "Trust Wallet", icon: obicons.trust, tone: "blue" },
  { name: "Coinbase", icon: obicons.coinbase, tone: "blue" },
  { name: "Rainbow", icon: obicons.rainbow, tone: "purple" },
];

export const DEPOSIT = {
  coin: "Bitcoin · BTC",
  network: "Bitcoin",
  address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  min: "0.0001 BTC",
  confirmations: 3,
  arrives: "~30 min",
  amount: "0.1 BTC",
  fiat: "≈ $9,618.32",
  txId: "8f3c2e…d7a91e",
};

// Progress is kept for the browser session so the drawer, sidebar card and wizard agree.
// Anyone on the dashboard is signed in, so the email step starts as done.
const KEY = "zentra-onboarding";
const START = { email: true, identity: false, wallet: false, deposit: false };

export function readProgress() {
  try {
    return { ...START, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...START };
  }
}

export function markDone(step) {
  const next = { ...readProgress(), [step]: true };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  return next;
}

export function readEmail() {
  try {
    return sessionStorage.getItem("zentra-signup-email") || "";
  } catch {
    return "";
  }
}

export const go = (route) => {
  window.location.hash = route === "overview" ? "#/" : `#/${route}`;
};
