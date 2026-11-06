"use strict";
/* ===================== PART 6: rules.py ===================== */

partScene(6, "rules.py", "The rules engine — the heart of the project",
  ["attacks and check", "castling conditions", "legal moves and pins", "all 20 opening moves",
    "checkmate: Fool's Mate", "stalemate and game status"]);

addScene("rules overview", 36, (sc, s) => {
  header(sc, s, "rules.py · overview", "outline", '<span class="fname">rules.py</span>',
    "12 functions, each built on the ones before it");
  const ladder = [
    ["opponent", "w ↔ b"], ["is_square_attacked", "nested loop over enemy pieces"], ["is_in_check", "is my king attacked?"],
    ["can_castle_side", "one side's conditions"], ["get_castling_moves", "both sides"], ["get_candidate_moves", "piece moves + castling"],
    ["get_legal_moves", "drop moves that expose the king"], ["get_all_legal_moves", "every legal move for a side"],
    ["has_legal_moves", "at least one?"], ["is_checkmate", "check + no moves"], ["is_stalemate", "no check + no moves"],
    ["get_game_status", "the final answer"],
  ];
  ladder.forEach(([f, d], i) => {
    const colN = i < 6 ? 0 : 1, rowN = i % 6;
    const x = 120 + colN * 860, y = 280 + rowN * 106, t = s + 1 + i * 1.3;
    const cd = card(sc, x, y, 820, 88, `<div class="num" style="left:20px;top:24px;width:40px;height:40px">${i + 1}</div>` +
      `<div class="lbl" style="left:80px;top:14px;font-size:24px">${f}</div>` +
      `<div class="tdesc" style="left:80px;top:52px;font-size:19px">${esc(d)}</div>`);
    fadeIn(cd, t, .5, 12);
  });
  narrate(sc, s + .6, s + 35.6, [
    "rules.py answers the big questions: is this move legal, and is the game over?",
    "Each function is short because it leans on the one before it",
    "These functions take the whole game state, so they can see castling rights and en passant",
    "Build them in this order and each one can be tested as soon as it is written",
  ]);
});

fnScene({
  mod: "rules.py", name: "opponent", pos: "1 of 12", status: "outline",
  job: "The other side's colour",
  sig: "def opponent(colour):",
  plan: ["Return <code>BLACK</code> if colour is <code>WHITE</code>, otherwise <code>WHITE</code>."],
  visual: (sc, s, t0) => examples(sc, 1060, 300, 740, [["opponent(\"w\")", "\"b\""], ["opponent(\"b\")", "\"w\""]], t0 + 1, 1.4, { fs: 28, lh: 70 }),
  usedBy: ["is_in_check", "get_castling_moves", "game.make_move"],
  caps: ["Tiny, but used everywhere — \"who is attacking me?\" and \"whose turn is next?\"",
    "A named function reads better than repeating the if/else in ten places"],
});

fnScene({
  mod: "rules.py", name: "is_square_attacked", pos: "2 of 12", status: "outline",
  job: "Does any piece of by_colour attack this square?",
  sig: "def is_square_attacked(board, square, by_colour):",
  plan: ["Loop over every row, and inside that every column (<b>nested iteration</b>).",
    "Skip squares that are not a <code>by_colour</code> piece.",
    "If <code>square</code> is in <code>get_attacked_squares</code> for that piece → <code>True</code>.",
    "After the loops: <code>False</code>."],
  gap: 3.4,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 64, ["....k...", ".......p", "........", "........", "........", "....R...", "PP......", "......K."]);
    boardFade(B, t0);
    const scanEl = mark(B, 0, 0, "scan");
    tw(scanEl, "opacity", 0, 1, t0 + 2, .2);
    const target = 44;
    for (let i = 0; i <= target; i++) {
      const t = t0 + 2.2 + i * .1;
      tw(scanEl, "x", 0, (i % 8) * 64, t, 0);
      tw(scanEl, "y", 0, Math.floor(i / 8) * 64, t, 0);
    }
    const hit = t0 + 2.2 + target * .1;
    const svg = svgLayer(sc);
    line(svg, B.cx(4), B.cy(5) - 24, B.cx(4), B.cy(0) + 24, "red", hit + .3, { w: 6, dur: .6 });
    pop(mark(B, 0, 4, "redfill"), hit + .9, .4);
    fadeIn(E(sc, "big r", "is_square_attacked(board, e8, \"w\") → True", { left: 1060, top: 850, fontSize: 24 }), hit + 1.2, .5, 10);
  },
  visDur: 14,
  reqs: ["TR-04"], usedBy: ["is_in_check", "can_castle_side"],
  caps: ["Instead of asking \"what can attack this square?\", ask every enemy piece what it attacks",
    "The white box scans the board; the rook on e3 attacks all the way up to e8",
    "It can stop at the first attacker — one is enough"],
});

