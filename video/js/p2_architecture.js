"use strict";
/* ===================== PART 2: ARCHITECTURE ===================== */

partScene(2, "Architecture", "How the files fit together",
  ["the folder tree", "layers and imports", "what is built so far", "anatomy of an outline",
    "how unbuilt code fails safely", "the life of one move"]);

addScene("folder tree", 34, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "The folder tree", "Everything lives in one project folder");
  const rows = [
    ["ctfinalproject/", "", null, 0],
    ["├─ main.py", "entry point: python main.py", "built", 1],
    ["├─ chessgame/", "the game package", null, 1],
    ["│  ├─ constants.py", "shared constants & lookup tables", "built", 2],
    ["│  ├─ board.py", "create, inspect and draw the board", "partial", 2],
    ["│  ├─ notation.py", "\"e2 e4\" ↔ coordinates", "outline", 2],
    ["│  ├─ moves.py", "how each piece moves (recursion)", "outline", 2],
    ["│  ├─ rules.py", "check, legal moves, game end", "outline", 2],
    ["│  ├─ game.py", "game state, make / undo moves", "partial", 2],
    ["│  ├─ storage.py", "save & load text files", "outline", 2],
    ["│  └─ interface.py", "terminal UI: prompts & commands", "built", 2],
    ["├─ tests/", "56 unit tests, one file per area", "spec", 1],
    ["├─ video/", "this explainer", null, 1],
    ["└─ *.md", "CLAUDE · REQUIREMENTS · MODULES · PROMPTS", null, 1],
  ];
  const short = { built: "BUILT", partial: "PARTLY BUILT", outline: "OUTLINE", spec: "SPEC" };
  rows.forEach(([name, desc, st, depth], i) => {
    const y = 262 + i * 49, t = s + 1 + i * .9;
    const tr = E(sc, "tree", esc(name), { left: 140, top: y, fontSize: 25 });
    slideIn(tr, t, -20, .45);
    if (desc) fadeIn(E(sc, "tdesc", esc(desc), { left: 760, top: y + 2, fontSize: 23 }), t + .2, .45, 0);
    if (st) pop(E(sc, "chip sm " + st, short[st], { left: 1500, top: y }), t + .3, .45);
  });
  narrate(sc, s + .6, s + 33.6, [
    "One entry point, one package of eight modules, the tests and the documents",
    "Each module has one job — its name says what that job is",
    "The chips show what is <b class=\"g\">built</b> today and what is still an <b class=\"a\">outline</b>",
  ]);
});

addScene("layers", 38, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "Layers and imports",
    "A module may only import from the layers below it");
  const layers = [
    ["main.py", "starts the program", "built"],
    ["interface.py", "the only module that prints or reads input", "built"],
    ["storage.py", "uses game, notation", "outline"],
    ["game.py", "uses rules, moves, notation, board", "partial"],
    ["rules.py", "uses moves, board, constants", "outline"],
    ["moves.py  ·  notation.py", "use board, constants", "outline"],
    ["board.py", "uses constants", "partial"],
    ["constants.py", "imports nothing", "built"],
  ];
  const n = layers.length;
  layers.forEach(([name, rel, st], i) => {
    const k = n - 1 - i;           // build from the bottom up
    const y = 262 + i * 84, t = s + 1 + k * 1.1;
    const L = E(sc, "layer " + st, `<span class="ln">${esc(name)}</span><span class="lr">${esc(rel)}</span>`,
      { left: 120, top: y, width: 1060, height: 70 });
    fadeIn(L, t, .5, 20);
  });
  const svg = svgLayer(sc);
  line(svg, 1240, 300, 1240, 900, "blue", s + 10, { w: 6, dur: 1.2 });
  fadeIn(E(sc, "lbl b", "imports point down", { left: 1270, top: 560, fontSize: 24 }), s + 10.8, .5, 0);
  const box = infoBox(sc, 1270, 640, 540, 250, "NO CIRCULAR IMPORTS",
    "Because arrows only point down, Python can always load the modules bottom-up. constants.py needs nothing; main.py needs everything.", "green");
  fadeIn(box, s + 12.5, .6, 16);
  const io = infoBox(sc, 1270, 300, 540, 230, "ONE MODULE TALKS TO THE PLAYER",
    "Only interface.py calls print() or input(). Every other module just returns values.", "amber");
  fadeIn(io, s + 17, .6, 16);
  narrate(sc, s + .6, s + 37.6, [
    "The modules form a stack: each layer is built on the ones underneath",
    "constants is at the bottom; main.py sits on top and simply calls the interface",
    "Imports only ever point downwards, so nothing depends on something above it",
    "Only the interface does input and output — that keeps everything else easy to test",
  ]);
});

