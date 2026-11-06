"use strict";
/* ============ PART 7: game.py and storage.py ============ */

partScene(7, "game.py & storage.py", "Playing moves, taking them back, and saving games",
  ["the 7 functions of game.py", "validate_move: six checks", "make_move: seven steps",
    "undo with snapshots", "history lines", "save & load by replaying"]);

addScene("game overview", 30, (sc, s) => {
  header(sc, s, "game.py · overview", "partial", '<span class="fname">game.py</span>',
    "Owns the game-state dictionary and everything that changes it");
  const fns = [["new_game()", "a fresh state", "built"], ["validate_move(state, start, end)", "move or error message", "outline"],
    ["update_castling_rights(state, move)", "after king/rook moves", "outline"], ["update_en_passant(state, move)", "after a double push", "outline"],
    ["make_move(state, move, promotion)", "play it, record it", "outline"], ["undo_move(state)", "take it back", "outline"],
    ["history_lines(state)", "\"1. e2-e4 e7-e5\"", "outline"]];
  fns.forEach(([n, d, st], i) => {
    const y = 280 + i * 92;
    const cd = card(sc, 120, y, 1060, 78, `<div class="lbl" style="left:24px;top:12px;font-size:23px">${esc(n)}</div>` +
      `<div class="tdesc" style="left:24px;top:46px;font-size:18px">${esc(d)}</div>` +
      `<div class="chip sm ${st}" style="right:20px;top:22px">${st === "built" ? "BUILT" : "OUTLINE"}</div>`);
    fadeIn(cd, s + 1 + i * .6, .5, 12);
  });
  fadeIn(infoBox(sc, 1240, 280, 560, 300, "THE ONLY MODULE THAT CHANGES STATE",
    "rules.py and moves.py only read the state and return answers. game.py is where the state dictionary is actually modified.", "amber", { dfs: 22 }), s + 6, .6, 14);
  narrate(sc, s + .6, s + 29.6, [
    "game.py is the bridge between the interface and the rules engine",
    "It checks moves, plays them, and keeps the history needed for undo and saving",
    "Keeping all state changes in one module makes bugs much easier to track down",
  ]);
});

fnScene({
  mod: "game.py", name: "new_game", pos: "1 of 7", status: "built",
  job: "Return the state dictionary for a new game",
  code: ["def new_game():", "    \"\"\"Return the state dictionary for a new game. FR-25\"\"\"", "    return {",
    "        \"board\": create_board(),", "        \"turn\": WHITE,", "        \"castling\": {\"K\": True, \"Q\": True, \"k\": True, \"q\": True},",
    "        \"en_passant\": None,", "        \"history\": [],", "        \"captured\": [],", "    }"],
  codeFs: 19,
  plan: ["A fresh board from <code>create_board()</code>; White moves first.",
    "All four castling rights start as True; no en passant; empty lists."],
  focus: [3, 5],
  gap: 4,
  visual: (sc, s, t0) => fadeIn(infoBox(sc, 1060, 300, 740, 220, "USED IN THREE PLACES",
    "interface.run at start-up · the \"new\" command · storage.load_game, which replays a save from a new game", "green", { dfs: 22 }), t0 + 2, .5, 12),
  reqs: ["FR-25", "FR-08"], usedBy: ["interface.run", "storage.load_game", "tests"],
  caps: ["Built already, because the UI needs a state to display",
    "Every list and dictionary is created fresh each call, so two games never share data"],
});