fnScene({
  mod: "rules.py", name: "is_in_check", pos: "3 of 12", status: "outline",
  job: "Is this side's king under attack?",
  sig: "def is_in_check(board, colour):",
  plan: ["<code>find_king(board, colour)</code>.", "<code>is_square_attacked(board, king_square, opponent(colour))</code>."],
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 64, ["....k...", "........", "........", "........", "........", "........", "........", "....R..K"]);
    boardFade(B, t0);
    const svg = svgLayer(sc);
    line(svg, B.cx(4), B.cy(7) - 24, B.cx(4), B.cy(0) + 24, "red", t0 + 3, { w: 6 });
    pop(mark(B, 0, 4, "redfill"), t0 + 3.6, .4);
    fadeIn(E(sc, "lbl r", "is_in_check(board, \"b\") → True", { left: 1060, top: 860, fontSize: 24 }), t0 + 4, .4, 0);
    fadeIn(E(sc, "lbl g", "is_in_check(board, \"w\") → False", { left: 1060, top: 900, fontSize: 24 }), t0 + 5.5, .4, 0);
  },
  reqs: ["FR-22"], tests: ["test_rook_gives_check"], usedBy: ["get_legal_moves", "get_game_status", "game.make_move (+ / #)"],
  caps: ["Two lines, because the hard work is already done by the functions it calls",
    "This is the test from test_rules.py: the rook on e1 checks the black king on e8"],
});

fnScene({
  mod: "rules.py", name: "can_castle_side", pos: "4 of 12", status: "outline",
  job: "Check one castling side for the conditions in FR-18",
  sig: "def can_castle_side(board, colour, rook_col, empty_cols, safe_cols):",
  plan: ["The rook must be on its home square.", "Every column in <code>empty_cols</code> must be empty.",
    "No column in <code>safe_cols</code> may be attacked by the opponent."],
  gap: 3.8,
  codeFs: 19,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 62, ["r...k..r", "........", "........", "........", "........", "........", "........", "R...K..R"]);
    boardFade(B, t0);
    fadeIn(E(sc, "lbl a", "KING SIDE", { left: 1060, top: 830, fontSize: 18 }), t0 + 1, .3, 0);
    fadeIn(E(sc, "note", "rook_col=7  empty=[f,g]  safe=[f,g]", { left: 1200, top: 830, fontSize: 18 }), t0 + 1, .3, 0);
    marks(B, [[7, 5], [7, 6]], "green", t0 + 1.4);
    fadeIn(E(sc, "lbl a", "QUEEN SIDE", { left: 1060, top: 868, fontSize: 18 }), t0 + 5, .3, 0);
    fadeIn(E(sc, "note", "rook_col=0  empty=[b,c,d]  safe=[c,d]", { left: 1200, top: 868, fontSize: 18 }), t0 + 5, .3, 0);
    marks(B, [[7, 1], [7, 2], [7, 3]], "path", t0 + 5.4);
  },
  reqs: ["FR-18"], usedBy: ["get_castling_moves"],
  caps: ["One function checks either side — the caller says which columns matter",
    "On the queen side b1 must be empty, but it does not have to be safe: the king never crosses it"],
});

