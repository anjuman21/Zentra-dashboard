// Content for the onboarding auth screens (Figma frames 804:60688, 804:60729, 804:60770; mobile 804:62575, 804:62621, 804:62663).
const a = (name) => `/assets/${name}`;

export const auicons = {
  google: a("au-google.svg"),
  apple: a("au-apple.svg"),
  eye: a("au-eye.svg"),
  check: a("au-check.svg"),
  shield: a("au-shield.svg"),
  info: a("au-info.svg"),
  back: a("au-back.svg"),
  arc: a("au-arc.svg"),
  dots: a("au-dots.png"),
  glow: a("au-glow.svg"),
  glowWarm: a("au-glow-warm.svg"),
  glowCards: a("au-glow-cards.svg"),
  nodeLeft: a("au-node-1.png"),
  nodeRight: a("au-node-2.png"),
};

// The brand panel carousel: the featured quote sits in the middle, its neighbours fade at the sides.
export const testimonials = [
  {
    quote:
      "“Zentra replaced three apps for me. I track my portfolio, swap coins and set alerts in one place, and the fees are always clear before I confirm.”",
    name: "Arif Chowdhury",
    role: "Day trader · 2 yrs on Zentra",
    avatar: a("au-av-arif.png"),
  },
  {
    quote: "“Price alerts caught the dip for me while I was asleep. Clean and fast.”",
    name: "Lena Park",
    role: "Swing trader",
    avatar: a("au-av-lena.svg"),
  },
  {
    quote: "“Staking rewards land every week and the history page shows exactly where each one came from.”",
    name: "Sadia Jahan",
    role: "Long-term staker",
    avatar: a("au-node-2.png"),
  },
  {
    quote: "“Converting BTC to ETH took two taps. I finally stopped juggling three exchanges.”",
    name: "Rafi Hasan",
    role: "Long-term holder",
    avatar: a("au-av-rafi.svg"),
  },
];

export const brandStats = [
  { value: "120K+", label: "Active traders" },
  { value: "40+", label: "Supported coins" },
  { value: "$2.1B", label: "Monthly volume" },
];

// 0–4 bars: length, mixed case, a digit and a symbol each add one.
export function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  score = Math.max(1, pw.length < 8 ? Math.min(score, 1) : score);
  const label = ["", "Weak", "Fair", "Strong", "Very strong"][score];
  const tone = score <= 1 ? "weak" : score === 2 ? "fair" : "strong";
  return { score, label, tone };
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
