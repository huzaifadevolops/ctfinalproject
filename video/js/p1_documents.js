"use strict";
/* ===================== PART 1: DOCUMENTS ===================== */

partScene(1, "The project documents", "Four Markdown files hold the plan together",
  ["CLAUDE.md", "REQUIREMENTS.md", "MODULES.md", "PROMPTS.md"]);

addScene("CLAUDE.md", 34, (sc, s) => {
  header(sc, s, "DOCUMENT 1 OF 4", "doc", "CLAUDE.md",
    "Project instructions — the working rules plus the original proposal");
  const f = card(sc, 120, 280, 620, 620, "");
  fadeIn(f, s + .8, .6, 16);
  E(f, "lbl a", "CLAUDE.md", { left: 30, top: 24, fontSize: 20 });
  const sec = [["# Project Instructions", "#dfe6ee"], ["## Working Rules", "var(--blue)"],
    ["   1. Prompt log", "#9aa5b4"], ["   2. Module documentation", "#9aa5b4"],
    ["   3. Requirements", "#9aa5b4"], ["   4. Code style", "#9aa5b4"],
    ["   5. Tests", "#9aa5b4"], ["## Project Proposal", "var(--violet)"],
    ["   Description · Features", "#9aa5b4"], ["   Python features", "#9aa5b4"],
    ["   Structure · Testing", "#9aa5b4"], ["   Plan · Code quality", "#9aa5b4"]];
  sec.forEach(([t, c], i) => fadeIn(E(f, "tl", esc(t), { left: 30, top: 74 + i * 42, color: c, fontSize: 21 }), s + 1.2 + i * .1, .3, 0));
  const rules = [
    ["Prompt log", "Every prompt given to Claude goes into <code>PROMPTS.md</code>, word for word, with the date and what was done."],
    ["Module documentation", "When a module is added, removed or changes its job, <code>MODULES.md</code> is updated to match."],
    ["Requirements", "<code>REQUIREMENTS.md</code> is the specification. Code and tests mention IDs such as <code>FR-18</code>."],
    ["Code style", "Standard library only. Short single-purpose functions, clear names, docstrings, lines within 80 characters."],
    ["Tests", "Every rule gets tests in <code>tests/</code>, run with <code>python -m unittest discover -s tests</code>."],
  ];
  const col = E(sc, "col", "", { left: 800, top: 290, width: 1000 });
  col.style.gap = "18px";
  rules.forEach(([a, b], i) => {
    const r = E(col, "srow", `<div class="num">${i + 1}</div><div class="stxt"><b>${a}.</b> <span class="m">${b}</span></div>`, { fontSize: 25 });
    slideIn(r, s + 3 + i * 3.6, -24, .5);
  });
  narrate(sc, s + .6, s + 33.6, [
    "CLAUDE.md is read at the start of every session — it is the project's rulebook",
    "The five working rules keep code, documents and tests in step with each other",
    "Below the rules is the full original proposal, which every other document comes from",
  ]);
});