fnScene({
  mod: "rules.py", name: "get_castling_moves", pos: "5 of 12", status: "outline",
  job: "The castling moves available to a side right now",
  sig: "def get_castling_moves(board, colour, castling_rights):",
  plan: ["The king must be on its home square and <b>not in check</b>.",
    "King side: right still held, f and g empty and safe.",
    "Queen side: right still held, b, c and d empty; c and d safe.",
    "Each castling move is the king's move with <code>special=\"castle\"</code>."],
  gap: 3.8,
  codeFs: 20,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 62, ["r...k..r", "........", "........", "........", "........", "........", "........", "R...K..R"]);
    boardFade(B, t0);
    const svg = svgLayer(sc);
    draw(path(svg, `M${B.cx(4)} ${B.cy(7)} Q ${B.cx(5)} ${B.cy(7) - 70} ${B.cx(6)} ${B.cy(7) - 10}`, "green", { w: 5, arrow: "green" }), t0 + 6, .7);
    draw(path(svg, `M${B.cx(4)} ${B.cy(7)} Q ${B.cx(3)} ${B.cy(7) - 70} ${B.cx(2)} ${B.cy(7) - 10}`, "green", { w: 5, arrow: "green" }), t0 + 9.6, .7);
    fadeIn(E(sc, "note", "e1→g1 and e1→c1: the king moves two squares", { left: 1080, top: 840, fontSize: 19 }), t0 + 10, .4, 0);
  },
  reqs: ["FR-18"], tests: ["test_both_sides_allowed", "test_no_castling_* (×4)"], usedBy: ["get_candidate_moves"],
  caps: ["Castling is a king move, so it is stored as one: e1 to g1 or e1 to c1",
    "The rook's jump is handled later, by apply_move",
    "The castling rights dictionary remembers whether the king or rook has ever moved"],
});

addScene("castling cases", 40, (sc, s) => {
  header(sc, s, "rules.py · castling", "spec", "When castling is not allowed",
    "Each picture is a test in test_rules.py");
  const cases = [
    ["Rights lost", "test_no_castling_without_rights", ["r...k..r", "........", "........", "........", "........", "........", "........", "R...K..R"], null, "king or rook moved earlier"],
    ["Through attack", "test_no_castling_through_attacked_square", ["r...kr..", "........", "........", "........", "........", "........", "........", "R...K..R"], [[7, 5]], "f1 is attacked by the f8 rook"],
    ["Out of check", "test_no_castling_out_of_check", ["r...r..k", "........", "........", "........", "........", "........", "........", "R...K..R"], [[7, 4]], "you cannot castle while in check"],
    ["Blocked", "test_no_castling_when_blocked", ["r...k..r", "........", "........", "........", "........", "........", "........", "RN..K..R"], [[7, 1]], "the b1 knight is in the way"],
  ];
  cases.forEach(([name, test, rows, bad, note], i) => {
    const x = 120 + i * 440, t = s + 1.5 + i * 7;
    fadeIn(E(sc, "lbl", name, { left: x, top: 280, fontSize: 25 }), t, .4, 0);
    const B = makeBoard(sc, x, 330, 46, rows, { labels: false });
    boardFade(B, t);
    if (bad) bad.forEach(([r, c]) => pop(mark(B, r, c, "redfill"), t + 1.2, .4));
    if (i === 1) { const svg = svgLayer(sc); line(svg, B.cx(5), B.cy(0) + 18, B.cx(5), B.cy(7) - 18, "red", t + 1, { w: 4 }); }
    if (i === 2) { const svg = svgLayer(sc); line(svg, B.cx(4), B.cy(0) + 18, B.cx(4), B.cy(7) - 18, "red", t + 1, { w: 4 }); }
    fadeIn(E(sc, "tdesc wrap", note, { left: x, top: 720, width: 380, fontSize: 21, lineHeight: 1.4 }), t + 1.5, .4, 0);
    fadeIn(E(sc, "chip sm testc wrap", "✔ " + test, { left: x, top: 800, maxWidth: "400px", lineHeight: 1.3 }), t + 2, .4, 0);
  });
  narrate(sc, s + .6, s + 39.6, [
    "FR-18 lists four ways castling can be forbidden — each has its own test",
    "Passing through an attacked square is not allowed, even if the king ends up safe",
    "And castling is never a way to escape check",
    "One more test checks that a rook moving away and back still loses its right",
  ]);
});

fnScene({
  mod: "rules.py", name: "get_candidate_moves", pos: "6 of 12", status: "outline",
  job: "Pseudo-legal moves for one piece, plus castling for kings",
  sig: "def get_candidate_moves(state, row, col):",
  plan: ["<code>get_piece_moves(board, row, col, state[\"en_passant\"])</code>.",
    "If the piece is a king, add <code>get_castling_moves(board, colour, state[\"castling\"])</code>.",
    "Return the combined list."],
  visual: (sc, s, t0) => {
    fadeIn(infoBox(sc, 1060, 300, 740, 200, "WHY \"CANDIDATE\"?", "These moves have the right shape, but have not yet been tested for check. They are candidates for being legal.", "amber", { dfs: 22 }), t0 + 2, .5, 12);
    fadeIn(infoBox(sc, 1060, 540, 740, 200, "ALSO USED FOR ERROR MESSAGES",
      "If a move is a candidate but not legal, validate_move knows to say \"That move would leave your king in check.\"", "violet", { dfs: 22 }), t0 + 7, .5, 12);
  },
  usedBy: ["get_legal_moves", "game.validate_move"],
  caps: ["This is where state comes in: en passant and castling depend on what happened before",
    "The board alone cannot tell you whether the king has moved"],
});

