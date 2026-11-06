"use strict";
/* ===================== INTRO ===================== */

addScene("title", 13, (sc, s) => {
  const B = makeBoard(sc, 230, 210, 80, START);
  boardIn(B, s + .2);
  movePiece(B, [6, 4], [4, 4], s + 5.2, .8);
  movePiece(B, [1, 4], [3, 4], s + 6.6, .8);
  fadeIn(E(sc, "hero", "Two-Player Chess", { left: 1000, top: 300 }), s + 1.4, .8, 30);
  fadeIn(E(sc, "herosub", "The complete project outline, explained",
    { left: 1006, top: 432 }), s + 2.0, .7, 20);
  fadeIn(E(sc, "team", "Sibra Alam · Huzaifa Asif · Husna Jabeen",
    { left: 1006, top: 500 }), s + 2.6, .7, 16);
  fadeIn(E(sc, "chiprow", ["Python 3", "terminal", "rules engine", "9 modules",
    "56 tests"].map(c => `<span class="tag">${c}</span>`).join(""),
  { left: 1006, top: 580 }), s + 3.2, .7, 16);
  fadeIn(E(sc, "note", "every file · every function · every test",
    { left: 1006, top: 660, fontSize: 22 }), s + 4.2, .7, 10);
});

addScene("what we are building", 34, (sc, s) => {
  header(sc, s, "THE PROJECT", null, "What we are building",
    "From the project proposal in CLAUDE.md");
  const T = E(sc, "term", "", { left: 120, top: 280, width: 760, height: 600 });
  fadeIn(T, s + .8, .6);
  E(T, "tbar", '<div class="tdotc" style="left:20px;top:16px;width:14px;height:14px;background:#ff5f57"></div>' +
    '<div class="tdotc" style="left:42px;top:16px;width:14px;height:14px;background:#febc2e"></div>' +
    '<div class="tdotc" style="left:64px;top:16px;width:14px;height:14px;background:#28c840"></div>' +
    '<div class="note" style="left:100px;top:11px;font-size:18px">python main.py</div>',
  { left: 0, top: 0, width: 760, height: 46 });
  const rows = ["    a b c d e f g h", "  +-----------------+",
    "8 | r n b q k b n r | 8", "7 | p p p p p p p p | 7",
    "6 | . . . . . . . . | 6", "5 | . . . . . . . . | 5",
    "4 | . . . . . . . . | 4", "3 | . . . . . . . . | 3",
    "2 | P P P P P P P P | 2", "1 | R N B Q K B N R | 1",
    "  +-----------------+", "    a b c d e f g h"];
  rows.forEach((t, i) => fadeIn(E(T, "tl", esc(t), { left: 40, top: 70 + i * 32 }),
    s + 1.2 + i * .05, .2, 0));
  const pr = E(T, "tl", '<span class="pr">White&gt; </span><span class="ty"></span>',
    { left: 40, top: 70 + 12 * 32 + 14 });
  fadeIn(pr, s + 2.4, .2, 0);
  typeText(pr.querySelector(".ty"), "e2 e4", s + 3, 8);
  fadeIn(E(T, "tl", "White played e2-e4", { left: 40, top: 70 + 13 * 32 + 22,
    color: "var(--green)" }), s + 4.2, .3, 0);
  bullets(sc, 960, 300, 840, [
    "<b>Two people</b> share one computer and take turns",
    "Moves are typed in coordinate notation, like <code>e2 e4</code>",
    "The board is <b>redrawn</b> after every move",
    "Illegal moves are <b class='r'>rejected</b> with a clear message — never a crash",
    "<b>Check</b>, <b>checkmate</b> and <b>stalemate</b> are announced",
    "Extras: legal-move hints, move history, <b>undo</b>, save &amp; load",
  ], s + 3, 2.2, { fs: 28 });
  const focus = infoBox(sc, 960, 760, 840, 130, "THE MAIN FOCUS: THE RULES ENGINE",
    "Working out which moves are legal in any position — including never letting a player leave their own king in check.", "amber");
  fadeIn(focus, s + 17, .6, 14);
  narrate(sc, s + .6, s + 33.6, [
    "A chess game that runs in the terminal — no graphics, just text",
    "Each turn, the player whose move it is types a <b class=\"b\">from</b> square and a <b class=\"b\">to</b> square",
    "The program checks the move against the full rules of chess",
    "The hard part — and the heart of the project — is the <b class=\"a\">rules engine</b>",
  ]);
});