addScene("validate_move", 50, (sc, s) => {
  header(sc, s, "game.py · 2 of 7", "outline", '<span class="fname">validate_move</span>',
    "Returns (move, None) if legal, or (None, error message) — checks run in this order");
  const checks = [
    ["Is there a piece on the start square?", "There is no piece on e4.", "test_empty_square"],
    ["Is it the player's own piece?", "That is not your piece.", "test_opponents_piece"],
    ["Is the target free of your own pieces?", "You cannot capture your own piece.", "test_capture_own_piece"],
    ["Is it in get_legal_moves()?", "✓ return the move", ""],
    ["Is it at least a candidate move?", "That move would leave your king in check.", "test_pinned_piece_cannot_move"],
    ["Otherwise", "A pawn cannot move from e2 to e5.", "test_illegal_pattern"],
  ];
  const errs = [];
  checks.forEach(([q, e, test], i) => {
    const y = 280 + i * 96;
    const box = card(sc, 150, y, 760, 80, `<div class="step" style="left:64px;top:21px;font-size:25px">${q}</div>` +
      `<div class="num" style="left:14px;top:20px;width:38px;height:38px;font-size:17px">${i + 1}</div>`);
    fadeIn(box, s + .8 + i * .3, .45, 14);
    const err = E(sc, "lbl " + (i === 3 ? "g" : "r"), esc(e), { left: 950, top: y + 12, fontSize: 23 });
    tw(err, "opacity", 0, .35, s + 2.8 + i * .2, .4);
    if (test) fadeIn(E(sc, "note", test, { left: 950, top: y + 48, fontSize: 16 }), s + 3 + i * .2, .4, 0);
    errs.push(err);
  });
  // Walk through: e2 e5 (illegal pattern) -> passes 1,2,3, fails 4,5, hits 6
  const tag = E(sc, "card mono", 'White types: <span class="b">e2 e5</span>', { left: 1300, top: 214, padding: "12px 20px", fontSize: 24 });
  pop(tag, s + 6, .5);
  const token = E(sc, "pulse", "", { left: 112, top: 309, width: 22, height: 22 });
  tw(token, "opacity", 0, 1, s + 7, .3);
  for (let i = 0; i < 5; i++) {
    const t = s + 7.6 + i * 1.6;
    pop(E(sc, "lbl " + (i < 3 ? "g" : "m"), i < 3 ? "✓" : "✕", { left: 868, top: 280 + i * 96 + 22, fontSize: 28 }), t, .4);
    tw(token, "y", i * 96, (i + 1) * 96, t + .3, .45, "inOut");
  }
  const T = s + 7.6 + 5 * 1.6;
  tw(errs[5], "opacity", .35, 1, T, .3);
  tw(errs[5], "scale", 1, 1.08, T, .3, "back");
  const glow = E(sc, "", "", { left: 150, top: 280 + 5 * 96, width: 760, height: 80, borderRadius: "18px",
    boxShadow: "0 0 0 3px #ff6b6b, 0 0 34px rgba(255,107,107,.5)" });
  tw(glow, "opacity", 0, 1, T, .4);
  fadeIn(E(sc, "tdesc wrap", "PIECE_NAMES turns \"P\" into \"pawn\"; square_name gives \"e2\" and \"e5\".",
    { left: 950, top: 880, width: 860, fontSize: 20 }), T + 2, .5, 0);
  narrate(sc, s + .6, s + 49.6, [
    "validate_move is where every error message in EH-02 to EH-06 comes from",
    "The order matters: each check assumes the earlier ones have passed",
    "Here e2 to e5 passes the first three checks, but is neither legal nor a candidate",
    "So the player gets the most helpful message: that pawns cannot move like that",
    "Comparing legal and candidate moves is what tells \"illegal pattern\" apart from \"leaves king in check\"",
  ]);
});

fnScene({
  mod: "game.py", name: "update_castling_rights", pos: "3 of 7", status: "outline",
  job: "Remove castling rights after a king or rook moves, or a rook is captured",
  sig: "def update_castling_rights(state, move):",
  plan: ["A king move removes both of that side's rights (<code>CASTLING_KEYS</code>).",
    "A move <b>from</b> a square in <code>ROOK_CORNERS</code> removes that corner's right.",
    "A move <b>to</b> one removes it too — that rook was just captured."],
  gap: 3.8,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 60, ["r...k..r", "........", "........", "........", "........", "........", "........", "R...K..R"]);
    boardFade(B, t0);
    const chipsEl = E(sc, "chiprow", ["K", "Q", "k", "q"].map(k => `<span class="chip sm built" data-k="${k}">${k}</span>`).join(""), { left: 1110, top: 820 });
    fadeIn(chipsEl, t0 + .5, .4, 0);
    const ch = [...chipsEl.children];
    // king moves -> K, Q off
    pop(mark(B, 7, 4, "amber"), t0 + 2, .4);
    [0, 1].forEach(i => { tw(ch[i], "opacity", 1, .25, t0 + 2.6, .3); });
    pop(mark(B, 0, 7, "amber"), t0 + 6, .4);
    tw(ch[2], "opacity", 1, .25, t0 + 6.6, .3);
    fadeIn(E(sc, "note", "after: king e1 moved · h8 rook moved", { left: 1110, top: 870, fontSize: 18 }), t0 + 7, .4, 0);
  },
  tests: ["test_castling_moves_rook", "test_rights_lost_after_rook_moves"], usedBy: ["make_move"],
  caps: ["Rights can only ever be lost, never regained — even if the rook moves back",
    "Using the corner squares means the same rule covers moving and being captured"],
});