fnScene({
  mod: "rules.py", name: "get_legal_moves", pos: "7 of 12", status: "outline",
  job: "Fully legal moves for the piece on (row, col)",
  sig: "def get_legal_moves(state, row, col):",
  plan: ["Get the candidate moves.", "Play each one on a copy of the board with <code>apply_move</code>.",
    "Keep it only if the mover's king is <b>not</b> in check afterwards."],
  gap: 4,
  visual: (sc, s, t0) => {
    const B2 = makeBoard(sc, 1110, 300, 64, ["....r..k", "........", "........", "........", "........", "........", "....N...", "....K..."]);
    boardFade(B2, t0);
    const targets = [[4, 3], [4, 5], [5, 2], [5, 6], [7, 2], [7, 6]];
    const tdots = marks(B2, targets, "dot", t0 + 2.6, .1);
    const real = B2.pieces["6,4"];
    const T = t0 + 6.6;
    tw(real, "opacity", 1, .35, T, .3);
    const ghost = addPiece(B2, "N", 6, 4);
    tw(ghost, "opacity", 0, .9, T, .2);
    tw(ghost, "x", 0, 64, T + .1, .6, "inOut");
    tw(ghost, "y", 0, -128, T + .1, .6, "inOut");
    const svg = svgLayer(sc);
    const pin = line(svg, B2.cx(4), B2.cy(0) + 24, B2.cx(4), B2.cy(7) - 24, "red", T + 1, { w: 6 });
    const kh = pop(mark(B2, 7, 4, "redfill"), T + 1.5, .4);
    tw(ghost, "opacity", .9, 0, T + 2.6, .3);
    tw(real, "opacity", .35, 1, T + 2.6, .3);
    fadeOut(pin, T + 3.4); fadeOut(kh, T + 3.4);
    tdots.forEach(d => fadeOut(d, T + 3, .2));
    targets.forEach(([r, c], i) => pop(mark(B2, r, c, "x"), T + 3.2 + i * .12, .35));
    fadeIn(E(sc, "big a", "→ [ ]   the knight is pinned", { left: 1110, top: 852, fontSize: 26 }), T + 4, .5, 10);
  },
  visDur: 14,
  reqs: ["FR-21", "FR-26"], tests: ["test_pinned_piece_cannot_move", "test_must_escape_check"], usedBy: ["get_all_legal_moves", "game.validate_move", "interface.show_legal_moves"],
  caps: ["The simplest correct idea: try the move, then look at what happened",
    "The knight on e2 shields its king from the rook — any knight move exposes the king",
    "So all six knight moves are dropped. This one function handles pins, checks and discovered attacks"],
});

addScene("king into check", 30, (sc, s) => {
  header(sc, s, "rules.py · get_legal_moves", "spec", "A king cannot walk into check",
    "test_king_cannot_move_into_check");
  const B = makeBoard(sc, 150, 300, 70, [".......k", "........", "........", "........", "........", "........", "...r....", "....K..."]);
  boardFade(B, s + .6);
  const cand = [[6, 3], [6, 4], [6, 5], [7, 3], [7, 5]];
  marks(B, cand, "dot", s + 2, .15);
  const att = [[6, 4], [6, 5], [7, 3]];
  att.forEach(([r, c], i) => { pop(mark(B, r, c, "redfill"), s + 6 + i * .8, .4); pop(mark(B, r, c, "x"), s + 6.3 + i * .8, .4); });
  marks(B, [[6, 3], [7, 5]], "green", s + 10.5, .3);
  const rows = [["d2", "capture the rook", "g", "✔ legal"], ["e2", "attacked by the rook (along rank 2)", "r", "✕"],
    ["f2", "attacked by the rook (along rank 2)", "r", "✕"], ["d1", "attacked by the rook (d-file)", "r", "✕"], ["f1", "safe", "g", "✔ legal"]];
  rows.forEach(([sq, why, col, res], i) => fadeIn(E(sc, "lbl", `<span class="b">${sq}</span>  <span class="m" style="font-size:21px">${why}</span>  <span class="${col}">${res}</span>`,
    { left: 820, top: 320 + i * 70, fontSize: 25 }), s + 3 + i * 1.6, .4, 10));
  fadeIn(E(sc, "big g", "legal targets → [d2, f1]", { left: 820, top: 720, fontSize: 32 }), s + 12, .5, 10);
  fadeIn(E(sc, "tdesc wrap", "Capturing on d2 is fine: once the rook is gone, nothing attacks d2.",
    { left: 820, top: 790, width: 960, fontSize: 23, lineHeight: 1.4 }), s + 14, .5, 0);
  narrate(sc, s + .6, s + 29.6, [
    "The king has five candidate squares around it",
    "Three of them are attacked by the black rook, so playing them would leave the king in check",
    "The \"try it on a copy\" method gets the tricky capture right automatically",
  ]);
});

