"use strict";
/* Runs after every part has added its scenes. */
/* Scenes are authored on a relaxed timeline; the video plays it SPEED
   times faster. All times exported below are in video seconds. */
const SPEED = 1.6;
const TOTAL = CURSOR / SPEED;
TWMAP = GLOBAL;
tw(prog, "w", 0, 100, 0, CURSOR, "linear");
PARTS.forEach(p => {
  if (p.start > 0) E(stage, "ptick", "", { left: p.start / CURSOR * 1920 - 1,
    top: 1071 });
});
const seekVideo = t => seekTimeline(t * SPEED);

window.TOTAL = TOTAL;
window.SCENES = SCENES.map(s => ({ start: s.start / SPEED, end: s.end / SPEED,
  name: s.name, part: s.part }));
window.PARTS = PARTS.map(p => ({ no: p.no, title: p.title,
  start: p.start / SPEED }));
window.seek = seekVideo;

/* ---------- preview mode (open the file in a browser) ----------
   Space: pause/play   Left/Right: -/+5 s   N/P: next/previous part
   The current time is kept in the address bar as #t=123.4            */
const RENDER = location.search.includes("render");
if (!RENDER) {
  const fit = () => {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `scale(${k})`;
  };
  addEventListener("resize", fit); fit();
  const hud = document.createElement("div");
  Object.assign(hud.style, { position: "fixed", right: "10px", top: "8px",
    font: "12px Consolas,monospace", color: "#8b96a5", zIndex: 9 });
  document.body.appendChild(hud);
  let paused = false, at = 0;
  const m = location.hash.match(/t=([\d.]+)/);
  if (m) at = parseFloat(m[1]);
  let t0 = performance.now() - at * 1000;
  const jump = v => { at = Math.max(0, Math.min(TOTAL - .01, v));
    t0 = performance.now() - at * 1000; };
  addEventListener("keydown", e => {
    if (e.code === "Space") { paused = !paused; jump(at); }
    if (e.code === "ArrowRight") jump(at + 5);
    if (e.code === "ArrowLeft") jump(at - 5);
    if (e.code === "KeyN") {
      const n = window.PARTS.find(p => p.start > at + .5); if (n) jump(n.start);
    }
    if (e.code === "KeyP") {
      const prev = window.PARTS.filter(p => p.start < at - 1).pop();
      jump(prev ? prev.start : 0);
    }
  });
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const loop = now => {
    if (!paused) at = ((now - t0) / 1000) % TOTAL;
    seekVideo(at);
    hud.textContent = `${fmt(at)} / ${fmt(TOTAL)}${paused ? "  (paused)" : ""}`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
} else {
  seekVideo(0);
}
document.fonts.ready.then(() => { window.READY = true; });