addScene("where it stands", 30, (sc, s) => {
  header(sc, s, "PROJECT STATUS", null, "Where the project stands",
    "This video explains the outline: the skeleton the team will fill in");
  const cols = [
    ["built", "BUILT", "green", ["Terminal user interface", "Board display", "All constants & tables", "new_game()", "create_board()"],
      "Works today: run <code>python main.py</code>"],
    ["outline", "OUTLINE", "amber", ["Board helpers", "Notation", "Move generation", "Rules engine", "Game logic", "Save & load"],
      "Name, inputs, outputs and a step-by-step plan — body not written yet"],
    ["spec", "SPECIFICATION", "violet", ["56 unit tests", "Written before the code", "Skipped until built", "Then they must pass"],
      "Describe exactly how every function must behave"],
  ];
  cols.forEach(([cls, name, col, items, foot], i) => {
    const x = 120 + i * 570, t = s + 1 + i * 1.6;
    const c = card(sc, x, 290, 530, 560, "", { css: { borderTop: `5px solid var(--${col})` } });
    fadeIn(c, t, .6, 20);
    E(c, "chip " + cls, name, { left: 28, top: 28 });
    bullets(c, 28, 100, 470, items.map(esc), t + .5, .25, { fs: 25 });
    E(c, "tdesc wrap", foot, { left: 28, top: 420, width: 470, fontSize: 21, lineHeight: 1.4 });
  });
  narrate(sc, s + .6, s + 29.6, [
    "The <b class=\"g\">user interface</b> is finished, so the game already starts and draws the board",
    "The engine is an <b class=\"a\">outline</b>: every function exists, with a plan written in its docstring",
    "Each outline body is just <code>raise NotImplementedError</code> — the UI catches it politely",
    "And <b class=\"v\">56 tests</b> already describe the finished behaviour, waiting for the code",
  ]);
});

addScene("agenda", 30, (sc, s) => {
  header(sc, s, "IN THIS VIDEO", null, "The plan for the next half hour", null);
  const items = [
    ["1", "The project documents", "CLAUDE.md, REQUIREMENTS.md, MODULES.md, PROMPTS.md"],
    ["2", "Architecture", "files, layers, imports and the life of one move"],
    ["3", "Shared data formats", "the board, a move and the game state"],
    ["4", "constants.py & board.py", "fixed tables, creating and drawing the board"],
    ["5", "notation.py & moves.py", "typed text ↔ squares, and how pieces move"],
    ["6", "rules.py", "check, legal moves, castling, game over"],
    ["7", "game.py & storage.py", "validating, playing, undoing, saving"],
    ["8", "interface.py", "the terminal UI and every command"],
    ["9", "The tests", "56 tests as the specification"],
    ["10", "Requirements & the road ahead", "what maps to what, and the build order"],
  ];
  items.forEach(([n, a, b], i) => {
    const colN = i < 5 ? 0 : 1, rowN = i % 5;
    const x = 120 + colN * 850, y = 270 + rowN * 128;
    const row = E(sc, "", `<div class="node" style="left:0;top:0;width:70px;height:70px;font-size:26px">${n}</div>` +
      `<div class="lbl" style="left:96px;top:4px;font-size:28px">${esc(a)}</div>` +
      `<div class="tdesc" style="left:96px;top:44px;font-size:21px">${esc(b)}</div>`,
    { left: x, top: y, width: 800, height: 90 });
    slideIn(row, s + 1 + i * .45, -24, .5);
  });
  caption(sc, s + 1, s + 29.4, "Every module is covered function by function — with its plan, examples and tests");
});