addScene("why layers", 30, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "Why split it this way?", null);
  const items = [
    ["Test each piece alone", "A test can call <code>rules.is_in_check(board, \"b\")</code> directly — no keyboard, no screen.", "green"],
    ["Find bugs faster", "If a rook moves wrongly, the bug is in <code>moves.py</code>. If a message is wrong, it is in <code>game.py</code>.", "blue"],
    ["Work in parallel", "Team members can build different modules at the same time without stepping on each other.", "violet"],
    ["Change the UI freely", "A graphical version could replace <code>interface.py</code> and reuse every other module unchanged.", "amber"],
  ];
  items.forEach(([a, b, col], i) => {
    const x = 120 + (i % 2) * 850, y = 290 + Math.floor(i / 2) * 300;
    const c = infoBox(sc, x, y, 810, 260, a, b, col, { tfs: 30, dfs: 25, dtop: 72 });
    fadeIn(c, s + 1 + i * 4.5, .6, 18);
  });
  narrate(sc, s + .6, s + 29.6, [
    "Small modules with clear jobs are easier to test, debug and share out",
    "Because logic never prints, every rule can be checked by an automatic test",
    "The terminal UI is just one way to drive the engine — it could be swapped out",
  ]);
});

addScene("built so far", 34, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "What is built so far",
    "57 functions in total — 17 built, 40 outlined");
  const mods = [
    ["main.py", 1, 1], ["interface.py", 10, 10], ["constants.py", null, null], ["board.py", 5, 11],
    ["game.py", 1, 7], ["notation.py", 0, 6], ["moves.py", 0, 8], ["rules.py", 0, 12], ["storage.py", 0, 2],
  ];
  mods.forEach(([name, b, n], i) => {
    const y = 270 + i * 70, t = s + 1 + i * .8;
    fadeIn(E(sc, "lbl", name, { left: 140, top: y + 6, fontSize: 26 }), t, .4, 0);
    if (n === null) {
      fadeIn(E(sc, "lbl g", "tables only — all defined", { left: 480, top: y + 8, fontSize: 22 }), t + .2, .4, 0);
      return;
    }
    const W = 900;
    const tr = E(sc, "track", "", { left: 480, top: y + 8, width: W * n / 12, height: 32 });
    fadeIn(tr, t, .4, 0);
    for (let k = 0; k < n; k++) {
      const seg = E(tr, "", "", { left: k * (W / 12), top: 0, width: W / 12 - 4, height: 32,
        background: k < b ? "var(--green)" : "rgba(240,180,76,.28)", borderRadius: "4px" });
      tw(seg, "opacity", 0, 1, t + .2 + k * .05, .2);
    }
    fadeIn(E(sc, "lbl", `<span class="g">${b}</span><span class="m"> / ${n}</span>`,
      { left: 1420, top: y + 6, fontSize: 26 }), t + .5, .4, 0);
  });
  chipRow(sc, 140, 920, [["built", "■ built"], ["outline", "■ outline"]], s + 8);
  narrate(sc, s + .6, s + 33.6, [
    "Everything the player sees is done: the interface, the board display, the starting state",
    "Everything that thinks about chess is outlined: notation, moves, rules, game logic and saving",
    "That split is deliberate — the team writes the engine next, with the UI ready to show it",
  ]);
});

addScene("anatomy of an outline", 40, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "Anatomy of an outline function",
    "Every unbuilt function looks like this — here is board.find_king");
  const c = code(sc, 120, 270, [
    "def find_king(board, colour):",
    "    \"\"\"Return the (row, col) of the given side's king, or None.",
    "",
    "    Plan (nested iteration):",
    "        1. Work out the king letter: 'K' for White, 'k' for Black.",
    "        2. Loop over every row, and inside that every column.",
    "        3. Return the square as soon as the king letter is found.",
    "    \"\"\"",
    "    raise NotImplementedError(\"board.find_king\")",
  ], { fs: 23, w: 1080 });
  fadeIn(c.card, s + .8, .6, 16);
  const notes = [
    [0, "NAME AND INPUTS", "The signature is final: other modules already call it like this.", "blue"],
    [1, "WHAT IT RETURNS", "One line saying exactly what comes back — often with a requirement ID.", "green"],
    [4, "THE PLAN", "Numbered steps to follow when writing the body.", "amber"],
    [8, "THE PLACEHOLDER", "Until it is written, calling it raises NotImplementedError.", "red"],
  ];
  notes.forEach(([li, a, b, col], i) => {
    const t = s + 3 + i * 7;
    c.focus(li, t);
    const n = infoBox(sc, 1250, 270 + i * 160, 560, 140, a, b, col, { tfs: 21, dfs: 20, dtop: 54 });
    fadeIn(n, t, .5, 14);
  });
  c.unfocus(s + 32);
  narrate(sc, s + .6, s + 39.6, [
    "An outline is not empty — it is a precise promise about what the function will do",
    "The docstring's plan is the recipe: whoever builds it just follows the steps",
    "And the last line marks it as unfinished, in a way that both the UI and the tests understand",
  ]);
});

