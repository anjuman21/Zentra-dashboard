import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Big screens: the layout is designed on a 1440 × 1024 frame. From 1600px wide,
// scale the whole UI so that frame fills the screen height (never shrinking),
// instead of stretching cards across a mostly empty 4K canvas.
const DESIGN_W = 1440;
const DESIGN_H = 1024;
const BIG_SCREEN = 1600;

function fitToScreen() {
  const root = document.documentElement;
  const { innerWidth: w, innerHeight: h } = window;
  const zoom = w >= BIG_SCREEN ? Math.max(1, Math.min(w / DESIGN_W, h / DESIGN_H)) : 1;
  root.style.zoom = zoom === 1 ? "" : String(zoom);
  root.style.setProperty("--app-h", `${h / zoom}px`);
}

fitToScreen();
window.addEventListener("resize", fitToScreen);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
