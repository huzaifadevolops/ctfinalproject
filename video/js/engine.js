"use strict";
/* =====================================================================
   Deterministic timeline engine for the long explainer.

   Every animated value is a pure function of time, so seek(t) can jump
   to any frame. Each scene keeps its own list of tweens and is hidden
   (display:none) outside its time range, so a 30-minute timeline costs
   no more per frame than a short one.

   Scenes are appended one after another with addScene(name, dur, build);
   build(sc, s) receives the scene's root element and its start time.
   ===================================================================== */
const stage = document.getElementById("stage");
const GLOBAL = new Map();
let TWMAP = GLOBAL;
const EASE = {
  linear: p => p,
  out: p => 1 - Math.pow(1 - p, 3),
  inOut: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  back: p => { const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
};
function tw(el, prop, from, to, start, dur = .6, ease = "out") {
  let m = TWMAP.get(el);
  if (!m) { m = {}; TWMAP.set(el, m); }
  (m[prop] = m[prop] || []).push({ from, to, start, dur, ease });
  m[prop].sort((a, b) => a.start - b.start);
  return el;
}
function valueAt(list, t) {
  let v = list[0].from;
  for (const k of list) {
    if (t < k.start) break;
    if (typeof k.from === "string") { v = k.to; continue; }
    const p = k.dur <= 0 ? 1 : Math.min(1, (t - k.start) / k.dur);
    v = k.from + (k.to - k.from) * EASE[k.ease](p);
  }
  return v;
}
function apply(el, v) {
  if ("opacity" in v) {
    el.style.opacity = v.opacity;
    el.style.visibility = v.opacity <= .002 ? "hidden" : "visible";
  }
  if ("x" in v || "y" in v || "scale" in v || "rot" in v) {
    el.style.transform = `translate(${v.x || 0}px,${v.y || 0}px) ` +
      `scale(${v.scale === undefined ? 1 : v.scale}) rotate(${v.rot || 0}deg)`;
  }
  if ("type" in v) {
    const full = el.dataset.full, n = Math.round(v.type);
    el.textContent = full.slice(0, n) + (n > 0 && n < full.length ? "▌" : "");
  }
  if ("draw" in v) el.style.strokeDashoffset = 1 - v.draw;
  if ("w" in v) el.style.width = v.w + "%";
  if ("txt" in v) el.textContent = v.txt;
  if ("html" in v) el.innerHTML = v.html;
  if ("bg" in v) el.style.background = v.bg;
  if ("color" in v) el.style.color = v.color;
}
function applyMap(map, t) {
  for (const [el, props] of map) {
    const v = {};
    for (const p in props) v[p] = valueAt(props[p], t);
    apply(el, v);
  }
}

/* ---------- scenes and parts ---------- */
const SCENES = [];
const PARTS = [];
let CURSOR = 0;
let PART = null;
function part(no, title) {
  PART = { no, title, start: CURSOR };
  PARTS.push(PART);
}
function addScene(name, dur, build) {
  const start = CURSOR, end = CURSOR + dur;
  const el = group(stage);
  el.style.display = "none";
  const rec = { start, end, name, el, tw: new Map(), on: false,
    part: PART ? PART.no : 0 };
  SCENES.push(rec);
  const prev = TWMAP;
  TWMAP = rec.tw;
  tw(el, "opacity", 0, 1, start, .6);
  tw(el, "opacity", 1, 0, end - .6, .6);
  tw(el, "scale", 1.012, 1, start, 1.4);
  build(el, start, end);
  TWMAP = prev;
  CURSOR = end;
  if (PART) partLabel(rec, name);
  return rec;
}
function seekTimeline(t) {
  for (const sc of SCENES) {
    const on = t >= sc.start && t < sc.end;
    if (on !== sc.on) { sc.el.style.display = on ? "block" : "none"; sc.on = on; }
    if (on) applyMap(sc.tw, t);
  }
  applyMap(GLOBAL, t);
}

/* ---------- element helpers ---------- */
const NOPX = new Set(["opacity", "zIndex", "fontWeight", "flex"]);
function E(parent, cls, html, css) {
  const d = document.createElement("div");
  if (cls) d.className = cls;
  if (html !== undefined && html !== null) d.innerHTML = html;
  if (css) for (const k in css) {
    const val = css[k];
    const unitless = NOPX.has(k) || (k === "lineHeight" && val < 5);
    d.style[k] = typeof val === "number" && !unitless ? val + "px" : val;
  }
  parent.appendChild(d);
  return d;
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
function fadeIn(el, t, dur = .6, dy = 24) {
  tw(el, "opacity", 0, 1, t, dur);
  if (dy) tw(el, "y", dy, 0, t, dur);
  return el;
}
function fadeOut(el, t, dur = .45) { return tw(el, "opacity", 1, 0, t, dur); }
function pop(el, t, dur = .5) {
  tw(el, "opacity", 0, 1, t, dur * .5);
  tw(el, "scale", .4, 1, t, dur, "back");
  return el;
}
function slideIn(el, t, dx = -30, dur = .5) {
  tw(el, "opacity", 0, 1, t, dur);
  tw(el, "x", dx, 0, t, dur);
  return el;
}
function typeText(el, text, t, cps = 26) {
  el.dataset.full = text;
  tw(el, "type", 0, text.length, t, text.length / cps, "linear");
  return el;
}
function group(parent) {
  return E(parent, "", "", { left: 0, top: 0, width: 1920, height: 1080 });
}
/* Show a group only between t0 and t1 (inside one scene). */
function phase(sc, t0, t1) {
  const g = group(sc);
  tw(g, "opacity", 0, 1, t0, .5);
  if (t1) tw(g, "opacity", 1, 0, t1 - .45, .45);
  return g;
}

/* ---------- headers, captions, narration ---------- */
const STATUS = {
  built: "BUILT", partial: "PARTLY BUILT", outline: "OUTLINE · TO BUILD",
  spec: "SPECIFICATION", doc: "DOCUMENT",
};
function header(sc, t, kick, status, title, sub) {
  fadeIn(E(sc, "kicker", kick, { left: 120, top: 70 }), t + .1, .5, 10);
  if (status) fadeIn(E(sc, "chip " + status, STATUS[status],
    { right: 120, top: 64 }), t + .4, .5, 10);
  fadeIn(E(sc, "title", title, { left: 118, top: 100 }), t + .2, .6, 16);
  if (sub) fadeIn(E(sc, "sub", sub, { left: 122, top: 188 }), t + .45, .6, 12);
}
function caption(sc, t0, t1, html) {
  const c = E(sc, "caption", html, { left: 0, top: 982, width: 1920 });
  fadeIn(c, t0, .5, 10);
  if (t1) fadeOut(c, t1, .4);
  return c;
}
/* Spread caption lines evenly over [t0, t1]. */
function narrate(sc, t0, t1, lines) {
  const seg = (t1 - t0) / lines.length;
  lines.forEach((l, i) => caption(sc, t0 + i * seg + .2,
    i === lines.length - 1 ? t1 - .8 : t0 + (i + 1) * seg - .25, l));
}

/* ---------- code blocks with syntax colouring ---------- */
const KW = "def|return|for|in|if|elif|else|from|import|raise|not|None|True|" +
  "False|continue|while|try|except|and|or|is|as|with|class|lambda|break|pass";
function hl(line) {
  const re = new RegExp(`(#.*$)|("""[^"]*"""|"[^"]*"|'[^']*')|\\b(${KW})\\b|\\b(\\d+)\\b`, "g");
  let out = "", last = 0, m;
  while ((m = re.exec(line))) {
    out += esc(line.slice(last, m.index));
    const cls = m[1] ? "c-com" : m[2] ? "c-str" : m[3] ? "c-kw" : "c-num";
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = re.lastIndex;
  }
  return out + esc(line.slice(last));
}
function code(parent, x, y, lines, o = {}) {
  const fs = o.fs || 24, lh = o.lh || Math.round(fs * 1.58), pad = o.pad || 26;
  const longest = Math.max(...lines.map(l => l.length));
  const w = o.w || Math.round(longest * fs * .555 + pad * 2 + 8);
  const h = lines.length * lh + pad * 2;
  const card = E(parent, "card", "", { left: x, top: y, width: w, height: h });
  const bar = E(card, "hlbar", "", { left: 0, top: pad, width: w - 2, height: lh,
    opacity: 0 });
  const L = lines.map((s, i) => E(card, "code", hl(s), { left: pad,
    top: pad + i * lh, fontSize: fs, lineHeight: lh }));
  let cur = null;
  function focus(i, t) {
    if (cur === null) {
      tw(bar, "y", i * lh, i * lh, t, 0);
      tw(bar, "opacity", 0, 1, t, .3);
    } else tw(bar, "y", cur * lh, i * lh, t, .3, "inOut");
    cur = i;
  }
  function unfocus(t) { tw(bar, "opacity", 1, 0, t, .3); cur = null; }
  return { card, lines: L, focus, unfocus, w, h, lh, pad };
}

/* ---------- reusable blocks ---------- */
/* Numbered steps in a flowing column (text may wrap). */
function steps(parent, x, y, w, list, t, gap = 2.6, o = {}) {
  const col = E(parent, "col", "", { left: x, top: y, width: w });
  return list.map((txt, i) => {
    const row = E(col, "srow", `<div class="num">${o.marks ? o.marks[i] : i + 1}</div>` +
      `<div class="stxt">${txt}</div>`, { fontSize: o.fs || 25 });
    slideIn(row, t + i * gap, -24, .45);
    return row;
  });
}
/* Bullet list in a flowing column. */
function bullets(parent, x, y, w, list, t, gap = .5, o = {}) {
  const col = E(parent, "col", "", { left: x, top: y, width: w });
  return list.map((txt, i) => {
    const row = E(col, "brow", `<div class="dot"></div><div class="stxt">${txt}</div>`,
      { fontSize: o.fs || 25 });
    slideIn(row, t + i * gap, -20, .45);
    return row;
  });
}
/* call -> result examples. rows: [call, result, cls] */
function examples(parent, x, y, w, rows, t, gap = 1.2, o = {}) {
  const card = E(parent, "card", "", { left: x, top: y, width: w,
    height: (o.lh || 56) * rows.length + 84 });
  fadeIn(card, t, .5, 14);
  E(card, "lbl a", o.title || "EXAMPLES", { left: 28, top: 22, fontSize: 18,
    letterSpacing: ".12em" });
  rows.forEach(([call, res, cls], i) => {
    const r = E(card, "exrow", `<span class="excall">${esc(call)}</span>` +
      `<span class="exarr">→</span><span class="exres ${cls || "g"}">${esc(res)}</span>`,
      { left: 28, top: 64 + i * (o.lh || 56), fontSize: o.fs || 23 });
    fadeIn(r, t + .4 + i * gap, .4, 8);
  });
  return card;
}
function chipRow(parent, x, y, items, t, o = {}) {
  const row = E(parent, "chiprow wrapflex", items.map(([cls, txt]) =>
    `<span class="chip sm ${cls}">${txt}</span>`).join(""),
    { left: x, top: y, width: o.w || 1680 });
  fadeIn(row, t, .5, 10);
  return row;
}
function card(parent, x, y, w, h, html, o = {}) {
  const c = E(parent, "card" + (o.cls ? " " + o.cls : ""), html || "",
    Object.assign({ left: x, top: y, width: w, height: h }, o.css || {}));
  return c;
}
/* A labelled box: title (mono, coloured) and a description below. */
function infoBox(parent, x, y, w, h, title, desc, col = "blue", o = {}) {
  return card(parent, x, y, w, h,
    `<div class="lbl" style="left:24px;top:18px;font-size:${o.tfs || 24}px;color:var(--${col})">${title}</div>` +
    `<div class="tdesc wrap" style="left:24px;top:${o.dtop || 58}px;width:${w - 48}px;font-size:${o.dfs || 20}px;line-height:1.35">${desc}</div>`,
    { css: { borderTop: `4px solid var(--${col})` } });
}

/* ---------- chess boards ---------- */
const FILES = "abcdefgh";
const GLY = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞",
  p: "♟" };
const glyph = ch => GLY[ch.toLowerCase()] + "︎";
const START = ["rnbqkbnr", "pppppppp", "........", "........", "........",
  "........", "PPPPPPPP", "RNBQKBNR"];
const EMPTY8 = ["........", "........", "........", "........", "........",
  "........", "........", "........"];
function makeBoard(parent, x, y, sq, rows, o = {}) {
  const n = o.size || 8;
  const B = { x, y, sq, n, pieces: {}, cells: [], labels: [] };
  B.el = E(parent, "board", "", { left: x, top: y, width: sq * n, height: sq * n });
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    B.cells.push(E(B.el, "cell " + ((r + c) % 2 ? "dark" : "light"), "",
      { left: c * sq, top: r * sq, width: sq, height: sq }));
  if (o.labels !== false && n === 8) for (let i = 0; i < 8; i++) {
    B.labels.push(E(parent, "blabel", FILES[i], { left: x + i * sq,
      top: y + sq * 8 + 6, width: sq, textAlign: "center",
      fontSize: Math.max(14, Math.round(sq * .3)) }));
    B.labels.push(E(parent, "blabel", String(8 - i), { left: x - 28,
      top: y + i * sq + sq / 2 - 12, width: 20, textAlign: "right",
      fontSize: Math.max(14, Math.round(sq * .3)) }));
  }
  B.under = E(B.el, "", "", { left: 0, top: 0, width: sq * n, height: sq * n });
  if (rows) rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch !== ".") B.pieces[r + "," + c] = addPiece(B, ch, r, c);
  }));
  B.over = E(B.el, "", "", { left: 0, top: 0, width: sq * n, height: sq * n });
  B.cx = c => x + c * sq + sq / 2;
  B.cy = r => y + r * sq + sq / 2;
  return B;
}
function addPiece(B, ch, r, c, extra = "") {
  return E(B.el, "piece " + (ch === ch.toUpperCase() ? "pw" : "pb") + " " + extra,
    glyph(ch), { left: c * B.sq, top: r * B.sq, width: B.sq, height: B.sq,
      fontSize: Math.round(B.sq * .8), lineHeight: B.sq });
}
function mark(B, r, c, kind) {
  const layer = kind === "x" || kind === "scan" ? B.over : B.under;
  const m = E(layer, "mk " + kind, kind === "x" ? "✕" : "",
    { left: c * B.sq, top: r * B.sq, width: B.sq, height: B.sq });
  if (kind === "x") m.style.fontSize = Math.round(B.sq * .6) + "px";
  return m;
}
function marks(B, list, kind, t, gap = .08) {
  return list.map(([r, c], i) => pop(mark(B, r, c, kind), t + i * gap, .4));
}
function boardIn(B, t, wave = .045) {
  B.cells.forEach((cell, i) => {
    const r = Math.floor(i / B.n), c = i % B.n, d = t + (r + c) * wave;
    tw(cell, "opacity", 0, 1, d, .35);
    tw(cell, "scale", .3, 1, d, .5, "back");
  });
  B.labels.forEach(l => fadeIn(l, t + .6, .5, 0));
  Object.values(B.pieces).forEach((p, i) => {
    const d = t + .7 + i * .025;
    tw(p, "opacity", 0, 1, d, .3);
    tw(p, "y", -40, 0, d, .5, "back");
  });
}
function boardFade(B, t) {
  fadeIn(B.el, t, .6, 20);
  B.labels.forEach(l => fadeIn(l, t, .6, 20));
  return B;
}
/* Slide a piece from one square to another. */
function movePiece(B, from, to, t, dur = .6) {
  const p = B.pieces[from[0] + "," + from[1]];
  tw(p, "x", 0, (to[1] - from[1]) * B.sq, t, dur, "inOut");
  tw(p, "y", 0, (to[0] - from[0]) * B.sq, t, dur, "inOut");
  return p;
}
function sqName(r, c) { return FILES[c] + (8 - r); }