fnScene({
  mod: "game.py", name: "update_en_passant", pos: "4 of 7", status: "outline",
  job: "Set the en passant square after a two-square pawn push",
  sig: "def update_en_passant(state, move):",
  plan: ["For a <code>\"double_push\"</code> move: the square the pawn skipped over.",
    "For any other move: <code>None</code> — the chance has gone."],
  gap: 4,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 60, START);
    boardFade(B, t0);
    movePiece(B, [6, 4], [4, 4], t0 + 2, .7);
    pop(mark(B, 5, 4, "green"), t0 + 3, .4);
    fadeIn(E(sc, "lbl g", "e2–e4 → en_passant = e3 = (5, 4)", { left: 1110, top: 820, fontSize: 23 }), t0 + 3.3, .4, 0);
    fadeIn(E(sc, "note", "the middle row: (from row + to row) / 2", { left: 1110, top: 864, fontSize: 18 }), t0 + 5, .4, 0);
  },
  reqs: ["FR-19", "FR-25"], tests: ["test_en_passant_capture", "test_en_passant_expires"], usedBy: ["make_move"],
  caps: ["En passant is only allowed on the very next move, so the square is reset after every move",
    "test_en_passant_expires checks that waiting one move makes the capture illegal"],
});

fnScene({
  mod: "game.py", name: "make_move", pos: "5 of 7", status: "outline",
  job: "Play a legal move and record it — returns its text, e.g. 'e2-e4' or 'd8-h4#'",
  sig: "def make_move(state, move, promotion=\"Q\"):",
  plan: ["Save a snapshot (board copy, turn, castling copy, en passant, number of captures).",
    "Replace the board with <code>apply_move(...)</code>.", "Record any captured piece.",
    "Update castling rights and the en passant square.", "Switch the turn.",
    "Build the text with <code>move_to_text</code>, adding <code>+</code> or <code>#</code>.",
    "Append <code>{\"text\", \"input\", \"snapshot\"}</code> to the history."],
  gap: 3,
  planFs: 22,
  visual: (sc, s, t0) => {
    fadeIn(E(sc, "lbl a", "state[\"history\"]", { left: 1180, top: 290, fontSize: 24 }), t0 + 3, .4, 0);
    const hist = ["1.  e2-e4", "    e7-e5", "2.  g1-f3", "    b8-c6"];
    hist.forEach((t, k) => {
      const y = 760 - k * 92;
      const cd = card(sc, 1180, y, 600, 78, `<div class="lbl pre" style="left:28px;top:22px">${t}</div>` +
        `<div class="chip sm spec" style="right:20px;top:24px">SNAPSHOT</div>`);
      tw(cd, "opacity", 0, 1, t0 + 4 + k * 4, .3);
      tw(cd, "y", -160, 0, t0 + 4 + k * 4, .6, "out");
    });
  },
  reqs: ["FR-27", "FR-29", "TR-01"], tests: ["test_turns_alternate", "test_history_lines"], usedBy: ["interface.handle_move", "storage.load_game"],
  caps: ["make_move is the only place a move is actually played",
    "The snapshot is taken first, before anything changes — that is what makes undo exact",
    "The \"+\" or \"#\" is added after the turn switches, by asking get_game_status about the opponent"],
});

