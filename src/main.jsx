import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Big screens: the layout is designed on a 1440 px wide frame. Above that, scale
// the whole UI so the frame fills the screen width. Tables and cards then keep
// their designed proportions instead of spreading out with large gaps; the page
// simply scrolls a little more on short screens. On very wide, short screens
// (ultrawide monitors) the zoom is capped so at least 720 px of height stays
// visible, and the layout takes the extra width.
const DESIGN_W = 1440;
const MIN_VISIBLE_H = 720;

function fitToScreen() {
  const root = document.documentElement;
  const { innerWidth: w, innerHeight: h } = window;
  const zoom = w > DESIGN_W ? Math.max(1, Math.min(w / DESIGN_W, h / MIN_VISIBLE_H)) : 1;
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