addScene("failing safely", 36, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "How unbuilt code fails safely",
    "One exception, two safety nets");
  const svg = svgLayer(sc);
  const mid = infoBox(sc, 760, 300, 400, 150, "NotImplementedError", "raised by any outline function, e.g. notation.parse_move", "red", { tfs: 24 });
  pop(mid, s + 1, .6);
  const A = infoBox(sc, 140, 560, 760, 300, "SAFETY NET 1 · interface.run()",
    "<code>try: handle_command(...)</code><br><code>except NotImplementedError as error:</code><br>" +
    "&nbsp;&nbsp;print <span class='a'>\"This feature is not built yet (needs notation.parse_move). See MODULES.md.\"</span><br><br>The game keeps running and the player can try another command.",
    "amber", { dfs: 21 });
  const Bx = infoBox(sc, 1020, 560, 760, 300, "SAFETY NET 2 · tests/helpers.py",
    "<code>ChessTestCase</code> wraps every test method.<br>If the test hits NotImplementedError it calls <code>skipTest(\"not built yet: ...\")</code>.<br><br>" +
    "So the test run says <span class='a'>OK (skipped=54)</span> — not 54 failures.", "violet", { dfs: 21 });
  draw(path(svg, "M 900 450 C 820 500, 600 500, 520 555", "amber", { w: 4, arrow: "amber" }), s + 4, .8);
  fadeIn(A, s + 4.5, .6, 16);
  draw(path(svg, "M 1020 450 C 1100 500, 1320 500, 1400 555", "violet", { w: 4, arrow: "violet" }), s + 14, .8);
  fadeIn(Bx, s + 14.5, .6, 16);
  narrate(sc, s + .6, s + 35.6, [
    "Every outline raises the same exception, so it is easy to catch in one place",
    "The interface catches it and prints a friendly message instead of crashing",
    "The test helpers catch it too, and mark the test as skipped until the code exists",
  ]);
});

addScene("life of a move", 50, (sc, s) => {
  header(sc, s, "ARCHITECTURE", null, "The life of one move",
    "What happens between typing \"e2 e4\" and seeing the new board");
  const lanes = [["player", 180], ["interface", 430], ["notation", 690], ["game", 950],
    ["rules", 1210], ["moves", 1470], ["board", 1720]];
  const svg = svgLayer(sc);
  const X = {};
  lanes.forEach(([n, x], i) => {
    X[n] = x;
    fadeIn(E(sc, "tag", n, { left: x - 70, top: 262, width: 140, textAlign: "center", fontSize: 20 }), s + .6 + i * .12, .4, 10);
    const p = path(svg, `M${x} 312 L${x} 940`, "#2a313c", { w: 3, dash: "6 8" });
    tw(p, "opacity", 0, 1, s + .8 + i * .12, .4);
  });
  const msgs = [
    ["player", "interface", "types  e2 e4", "ask()"],
    ["interface", "notation", "parse_move(\"e2 e4\")", ""],
    ["notation", "interface", "((6,4), (4,4), None)", ""],
    ["interface", "game", "validate_move(state, e2, e4)", ""],
    ["game", "rules", "get_legal_moves(state, 6, 4)", ""],
    ["rules", "moves", "get_piece_moves → get_pawn_moves", ""],
    ["moves", "rules", "e3 (push), e4 (double push)", ""],
    ["rules", "moves", "apply_move on a copy → is_in_check?", ""],
    ["rules", "game", "both moves are legal", ""],
    ["game", "interface", "(move, None)", ""],
    ["interface", "game", "make_move(state, move)", ""],
    ["game", "interface", "\"e2-e4\"  (turn is now Black)", ""],
    ["interface", "board", "show_position → print_board", ""],
  ];
  msgs.forEach(([a, b, label], i) => {
    const y = 336 + i * 46, t = s + 2.6 + i * 2.9;
    const x1 = X[a], x2 = X[b], dir = x2 > x1 ? 1 : -1;
    const col = dir > 0 ? "blue" : "green";
    line(svg, x1 + dir * 8, y, x2 - dir * 14, y, col, t, { w: 3, dur: .5 });
    const lx = Math.min(x1, x2) + 14;
    fadeIn(E(sc, "note", esc(label), { left: lx, top: y - 30, fontSize: 17,
      color: dir > 0 ? "#cfe0ff" : "#a8e6c8" }), t + .3, .35, 0);
  });
  narrate(sc, s + .6, s + 49.6, [
    "The interface reads the text and hands it to <code>notation</code> to turn into squares",
    "<code>game.validate_move</code> asks <code>rules</code> which moves are legal for that pawn",
    "<code>rules</code> gets the pawn's moves from <code>moves</code>, then tests each one for check",
    "The move is legal, so <code>game.make_move</code> plays it and switches the turn",
    "Finally the interface redraws the board — Black to move",
  ]);
});