fnScene({
  mod: "game.py", name: "undo_move", pos: "6 of 7", status: "outline",
  job: "Take back the last move — returns False if there is nothing to undo",
  sig: "def undo_move(state):",
  plan: ["No history → return <code>False</code> (the UI says \"Nothing to undo.\").",
    "Pop the last history entry.",
    "Restore board, turn, castling and en passant from its snapshot.",
    "Trim the captured list back to its saved length; return <code>True</code>."],
  gap: 3.6,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 290, 56, ["rnbqkbnr", "ppp.pppp", "........", "...P....", "........", "........", "PPPP.PPP", "RNBQKBNR"]);
    boardFade(B, t0);
    fadeIn(E(sc, "lbl", "after e2-e4, d7-d5, e4xd5", { left: 1110, top: 790, fontSize: 21 }), t0, .4, 0);
    const T = t0 + 6;
    movePiece(B, [3, 3], [4, 4], T, .7);
    const p = addPiece(B, "p", 3, 3);
    tw(p, "opacity", 0, 1, T + .7, .4);
    fadeIn(E(sc, "lbl g", "undo → pawn back on e4, black pawn back on d5", { left: 1110, top: 830, fontSize: 21 }), T + 1, .4, 0);
    fadeIn(E(sc, "note", "turn = \"w\" · captured = [] · en_passant = d6", { left: 1110, top: 868, fontSize: 18 }), T + 2, .4, 0);
  },
  reqs: ["FR-28", "EH-08", "TS-09"], tests: ["test_undo_restores_position", "test_undo_everything", "test_nothing_to_undo"], usedBy: ["interface (undo)"],
  caps: ["Undo does not try to reverse the move — it simply restores the saved snapshot",
    "That is far simpler, and it is exact even for castling, en passant and promotion",
    "Undoing every move must give back the starting position with all castling rights"],
});

fnScene({
  mod: "game.py", name: "history_lines", pos: "7 of 7", status: "outline",
  job: "The history as numbered lines",
  sig: "def history_lines(state):",
  plan: ["Take the entries two at a time: White's move, then Black's.",
    "Number each pair: <code>\"1. \" + white + \" \" + black</code>.",
    "A final White move on its own gets a line too."],
  visual: (sc, s, t0) => {
    const T = E(sc, "term", "", { left: 1060, top: 300, width: 740, height: 260 });
    fadeIn(T, t0 + 1, .5, 12);
    const l = E(T, "tl", '<span class="pr">White&gt; </span><span class="ty"></span>', { left: 30, top: 30, fontSize: 24 });
    typeText(l.querySelector(".ty"), "history", t0 + 1.6, 12);
    fadeIn(E(T, "tl", "1. f2-f3 e7-e5", { left: 30, top: 100, fontSize: 26 }), t0 + 3, .3, 0);
    fadeIn(E(T, "tl", "2. g2-g4 d8-h4#", { left: 30, top: 150, fontSize: 26 }), t0 + 3.4, .3, 0);
    fadeIn(E(sc, "note", "this exact output is test_history_lines", { left: 1060, top: 590, fontSize: 19 }), t0 + 5, .4, 0);
  },
  reqs: ["FR-27"], tests: ["test_history_lines"], usedBy: ["interface (history)"],
  caps: ["A move number covers one move by each player",
    "The text was built when each move was made, so this just formats a list"],
});

/* ---------------- storage.py ---------------- */

addScene("storage format", 30, (sc, s) => {
  header(sc, s, "storage.py · overview", "outline", '<span class="fname">storage.py</span>',
    "Saving a game as plain text — one typed move per line (FR-30, FR-31)");
  const f = E(sc, "term", "", { left: 120, top: 290, width: 760, height: 380 });
  fadeIn(f, s + .8, .5);
  E(f, "tbar", '<div class="lbl" style="left:20px;top:10px;font-size:19px">savegame.txt</div>', { left: 0, top: 0, width: 760, height: 46 });
  ["# Two-player chess save file: one move per line", "e2 e4", "d7 d5", "e4 d5", "g8 f6"].forEach((t, i) => {
    const el = E(f, "tl", "", { left: 24, top: 70 + i * 54, fontSize: 21, color: i ? "#e8ecf1" : "#6b7787" });
    typeText(el, t, s + 1.4 + i * .6, 40);
  });
  bullets(sc, 960, 300, 840, ["The first line is <code>SAVE_HEADER</code>, a comment.",
    "Each move is stored exactly as it would be typed.",
    "No board is stored at all — just the moves.",
    "Loading replays every move from a new game, through the normal rules."], s + 5, 3, { fs: 26 });
  fadeIn(infoBox(sc, 960, 700, 840, 170, "WHY NOT SAVE THE BOARD?",
    "Replaying re-checks every move, so a hand-edited file can never create an impossible position — and history and undo work after loading.", "green", { dfs: 21 }), s + 18, .6, 14);
  narrate(sc, s + .6, s + 29.6, [
    "The save format is as simple as possible: a list of moves",
    "Because loading goes through validate_move, the same rules protect saved games",
    "And the loaded game has a full history, so undo still works",
  ]);
});