addScene("REQUIREMENTS.md overview", 32, (sc, s) => {
  header(sc, s, "DOCUMENT 2 OF 4", "doc", "REQUIREMENTS.md",
    "The proposal turned into numbered, checkable requirements");
  const secs = ["1  Purpose and scope", "2  Priorities", "3  Functional (FR)", "4  Error handling (EH)",
    "5  Technical (TR)", "6  Program structure", "7  Non-functional (NFR)", "8  Testing (TS)", "9  Milestones", "10 Team"];
  secs.forEach((t, i) => fadeIn(E(sc, "lbl", esc(t), { left: 130, top: 290 + i * 54, fontSize: 24,
    color: "#c9d2dc" }), s + .9 + i * .15, .4, 10));
  const data = [["FR", 33, "functional", "blue"], ["EH", 9, "error handling", "red"],
    ["TR", 5, "technical", "violet"], ["NFR", 7, "non-functional", "amber"], ["TS", 10, "testing", "green"]];
  data.forEach(([id, n, name, col], i) => {
    const y = 300 + i * 92, t = s + 3 + i * .7;
    fadeIn(E(sc, "lbl", id, { left: 760, top: y + 6, fontSize: 30, color: `var(--${col})` }), t, .4, 0);
    const bar = E(sc, "", "", { left: 880, top: y, width: 0, height: 48, borderRadius: "8px",
      background: `var(--${col})`, opacity: .85 });
    tw(bar, "w", 0, n / 33 * 42, t, .9, "inOut");
    bar.style.width = "0";
    fadeIn(E(sc, "lbl", `${n}  <span class="m" style="font-size:20px">${name}</span>`,
      { left: 880 + n / 33 * 806 + 20, top: y + 8, fontSize: 28 }), t + .8, .4, 0);
  });
  const pr = card(sc, 760, 780, 1040, 110, "");
  fadeIn(pr, s + 8, .6, 14);
  [["Must", "required for the final demo", "red"], ["Should", "planned for the final demo", "amber"],
    ["Could", "only if time allows", "green"]].forEach(([a, b, c], i) =>
    E(pr, "lbl", `<span style="color:var(--${c})">${a}</span> <span class="m" style="font-size:19px">${b}</span>`,
      { left: 30 + i * 340, top: 38, fontSize: 25 }));
  narrate(sc, s + .6, s + 31.6, [
    "Every requirement has an ID, a priority and a milestone",
    "64 requirements in five families — most of them describe what the game must do",
    "Priorities say what has to be ready for the final demo, and what is a bonus",
  ]);
});

addScene("functional requirements", 36, (sc, s) => {
  header(sc, s, "REQUIREMENTS.md · SECTION 3", "doc", "Functional requirements",
    "33 requirements in six groups");
  const groups = [
    ["3.1", "Board setup & display", "FR-01 – FR-05", "Start position, labels, redraw, symbols, whose turn", "INTERIM"],
    ["3.2", "Input & turn handling", "FR-06 – FR-09", "Type <code>e2 e4</code>, convert squares, alternate turns, own pieces only", "INTERIM"],
    ["3.3", "Piece movement", "FR-10 – FR-17", "All six pieces, sliding stops at pieces, never off the board", "INTERIM"],
    ["3.4", "Special moves", "FR-18 – FR-20", "Castling, en passant, pawn promotion", "FINAL"],
    ["3.5", "Legality & game state", "FR-21 – FR-25", "No self-check, announce check, checkmate, stalemate", "FINAL"],
    ["3.6", "Commands & extras", "FR-26 – FR-33", "Legal-move hints, history, undo, captures, save, load, help, quit", "FINAL"],
  ];
  groups.forEach(([n, name, ids, desc, ms], i) => {
    const colN = i % 2, rowN = Math.floor(i / 2);
    const x = 120 + colN * 850, y = 280 + rowN * 205;
    const col = ms === "INTERIM" ? "green" : "blue";
    const c = card(sc, x, y, 810, 180, "", { css: { borderLeft: `6px solid var(--${col})` } });
    E(c, "lbl", `<span class="m">${n}</span>  ${name}`, { left: 28, top: 22, fontSize: 27 });
    E(c, "lbl b", ids, { left: 28, top: 66, fontSize: 21 });
    E(c, "tdesc wrap", desc, { left: 28, top: 104, width: 600, fontSize: 21, lineHeight: 1.35 });
    E(c, "flag", ms, { right: 24, top: 22, fontSize: 14, color: `var(--${col})`,
      background: ms === "INTERIM" ? "rgba(76,195,138,.12)" : "rgba(106,169,255,.12)" });
    fadeIn(c, s + 1 + i * 2.6, .6, 18);
  });
  narrate(sc, s + .6, s + 35.6, [
    "The first three groups are due at the <b class=\"g\">interim demo</b>: a board, input and basic movement",
    "Special moves and full legality come at the <b class=\"b\">final demo</b>",
    "Each function's docstring names the requirement it satisfies, like <code>FR-07</code>",
  ]);
});