/* ---------- SVG ---------- */
const NS = "http://www.w3.org/2000/svg";
function svgLayer(parent) {
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("width", 1920); s.setAttribute("height", 1080);
  Object.assign(s.style, { position: "absolute", left: 0, top: 0,
    overflow: "visible", pointerEvents: "none" });
  parent.appendChild(s);
  return s;
}
const COL = { blue: "#6aa9ff", red: "#ff6b6b", green: "#4cc38a",
  muted: "#8b96a5", amber: "#f0b44c", violet: "#b48cff" };
function path(svg, d, color, o = {}) {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d); p.setAttribute("fill", "none");
  p.setAttribute("stroke", COL[color] || color);
  p.setAttribute("stroke-width", o.w || 5);
  p.setAttribute("stroke-linecap", "round");
  if (o.dash) p.setAttribute("stroke-dasharray", o.dash);
  else {
    p.setAttribute("pathLength", "1");
    p.style.strokeDasharray = "1"; p.style.strokeDashoffset = "0";
  }
  if (o.arrow) p.setAttribute("marker-end", `url(#ah-${o.arrow})`);
  svg.appendChild(p);
  return p;
}
function draw(p, t, dur = .7) {
  tw(p, "opacity", 0, 1, t, .1);
  tw(p, "draw", 0, 1, t, dur, "inOut");
  return p;
}
function line(svg, x1, y1, x2, y2, color, t, o = {}) {
  const p = path(svg, `M${x1} ${y1} L${x2} ${y2}`, color,
    { w: o.w, arrow: o.arrow === false ? null : (o.arrow || color) });
  return draw(p, t, o.dur || .6);
}

