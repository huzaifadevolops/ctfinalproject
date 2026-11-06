"use strict";
/* ============ PART 10: REQUIREMENTS MAP AND THE ROAD AHEAD ============ */

partScene(10, "Requirements & the road ahead", "Where every requirement lives, and what to build next",
  ["requirements → modules", "the build order", "interim demo checklist", "final demo checklist",
    "how to build one function", "recap"]);

addScene("traceability", 44, (sc, s) => {
  header(sc, s, "TRACEABILITY", null, "Which module meets which requirement", null);
  const mods = ["constants", "board", "notation", "moves", "rules", "game", "storage", "interface"];
  const reqs = [
    ["FR-01–05 board & display", [1, 0, 7]], ["FR-06–09 input & turns", [2, 5, 7]],
    ["FR-10–17 piece movement", [3, 0, 1]], ["FR-18 castling", [4, 0, 3, 5]],
    ["FR-19 en passant", [3, 5]], ["FR-20 promotion", [3, 7]], ["FR-21–24 check & game end", [4, 7]],
    ["FR-25 game state", [5]], ["FR-26–29 hints, history, undo", [5, 4, 7]], ["FR-30–31 save & load", [6, 2]],
    ["EH-01–09 errors", [5, 2, 6, 7]], ["TR-05 recursion", [3]],
  ];
  const x0 = 560, cw = 152, y0 = 300, rh = 52;
  mods.forEach((m, j) => fadeIn(E(sc, "lbl", m, { left: x0 + j * cw, top: y0 - 40, width: cw, textAlign: "center", fontSize: 18,
    color: "var(--blue)" }), s + .8 + j * .1, .4, 0));
  reqs.forEach(([name, cols], i) => {
    const y = y0 + i * rh, t = s + 2 + i * 2.4;
    fadeIn(E(sc, "lbl", esc(name), { left: 120, top: y + 10, fontSize: 20 }), t, .4, 0);
    mods.forEach((m, j) => {
      const on = cols.includes(j);
      const cell = E(sc, "", "", { left: x0 + j * cw + 8, top: y + 4, width: cw - 16, height: rh - 10, borderRadius: "8px",
        background: on ? (j === cols[0] ? "rgba(76,195,138,.75)" : "rgba(76,195,138,.32)") : "rgba(255,255,255,.04)" });
      tw(cell, "opacity", 0, 1, t + (on ? .3 : 0), .3);
    });
  });
  narrate(sc, s + .6, s + 43.6, [
    "Every requirement can be traced to the modules that implement it",
    "Bright cells mark the main home of each requirement; pale cells are the modules that help",
    "The rules engine and game logic carry the most — that is where the work is",
    "This is also a checklist for testing: each row has tests in the tests/ folder",
  ]);
});