addScene("error handling", 34, (sc, s) => {
  header(sc, s, "REQUIREMENTS.md · SECTION 4", "doc", "Error handling",
    "The program must never crash on bad input");
  const rows = [
    ["EH-01", "Malformed input: e9 e4, hello, empty", "Invalid input. Type a move like e2 e4"],
    ["EH-02", "Starting square is empty", "There is no piece on e4."],
    ["EH-03", "Moving the opponent's piece", "That is not your piece."],
    ["EH-04", "Capturing your own piece", "You cannot capture your own piece."],
    ["EH-05", "Wrong pattern, or blocked", "A rook cannot move from a1 to a3."],
    ["EH-06", "Leaves own king in check", "That move would leave your king in check."],
    ["EH-07", "Bad promotion choice", "Please type q, r, b or n."],
    ["EH-08", "Undo with no moves", "Nothing to undo."],
    ["EH-09", "Missing / corrupt save file", "Line 2: not a valid move ..."],
  ];
  E(sc, "tbl th", "ID", { left: 130, top: 280 });
  E(sc, "tbl th", "SITUATION", { left: 290, top: 280 });
  E(sc, "tbl th", "WHAT THE PLAYER SEES", { left: 960, top: 280 });
  rows.forEach(([id, a, b], i) => {
    const y = 326 + i * 62;
    const r = E(sc, "", `<div class="tbl" style="left:0;top:0;color:var(--red)">${id}</div>` +
      `<div class="tbl" style="left:160px;top:0">${esc(a)}</div>` +
      `<div class="tbl" style="left:830px;top:0;color:var(--amber)">“${esc(b)}”</div>`,
    { left: 130, top: y, width: 1700, height: 40 });
    slideIn(r, s + 1.2 + i * 1.5, -20, .45);
  });
  narrate(sc, s + .6, s + 33.6, [
    "Every bad input gets a specific message, and the same player simply tries again",
    "Most of these messages come from one function: <code>game.validate_move</code>",
    "Bad promotion letters, undo and save files are handled by the UI and storage",
  ]);
});

addScene("python features", 40, (sc, s) => {
  header(sc, s, "REQUIREMENTS.md · SECTION 5", "doc", "The five required Python features",
    "TR-01 to TR-05 — and exactly where each one lives in the code");
  const feats = [
    ["TR-01", "Lists", "blue", "Board = 8×8 list of lists. History, legal moves and captured pieces are lists.",
      "board.create_board · game.make_move"],
    ["TR-02", "Dictionaries", "violet", "DIRECTIONS, SYMBOLS, the move dictionary and the game-state dictionary.",
      "constants.py · game.new_game"],
    ["TR-03", "Strings", "green", "Parsing \"e2 e4\", drawing the board, move text like e4xd5, save files.",
      "notation.py · board_to_text · storage.py"],
    ["TR-04", "Nested iteration", "amber", "Loops over rows and columns to find pieces, attacks and all moves.",
      "find_king · is_square_attacked · get_all_legal_moves"],
    ["TR-05", "Recursion", "red", "Sliding pieces step one square, then call themselves for the next square.",
      "moves.ray_moves"],
  ];
  feats.forEach(([id, name, col, desc, where], i) => {
    const y = 270 + i * 136, t = s + 1 + i * 5.6;
    const c = card(sc, 120, y, 1680, 120, "", { css: { borderLeft: `8px solid var(--${col})` } });
    E(c, "lbl", `<span style="color:var(--${col})">${id}</span>`, { left: 30, top: 24, fontSize: 22 });
    E(c, "lbl", name, { left: 30, top: 60, fontSize: 30 });
    E(c, "tdesc wrap", desc, { left: 380, top: 22, width: 800, fontSize: 23, lineHeight: 1.4 });
    E(c, "lbl b wrap", where, { left: 1220, top: 30, width: 430, fontSize: 20, lineHeight: 1.5 });
    fadeIn(c, t, .6, 16);
  });
  narrate(sc, s + .6, s + 39.6, [
    "The course requires five Python features — the design uses each one where it fits naturally",
    "Lists and dictionaries hold all the data: the board, moves and the game state",
    "Strings are how players talk to the program, and how games are saved",
    "Nested loops scan the board; recursion generates sliding moves in <code>ray_moves</code>",
  ]);
});