fnScene({
  mod: "rules.py", name: "get_all_legal_moves", pos: "8 of 12", status: "outline",
  job: "Every legal move for one side",
  sig: "def get_all_legal_moves(state, colour):",
  plan: ["Loop over all squares (<b>nested iteration</b>).",
    "For each piece of the given colour, add its <code>get_legal_moves</code>.",
    "Return one long list."],
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 300, 62, START);
    boardFade(B, t0);
    const pawnT = [];
    for (let c = 0; c < 8; c++) { pawnT.push([5, c]); pawnT.push([4, c]); }
    marks(B, pawnT, "dot", t0 + 2.4, .08);
    marks(B, [[5, 0], [5, 2], [5, 5], [5, 7]], "fill", t0 + 4.4, .2);
    const cnt = E(sc, "big g", "", { left: 1110, top: 830, fontSize: 34 });
    tw(cnt, "opacity", 0, 1, t0 + 2.4, .2);
    tw(cnt, "txt", "", "16 pawn moves", t0 + 2.4, 0);
    tw(cnt, "txt", "", "16 pawn + 4 knight = 20", t0 + 5.4, 0);
  },
  reqs: ["TR-04"], tests: ["test_twenty_opening_moves"], usedBy: ["has_legal_moves"],
  caps: ["At the start, White has exactly 20 legal moves — a classic check that move generation works",
    "16 pawn moves (one or two squares each) plus 4 knight moves; everything else is blocked"],
});

fnScene({
  mod: "rules.py", name: "has_legal_moves", pos: "9 of 12", status: "outline",
  job: "Does this side have at least one legal move?",
  sig: "def has_legal_moves(state, colour):",
  plan: ["Return <code>len(get_all_legal_moves(state, colour)) > 0</code>.",
    "(It could stop at the first move found — an easy speed-up later.)"],
  visual: (sc, s, t0) => {
    fadeIn(infoBox(sc, 1060, 300, 740, 250, "THE KEY QUESTION FOR THE END OF THE GAME",
      "If the side to move has no legal moves, the game is over. Whether it is checkmate or stalemate depends only on check.", "blue", { dfs: 23 }), t0 + 1.5, .5, 12);
  },
  usedBy: ["is_checkmate", "is_stalemate"],
  caps: ["Both ways a game of chess can end here come down to one question: can you move at all?"],
});