addScene("build order", 40, (sc, s) => {
  header(sc, s, "WHAT'S NEXT", null, "The suggested build order",
    "Bottom layer first — each step unlocks the next one's tests");
  const svg = svgLayer(sc);
  const xs = [230, 522, 814, 1106, 1398, 1690], Y = 470;
  line(svg, xs[0], Y, xs[5], Y, "#2a313c", s + .8, { arrow: false, w: 6, dur: 1 });
  line(svg, xs[0], Y, xs[5], Y, "blue", s + 2, { arrow: false, w: 6, dur: 12 });
  const steps = [["board.py", "6 helpers", "+2 tests"], ["notation.py", "6 functions", "+5 tests"],
    ["moves.py", "8 functions", "+16 tests"], ["rules.py", "12 functions", "+18 tests"],
    ["game.py", "6 functions", "+9 tests"], ["storage.py", "2 functions", "+4 tests"]];
  steps.forEach(([f, d, tcount], i) => {
    const t = s + 2 + i * 2.2;
    pop(E(sc, "node", String(i + 1), { left: xs[i] - 38, top: Y - 38, width: 76, height: 76 }), t, .5);
    fadeIn(E(sc, "lbl", f, { left: xs[i] - 140, top: Y + 60, width: 280, textAlign: "center", fontSize: 25 }), t + .1, .4, 10);
    fadeIn(E(sc, "tdesc", d, { left: xs[i] - 140, top: Y + 100, width: 280, textAlign: "center", fontSize: 21 }), t + .2, .4, 10);
    fadeIn(E(sc, "lbl g", tcount, { left: xs[i] - 140, top: Y + 136, width: 280, textAlign: "center", fontSize: 20 }), t + .3, .4, 10);
  });
  const fx = (xs[2] + xs[3]) / 2;
  line(svg, fx, Y - 100, fx, Y + 30, "green", s + 16, { arrow: false, w: 4, dur: .4 });
  pop(E(sc, "flag", "INTERIM DEMO", { left: fx - 90, top: Y - 150, background: "rgba(76,195,138,.15)", color: "var(--green)",
    border: "1.5px solid rgba(76,195,138,.6)" }), s + 16.2, .5);
  pop(E(sc, "flag", "FINAL DEMO", { left: xs[5] - 76, top: Y - 150, background: "rgba(106,169,255,.15)", color: "var(--blue)",
    border: "1.5px solid rgba(106,169,255,.6)" }), s + 17, .5);
  fadeIn(infoBox(sc, 230, 720, 1460, 160, "WHY THIS ORDER?",
    "Each module only uses the ones before it. Build them in this order and every function you write can be tested straight away — nothing is waiting on code that does not exist yet.",
    "amber", { dfs: 23 }), s + 20, .6, 14);
  narrate(sc, s + .6, s + 39.6, [
    "The build order follows the layers, from the bottom up",
    "After moves.py, every piece moves correctly — that is the interim demo target",
    "rules.py, game.py and storage.py complete the final version",
    "Following the order means no function ever waits on code that is missing",
  ]);
});

function checklist(name, title, sub, col, items, dur, caps) {
  addScene(name, dur, (sc, s) => {
    header(sc, s, "REQUIREMENTS.md · SECTION 9", "doc", title, sub);
    items.forEach(([a, ids, fns, done], i) => {
      const y = 280 + i * 104, t = s + 1 + i * ((dur - 10) / items.length);
      const cd = card(sc, 120, y, 1680, 88, `<div class="lbl" style="left:70px;top:14px;font-size:25px">${esc(a)} <span class="v" style="font-size:19px">${ids}</span></div>` +
        `<div class="tdesc" style="left:70px;top:52px;font-size:19px">${esc(fns)}</div>` +
        `<div style="left:22px;top:24px;width:34px;height:34px;border-radius:8px;border:2px solid var(--${done ? "green" : col});` +
        `display:flex;align-items:center;justify-content:center;color:var(--green);font-weight:900">${done ? "✓" : ""}</div>`);
      fadeIn(cd, t, .5, 12);
    });
    narrate(sc, s + .6, s + dur - .4, caps);
  });
}

checklist("interim checklist", "Interim demo (~50%)", "What has to work, and the functions that make it work", "green", [
  ["Board setup and display", "FR-01 – FR-05", "create_board, board_to_text, print_board, show_position — built", true],
  ["Input parsing and coordinates", "FR-06, FR-07", "parse_square, split_move_text, parse_move", false],
  ["Movement for all six pieces", "FR-10 – FR-15", "ray_moves, step_moves, get_pawn_moves, get_piece_moves", false],
  ["Turns and player validation", "FR-08, FR-09", "validate_move (checks 1–3), make_move switching the turn", false],
  ["Board edges and blocking", "FR-16, FR-17", "on_board, ray_moves stopping at pieces", false],
  ["Demo, explain, list what remains", "", "this outline, MODULES.md and the skipped-test count", false],
], 34, ["The interim demo needs the board, the input and basic movement",
  "The display is already done — the rest is notation.py and moves.py",
  "The skipped-test count is a handy way to show what remains"]);

checklist("final checklist", "Final demo", "Everything in the proposal", "blue", [
  ["Full legal-move validation", "FR-21", "get_legal_moves, validate_move", false],
  ["Check, checkmate and stalemate", "FR-22 – FR-24", "is_in_check, is_checkmate, is_stalemate, get_game_status", false],
  ["Castling, en passant, promotion", "FR-18 – FR-20", "get_castling_moves, get_pawn_moves, apply_move, update_*", false],
  ["Move history and undo", "FR-27, FR-28", "make_move, undo_move, history_lines", false],
  ["Legal moves for a square", "FR-26", "show_legal_moves (built) + get_legal_moves", false],
  ["Error handling and edge cases", "EH-01 – EH-09", "all 56 tests passing", false],
  ["Save and load (if time allows)", "FR-30, FR-31", "save_game, load_game", false],
], 36, ["The final demo adds the full rules and the extras",
  "Every item maps to functions that already have a plan and tests",
  "Save and load are a \"Could\" — nice to have if time allows"]);