addScene("nfr and testing", 30, (sc, s) => {
  header(sc, s, "REQUIREMENTS.md · SECTIONS 7–9", "doc", "Quality, testing & milestones", null);
  E(sc, "lbl a", "NON-FUNCTIONAL", { left: 120, top: 270, fontSize: 19, letterSpacing: ".12em" });
  bullets(sc, 120, 310, 760, ["Standard library only, runs in any terminal", "Small single-purpose functions",
    "Meaningful names", "Consistent formatting", "Comments and docstrings", "Lines within 80 characters",
    "<b>Never crashes on user input</b>"], s + 1, .5, { fs: 24 });
  E(sc, "lbl a", "TESTING AREAS", { left: 980, top: 270, fontSize: 19, letterSpacing: ".12em" });
  bullets(sc, 980, 310, 820, ["TS-01 every piece, valid and invalid", "TS-02 through pieces / off the board",
    "TS-03 self-check and pins", "TS-04 castling cases", "TS-05 en passant timing", "TS-06 promotion choices",
    "TS-07 check, mate, stalemate", "TS-08 bad input", "TS-09 undo is exact", "TS-10 save then load"].map(esc),
  s + 5, .45, { fs: 23 });
  narrate(sc, s + .6, s + 29.6, [
    "Non-functional requirements describe <i>how</i> the code is written, not what it does",
    "Ten testing areas — every one of them already has real tests in the <code>tests/</code> folder",
    "Section 9 is a checklist for the interim and final demos — we come back to it at the end",
  ]);
});

addScene("MODULES and PROMPTS", 30, (sc, s) => {
  header(sc, s, "DOCUMENTS 3 & 4", "doc", "MODULES.md and PROMPTS.md", null);
  const a = card(sc, 120, 280, 820, 600, "");
  fadeIn(a, s + .8, .6, 16);
  E(a, "lbl b", "MODULES.md", { left: 32, top: 28, fontSize: 30 });
  E(a, "tdesc", "What every module does", { left: 32, top: 76, fontSize: 22 });
  bullets(a, 32, 130, 750, ["Folder layout", "How modules depend on each other", "Shared data formats",
    "A table for every module: each function, its status ✅ / ⬜ and its job",
    "Player commands", "Tests and the suggested build order"], s + 1.6, .6, { fs: 24 });
  const b = card(sc, 980, 280, 820, 600, "");
  fadeIn(b, s + 6, .6, 16);
  E(b, "lbl g", "PROMPTS.md", { left: 32, top: 28, fontSize: 30 });
  E(b, "tdesc", "A log of every prompt given to Claude", { left: 32, top: 76, fontSize: 22 });
  ["## Prompt 1 — 2026-11-06", "> create a project requirement", "  file from the md file",
    "**Outcome:** Created REQUIREMENTS.md", "", "## Prompt 2 — …", "## Prompt 3 — …",
    "## Prompt 4 — …", "## Prompt 5 — this video"].forEach((t, i) =>
    fadeIn(E(b, "tl", esc(t), { left: 32, top: 140 + i * 44, fontSize: 21,
      color: t.startsWith("##") ? "var(--blue)" : t.startsWith(">") || t.startsWith("  ") ? "#a5e07a" : "#9aa5b4" }),
    s + 6.6 + i * .25, .3, 0));
  narrate(sc, s + .6, s + 29.6, [
    "MODULES.md is the map of the code — it is kept up to date whenever a module changes",
    "PROMPTS.md records how the project was built with AI help, prompt by prompt",
    "Together they make the project easy for every team member to pick up",
  ]);
});