fnScene({
  mod: "rules.py", name: "is_checkmate", pos: "10 of 12", status: "outline",
  job: "In check, and no legal moves",
  sig: "def is_checkmate(state, colour):",
  plan: ["<code>is_in_check(board, colour)</code> and not <code>has_legal_moves(state, colour)</code>."],
  dur: 30,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 290, 62, START);
    boardFade(B, t0);
    const seq = [[[6, 5], [5, 5], "1. f2-f3"], [[1, 4], [3, 4], "   e7-e5"], [[6, 6], [4, 6], "2. g2-g4"], [[0, 3], [4, 7], "   d8-h4#"]];
    seq.forEach(([a, b, txt], i) => {
      const t = t0 + 2 + i * 2.6;
      movePiece(B, a, b, t, .7);
      fadeIn(E(sc, "lbl pre", txt, { left: 1640, top: 300 + i * 46, fontSize: 22, color: i === 3 ? "var(--red)" : "#dfe6ee" }), t + .4, .3, 0);
    });
    const T = t0 + 2 + 4 * 2.6;
    const svg = svgLayer(sc);
    line(svg, B.cx(7), B.cy(4), B.cx(4) + 18, B.cy(7) - 18, "red", T, { w: 6 });
    pop(mark(B, 7, 4, "redfill"), T + .5, .4);
    fadeIn(E(sc, "big r", "Fool's Mate — Black wins", { left: 1110, top: 820, fontSize: 30 }), T + 1, .5, 10);
    fadeIn(E(sc, "note", "every escape square is blocked or attacked", { left: 1110, top: 868, fontSize: 19 }), T + 1.6, .5, 0);
  },
  reqs: ["FR-23", "TS-07"], tests: ["test_fools_mate"], usedBy: ["get_game_status"],
  caps: ["The fastest possible checkmate, in four moves — it is also a test",
    "The queen on h4 checks the king, and nothing can block, capture or step away",
    "Checkmate ends the game; the interface names the winner"],
});

fnScene({
  mod: "rules.py", name: "is_stalemate", pos: "11 of 12", status: "outline",
  job: "Not in check, but no legal moves",
  sig: "def is_stalemate(state, colour):",
  plan: ["Not <code>is_in_check(board, colour)</code> and not <code>has_legal_moves(state, colour)</code>."],
  dur: 26,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1110, 290, 62, ["k.......", "........", ".Q......", "........", "........", "........", "........", ".......K"]);
    boardFade(B, t0);
    marks(B, [[0, 1], [1, 0], [1, 1]], "redfill", t0 + 3, .4);
    marks(B, [[0, 1], [1, 0], [1, 1]], "x", t0 + 3.2, .4);
    fadeIn(E(sc, "lbl", "Black to move. The king on a8 is <b class='g'>not</b> in check…", { left: 1110, top: 820, fontSize: 21 }), t0 + 4.5, .4, 0);
    fadeIn(E(sc, "lbl", "…but a7, b7 and b8 are all attacked. Draw.", { left: 1110, top: 860, fontSize: 21 }), t0 + 7, .4, 0);
  },
  reqs: ["FR-24", "TS-07"], tests: ["test_stalemate"], usedBy: ["get_game_status"],
  caps: ["Stalemate is the surprise rule of chess: no legal moves, but no check either",
    "It is a draw — so a winning player has to be careful"],
});

addScene("get_game_status", 32, (sc, s) => {
  header(sc, s, "rules.py · 12 of 12", "outline", '<span class="fname">get_game_status</span>',
    "Always describes the side whose turn it is — state[\"turn\"]");
  E(sc, "tdesc", "has legal moves", { left: 660, top: 300, width: 420, textAlign: "center" });
  E(sc, "tdesc", "no legal moves", { left: 1100, top: 300, width: 420, textAlign: "center" });
  E(sc, "tdesc", "in check", { left: 330, top: 420, width: 300, textAlign: "right" });
  E(sc, "tdesc", "not in check", { left: 330, top: 610, width: 300, textAlign: "right" });
  [[660, 350, "check", "must escape: \"White is in check!\"", "amber"],
    [1100, 350, "checkmate", "game over: \"Checkmate! Black wins.\"", "red"],
    [660, 540, "ongoing", "play continues", "green"],
    [1100, 540, "stalemate", "game over: \"Stalemate! The game is a draw.\"", "blue"]].forEach(([x, y, name, sub, col], i) => {
    const cell = card(sc, x, y, 420, 170, `<div class="big" style="left:30px;top:36px;font-size:36px;color:var(--${col})">"${name}"</div>` +
      `<div class="tdesc wrap" style="left:30px;top:96px;width:370px;font-size:19px">${esc(sub)}</div>`, { css: { borderTop: `4px solid var(--${col})` } });
    pop(cell, s + 2 + i * 2.2, .5);
  });
  const c = code(sc, 440, 760, ["if not has_legal_moves(...):  return \"checkmate\" if in_check else \"stalemate\"",
    "return \"check\" if in_check else \"ongoing\""], { fs: 20 });
  fadeIn(c.card, s + 12, .5, 12);
  narrate(sc, s + .6, s + 31.6, [
    "Two yes/no questions give four possible answers",
    "The interface calls this after every move to decide what message to show",
    "That completes the rules engine: twelve small functions, each one testable alone",
  ]);
});