addScene("how to build a function", 40, (sc, s) => {
  header(sc, s, "WORKFLOW", null, "How to build one function", "The same six steps, every time");
  const st = [
    ["Pick the next function", "follow the build order, e.g. board.on_board"],
    ["Read its docstring plan", "the steps are already written down"],
    ["Replace the raise line with real code", "short, clear, within 80 characters"],
    ["Run the tests", "python -m unittest discover -s tests — its tests should turn from skipped to passed"],
    ["Update MODULES.md", "change ⬜ to ✅ for that function"],
    ["Log any prompt in PROMPTS.md", "if Claude helped, the prompt goes in word for word"],
  ];
  st.forEach(([a, b], i) => {
    const y = 280 + i * 106, t = s + 1 + i * 4.6;
    const r = E(sc, "", `<div class="node" style="left:0;top:0;width:70px;height:70px;font-size:26px">${i + 1}</div>` +
      `<div class="lbl" style="left:100px;top:4px;font-size:28px">${esc(a)}</div>` +
      `<div class="tdesc" style="left:100px;top:44px;font-size:21px">${esc(b)}</div>`, { left: 160, top: y, width: 1600, height: 90 });
    slideIn(r, t, -24, .5);
  });
  narrate(sc, s + .6, s + 39.6, [
    "Building the engine is now a series of small, well-defined jobs",
    "The plan says what to write; the tests say when it is right",
    "And the documents stay in step with the code, as CLAUDE.md requires",
  ]);
});

addScene("recap", 34, (sc, s) => {
  header(sc, s, "RECAP", null, "The outline in numbers", null);
  const nums = [["9", "code modules, with main.py", "blue"], ["8", "modules in the package", "violet"], ["57", "functions", "green"],
    ["17", "already built", "green"], ["40", "outlined with a plan", "amber"], ["56", "tests waiting", "violet"],
    ["64", "numbered requirements", "blue"], ["5", "required Python features", "red"]];
  nums.forEach(([n, d, col], i) => {
    const x = 120 + (i % 4) * 430, y = 300 + Math.floor(i / 4) * 300;
    const cd = card(sc, x, y, 400, 260, `<div class="hero" style="left:36px;top:30px;font-size:110px;color:var(--${col})">${n}</div>` +
      `<div class="tdesc wrap" style="left:40px;top:176px;width:330px;font-size:24px">${esc(d)}</div>`);
    pop(cd, s + 1 + i * .8, .6);
  });
  narrate(sc, s + .6, s + 33.6, [
    "The structure is complete: every file, function and test is in place",
    "The interface works today; the engine is a set of precise plans",
    "What is left is filling in the plans — one tested function at a time",
  ]);
});

addScene("outro", 14, (sc, s) => {
  fadeIn(E(sc, "hero", "That's the whole outline.", { left: 0, top: 330, width: 1920, textAlign: "center", fontSize: 92 }), s + .4, .8, 30);
  fadeIn(E(sc, "herosub", "Now let's build it.", { left: 0, top: 470, width: 1920, textAlign: "center", fontSize: 40 }), s + 1.2, .7, 20);
  const row = E(sc, "chiprow", '<span class="tag"><span class="b">MODULES.md</span> — every function</span>' +
    '<span class="tag"><span class="v">REQUIREMENTS.md</span> — every requirement</span>' +
    '<span class="tag"><span class="g">python main.py</span> — try the UI</span>',
  { left: 0, top: 570, width: 1920, justifyContent: "center" });
  fadeIn(row, s + 2, .7, 16);
  fadeIn(E(sc, "team", "Sibra Alam · Huzaifa Asif · Husna Jabeen", { left: 0, top: 680, width: 1920, textAlign: "center" }), s + 2.8, .7, 10);
});