/* ---------- function scene template ----------
   o = { mod, name, pos, status, job, sig, code, plan, planLabel, gap,
         focus (line index per plan step), visual(sc, s, t0), visDur,
         reqs, tests, usedBy, caps, dur, codeFs }
*/
function fnScene(o) {
  const plan = o.plan || [];
  const gap = o.gap || 3.4;
  const planStart = 2.6;
  const planEnd = planStart + plan.length * gap;
  const dur = o.dur || Math.max(18, planEnd + 8, (o.visDur || 0) + 5);
  addScene(o.mod + "." + o.name, dur, (sc, s) => {
    const kick = `${o.mod}${o.pos ? " · " + o.pos : ""}`;
    header(sc, s, esc(kick), o.status, `<span class="fname">${esc(o.name)}</span>`,
      o.job);
    const lines = o.code || [o.sig,
      ...(o.status === "outline" ? [`    """${o.doc || "…plan in the docstring…"}"""`,
        `    raise NotImplementedError("${o.mod.replace(".py", "")}.${o.name}")`] : [])];
    const wide = o.layout === "code";
    const c = code(sc, 120, 268, lines, { fs: o.codeFs || (wide ? 19 : 22),
      w: wide ? 980 : 860 });
    fadeIn(c.card, s + .7, .5, 14);
    if (o.status === "outline" && !o.code) {
      tw(c.lines[lines.length - 1], "opacity", 0, .55, s + 1.2, .4);
    }
    const px = wide ? 1150 : 120, pw = wide ? 650 : 860;
    const py = wide ? 268 : 268 + c.h + 30;
    if (plan.length) {
      fadeIn(E(sc, "lbl a", o.planLabel || (o.status === "outline" ? "THE PLAN (FROM THE DOCSTRING)" : "HOW IT WORKS"),
        { left: px, top: py, fontSize: 18, letterSpacing: ".12em" }), s + planStart - .4, .4, 0);
      steps(sc, px, py + 40, pw, plan, s + planStart, gap, { fs: o.planFs || 24 });
      if (o.focus) o.focus.forEach((li, i) => {
        if (li !== null && li !== undefined) c.focus(li, s + planStart + i * gap);
      });
    }
    if (o.visual) o.visual(sc, s, s + (o.visAt || 1.6), dur);
    const ch = [];
    (o.reqs || []).forEach(r => ch.push(["spec", r]));
    (o.tests || []).slice(0, 3).forEach(r => ch.push(["testc", "✔ " + r]));
    (o.usedBy || []).slice(0, Math.max(1, 6 - ch.length)).forEach(r =>
      ch.push(["used", "used by " + r]));
    if (ch.length) chipRow(sc, 120, 918, ch, s + Math.min(dur - 4, planEnd + .4));
    if (o.caps) narrate(sc, s + .6, s + dur - .4, o.caps);
  });
}