fnScene({
  mod: "storage.py", name: "save_game", pos: "1 of 2", status: "outline",
  job: "Write the game's moves to a file — returns None, or an error message",
  sig: "def save_game(state, filename):",
  plan: ["Open the file for writing (UTF-8).", "Write <code>SAVE_HEADER</code>, then each history entry's <code>\"input\"</code> on its own line.",
    "Catch <code>OSError</code> (bad folder, no permission) and return a message instead of crashing."],
  gap: 3.8,
  visual: (sc, s, t0) => {
    const T = E(sc, "term", "", { left: 1060, top: 300, width: 740, height: 230 });
    fadeIn(T, t0 + 1, .5, 12);
    const l = E(T, "tl", '<span class="pr">White&gt; </span><span class="ty"></span>', { left: 30, top: 30, fontSize: 23 });
    typeText(l.querySelector(".ty"), "save mygame.txt", t0 + 1.6, 12);
    fadeIn(E(T, "tl", "Game saved to mygame.txt", { left: 30, top: 90, fontSize: 23, color: "var(--green)" }), t0 + 3.4, .3, 0);
    fadeIn(E(T, "tl", "(no name given → savegame.txt)", { left: 30, top: 150, fontSize: 20, color: "#6b7787" }), t0 + 5, .3, 0);
  },
  reqs: ["FR-30", "NFR-07"], tests: ["test_save_and_load_round_trip"], usedBy: ["interface (save)"],
  caps: ["Returning an error string, rather than printing, keeps storage.py free of input/output to the player",
    "The interface prints whatever comes back"],
});

fnScene({
  mod: "storage.py", name: "load_game", pos: "2 of 2", status: "outline",
  job: "Load a game by replaying its moves — (state, None) or (None, error)",
  sig: "def load_game(filename):",
  plan: ["Read the file's lines (<code>OSError</code> → \"Could not open …\").",
    "Start a <code>new_game()</code>.",
    "For each line, skipping blanks and <code>#</code> comments: <code>parse_move</code> → <code>validate_move</code> → <code>make_move</code>.",
    "Any failure → <code>\"Line N: &lt;reason&gt;\"</code>. Otherwise return the state."],
  gap: 3.8,
  visual: (sc, s, t0) => {
    const svg = svgLayer(sc);
    ["parse_move", "validate_move", "make_move"].forEach((n, i) => pop(E(sc, "fbox", n, { left: 1100, top: 300 + i * 100, width: 340, height: 70,
      color: "var(--blue)", borderColor: "var(--blue)" }), t0 + 6 + i * .3, .45));
    draw(path(svg, "M1452 535 C1540 535, 1540 335, 1452 335", "muted", { w: 4, arrow: "muted" }), t0 + 7.2, .7);
    fadeIn(E(sc, "note", "for every line", { left: 1560, top: 420, fontSize: 19 }), t0 + 7.4, .4, 0);
    const errs = [["missing file", "Could not open …", "test_load_missing_file"], ["\"banana\" on line 2", "Line 2: …", "test_load_corrupt_file"],
      ["\"e2 e5\" on line 1", "Line 1: … (illegal)", "test_load_illegal_move"]];
    errs.forEach(([a, b, t], i) => fadeIn(E(sc, "exrow", `<span class="excall">${esc(a)}</span><span class="exarr">→</span><span class="exres r">${esc(b)}</span>`,
      { left: 1100, top: 640 + i * 70, fontSize: 21 }), t0 + 12 + i * 1.2, .4, 8));
  },
  reqs: ["FR-31", "EH-09"], tests: ["test_load_missing_file", "test_load_corrupt_file", "test_load_illegal_move"], usedBy: ["interface (load)"],
  caps: ["Loading reuses exactly the same three functions the player's own moves go through",
    "If anything is wrong the current game is kept — the error says which line failed",
    "The round-trip test saves a game, loads it, and compares board, turn and captures"],
});