/* Big chapter divider for each part. */
function partScene(no, title, sub, items, dur = 11) {
  part(no, title);
  addScene("part " + no, dur, (sc, s) => {
    fadeIn(E(sc, "partno", `PART ${no}`, { left: 160, top: 250 }), s + .3, .6, 20);
    fadeIn(E(sc, "hero", title, { left: 156, top: 300, fontSize: 96 }), s + .6, .7, 30);
    if (sub) fadeIn(E(sc, "herosub", sub, { left: 162, top: 430, fontSize: 34 }), s + 1.1, .6, 20);
    const ln = E(sc, "", "", { left: 162, top: 500, width: 0, height: 4,
      background: "linear-gradient(90deg,var(--blue),var(--green))" });
    tw(ln, "opacity", 0, 1, s + 1.2, .2);
    tw(ln, "w", 0, 34, s + 1.2, 1.2, "inOut");
    ln.style.width = "0";
    const wrapEl = E(sc, "", "", { left: 162, top: 540, width: 1600, height: 400 });
    (items || []).forEach((it, i) => {
      const colN = i % 3, rowN = Math.floor(i / 3);
      const el = E(wrapEl, "tag", it, { left: colN * 520, top: rowN * 64, fontSize: 22 });
      fadeIn(el, s + 1.8 + i * .18, .4, 12);
    });
  });
}

/* ---------- global overlays: progress bar + chapter label ---------- */
const prog = E(stage, "", "", { left: 0, top: 1075, height: 5, width: 0 });
prog.id = "prog";
const plabel = E(stage, "plabel", "", { left: 40, top: 1036 });
function partLabel(rec) {
  const prev = TWMAP;
  TWMAP = GLOBAL;
  tw(plabel, "html", "", `<b>PART ${PART.no}</b> · ${esc(PART.title)}`,
    rec.start, 0);
  TWMAP = prev;
}
