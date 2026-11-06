"use strict";
/* ============ PART 5: notation.py and moves.py ============ */

partScene(5, "notation.py & moves.py", "Turning text into squares, and squares into moves",
  ["notation.py — 6 functions", "parsing \"e2 e4\"", "history text: e4xd5, O-O",
    "moves.py — 8 functions", "ray_moves: the recursion", "pawns, special moves, apply_move"]);

/* ---------------- notation.py ---------------- */

addScene("notation overview", 30, (sc, s) => {
  header(sc, s, "notation.py · overview", "outline", '<span class="fname">notation.py</span>',
    "Converts between what players type and board coordinates — all strings (TR-03)");
  const svg = svgLayer(sc);
  const rows = [
    ["\"e2 e4\"", "parse_move", "((6, 4), (4, 4), None)", "typed input → coordinates", "blue", 300],
    ["move dict", "move_to_text", "\"e2-e4\"", "for the history list", "green", 500],
    ["move dict", "move_to_input", "\"e2 e4\"", "for save files", "amber", 700],
  ];
  rows.forEach(([a, f, b, d, col, y], i) => {
    const t = s + 1 + i * 5;
    fadeIn(card(sc, 140, y, 340, 100, `<div class="lbl" style="left:24px;top:32px">${esc(a)}</div>`), t, .5, 12);
    line(svg, 490, y + 50, 650, y + 50, col, t + .6, { w: 4 });
    pop(E(sc, "fbox", f, { left: 670, top: y, width: 360, height: 100, borderColor: `var(--${col})`, color: `var(--${col})` }), t + 1, .5);
    line(svg, 1040, y + 50, 1200, y + 50, col, t + 1.4, { w: 4 });
    fadeIn(card(sc, 1220, y, 560, 100, `<div class="lbl g" style="left:24px;top:16px">${esc(b)}</div>` +
      `<div class="tdesc" style="left:24px;top:58px;font-size:19px">${esc(d)}</div>`), t + 1.8, .5, 12);
  });
  fadeIn(E(sc, "tdesc", "helpers: parse_square · square_name · split_move_text", { left: 140, top: 860, fontSize: 23 }), s + 16, .5, 0);
  narrate(sc, s + .6, s + 29.6, [
    "Everything about text lives in one module, so the rest of the code only ever sees coordinates",
    "Going in: the player's typing becomes a pair of squares",
    "Going out: a move becomes readable text for the history, or typed text for a save file",
  ]);
});

fnScene({
  mod: "notation.py", name: "parse_square", pos: "1 of 6", status: "outline",
  job: "Convert a square name like 'e4' to (row, col), or None",
  sig: "def parse_square(text):",
  plan: ["Return <code>None</code> unless text is exactly 2 characters.",
    "The file letter's position in <code>FILES</code> gives the column.",
    "The rank digit's position in <code>RANKS</code> gives the row.",
    "Return <code>None</code> if either character is not found.",
    "Tip: the tests also expect <code>\"E2\"</code> to work, so lower-case it first."],
  gap: 3.6,
  visual: (sc, s, t0) => {
    const x = 1060;
    fadeIn(E(sc, "big", '"<span class="b">e</span><span class="a">4</span>"', { left: x, top: 290, fontSize: 44 }), t0 + 1, .5, 10);
    const f = E(sc, "", "", { left: x, top: 380, width: 740, height: 60 });
    fadeIn(f, t0 + 4, .5, 0);
    [..."abcdefgh"].forEach((ch, i) => E(f, "gcell gl", ch, { left: i * 56, top: 0, width: 56, height: 56, fontSize: 24,
      color: i === 4 ? "var(--blue)" : "#8b96a5" }));
    fadeIn(E(sc, "note", "FILES.index(\"e\") → 4 = col", { left: x, top: 448, color: "var(--blue)" }), t0 + 4.6, .4, 0);
    const r = E(sc, "", "", { left: x, top: 510, width: 740, height: 60 });
    fadeIn(r, t0 + 7.6, .5, 0);
    [..."87654321"].forEach((ch, i) => E(r, "gcell gl", ch, { left: i * 56, top: 0, width: 56, height: 56, fontSize: 24,
      color: i === 4 ? "var(--amber)" : "#8b96a5" }));
    fadeIn(E(sc, "note", "RANKS.index(\"4\") → 4 = row", { left: x, top: 578, color: "var(--amber)" }), t0 + 8.2, .4, 0);
    examples(sc, x, 640, 740, [["parse_square(\"e4\")", "(4, 4)"], ["parse_square(\"E2\")", "(6, 4)"],
      ["parse_square(\"e9\")", "None", "r"]], t0 + 11, 1, { fs: 22, lh: 46 });
  },
  reqs: ["FR-07", "TR-03"], tests: ["test_parse_square", "test_parse_square_invalid"], usedBy: ["parse_move", "interface.show_legal_moves"],
  caps: ["String methods do all the work: <code>.index</code> or <code>.find</code> on two lookup strings",
    "Invalid squares like e9, i2 or \"22\" come back as None — never an exception",
    "None is how notation says \"that is not a square\" to whoever called it"],
});

fnScene({
  mod: "notation.py", name: "square_name", pos: "2 of 6", status: "outline",
  job: "Convert (row, col) back to a name like 'e4'",
  sig: "def square_name(square):",
  plan: ["Unpack the tuple: <code>row, col = square</code>.",
    "Return <code>FILES[col] + RANKS[row]</code> — the reverse of parse_square."],
  visual: (sc, s, t0) => {
    examples(sc, 1060, 290, 740, [["square_name((4, 4))", "\"e4\""], ["square_name((7, 7))", "\"h1\""],
      ["square_name((0, 0))", "\"a8\""]], t0 + .8, 1.2, { fs: 24, lh: 60 });
    fadeIn(infoBox(sc, 1060, 640, 740, 160, "ROUND TRIP TEST",
      "square_name(parse_square(name)) == name for a1, e4, h8 and c6", "green"), t0 + 6, .5, 12);
  },
  tests: ["test_square_name_round_trip"], usedBy: ["move_to_text", "game.validate_move (messages)", "interface.show_legal_moves"],
  caps: ["Indexing a string gives a character back — two lookups and a +",
    "A round-trip test checks that the two functions undo each other"],
});

fnScene({
  mod: "notation.py", name: "split_move_text", pos: "3 of 6", status: "outline",
  job: "Split what the player typed into its parts",
  sig: "def split_move_text(text):",
  plan: ["Lower-case the text and split it on spaces.",
    "If that gives one word of 4 or 5 characters, slice it into 2-character squares, plus a promotion letter.",
    "Return the list of parts."],
  gap: 4,
  visual: (sc, s, t0) => examples(sc, 1060, 290, 740, [["\"e2 e4\"", "[\"e2\", \"e4\"]"],
    ["\"e2e4\"", "[\"e2\", \"e4\"]"], ["\"  E2   E4 \"", "[\"e2\", \"e4\"]"], ["\"e7 e8 q\"", "[\"e7\", \"e8\", \"q\"]"],
    ["\"e7e8q\"", "[\"e7\", \"e8\", \"q\"]"]], t0 + 1, 1.6, { fs: 24, lh: 62, title: "EVERY FORMAT PLAYERS MIGHT TYPE" }),
  usedBy: ["parse_move"],
  caps: ["Players type moves in different ways — with spaces, without, in capitals",
    "<code>split()</code> with no argument also removes extra spaces at both ends",
    "Slicing <code>word[0:2]</code> and <code>word[2:4]</code> handles the no-space form"],
});

fnScene({
  mod: "notation.py", name: "parse_move", pos: "4 of 6", status: "outline",
  job: "Parse a move such as 'e2 e4', 'e2e4' or 'e7 e8 q'",
  sig: "def parse_move(text):",
  doc: "Returns (start, end, promotion), or None",
  plan: ["<code>split_move_text</code>; there must be 2 or 3 parts.",
    "<code>parse_square</code> on both squares; reject if either is None, or if start == end.",
    "A 3rd part must be one of <code>PROMOTION_CHOICES</code> (upper-cased: \"Q\").",
    "Return <code>(start, end, promotion)</code> — promotion is None if not given."],
  gap: 3.8,
  visual: (sc, s, t0) => {
    examples(sc, 1060, 280, 740, [["parse_move(\"e2 e4\")", "((6,4), (4,4), None)"],
      ["parse_move(\"e7e8n\")", "((1,4), (0,4), \"N\")"]], t0 + .8, 1.2, { fs: 21, lh: 50 });
    const bad = card(sc, 1060, 520, 740, 360, "");
    fadeIn(bad, t0 + 6, .5, 12);
    E(bad, "lbl r", "ALL RETURN None", { left: 28, top: 22, fontSize: 18, letterSpacing: ".12em" });
    [["\"\"", "empty"], ["\"hello\"", "not squares"], ["\"e2\"", "only one square"], ["\"e9 e4\"", "e9 is off the board"],
      ["\"e2 e2\"", "start == end"], ["\"e7 e8 k\"", "cannot promote to a king"], ["\"e2 e4 e5 e6\"", "too many parts"]]
      .forEach(([a, b], i) => fadeIn(E(bad, "exrow", `<span class="excall">${esc(a)}</span><span class="exres m">${esc(b)}</span>`,
        { left: 28, top: 60 + i * 41, fontSize: 20 }), t0 + 6.4 + i * .5, .3, 0));
  },
  reqs: ["FR-06", "EH-01", "TR-03"], tests: ["test_parse_move_formats", "test_parse_move_invalid"], usedBy: ["interface.handle_move", "storage.load_game"],
  caps: ["parse_move only checks the <i>format</i> — whether the move is legal is someone else's job",
    "Anything malformed returns None, and the interface prints \"Invalid input\" (EH-01)",
    "Notice it never needs the board: notation knows nothing about chess positions"],
});

fnScene({
  mod: "notation.py", name: "move_to_text", pos: "5 of 6", status: "outline",
  job: "Describe a move for the history list",
  sig: "def move_to_text(move, promotion=None):",
  plan: ["Castling → <code>\"O-O\"</code> (king to the g-file) or <code>\"O-O-O\"</code>.",
    "Otherwise: from-square + <code>\"-\"</code> (or <code>\"x\"</code> for a capture) + to-square.",
    "Then add <code>\"=Q\"</code> for a promotion, or <code>\" e.p.\"</code> for en passant."],
  gap: 4,
  visual: (sc, s, t0) => examples(sc, 1060, 290, 740, [["e2 → e4", "e2-e4"], ["e4 takes d5", "e4xd5"],
    ["king e1 → g1", "O-O"], ["king e1 → c1", "O-O-O"], ["pawn e7 → e8, queen", "e7-e8=Q"],
    ["en passant e5 → d6", "e5xd6 e.p."]], t0 + 1, 1.5, { fs: 23, lh: 58, title: "MOVE → TEXT" }),
  reqs: ["FR-27"], usedBy: ["game.make_move"],
  caps: ["This is \"long algebraic\" notation: both squares are always written out",
    "game.make_move adds \"+\" for check or \"#\" for checkmate afterwards, e.g. d8-h4#"],
});

fnScene({
  mod: "notation.py", name: "move_to_input", pos: "6 of 6", status: "outline",
  job: "The move as the player would type it",
  sig: "def move_to_input(move, promotion=None):",
  plan: ["<code>square_name</code> of the from- and to-squares, joined by a space.",
    "For a promotion, add the lower-case piece letter: <code>\"e7 e8 q\"</code>."],
  visual: (sc, s, t0) => {
    examples(sc, 1060, 290, 740, [["e2 → e4", "\"e2 e4\""], ["castle king side", "\"e1 g1\""],
      ["promote to knight", "\"a7 a8 n\""]], t0 + 1, 1.3, { fs: 24, lh: 60 });
    fadeIn(infoBox(sc, 1060, 640, 740, 170, "WHY A SECOND FORMAT?",
      "Save files store exactly what was typed. Loading feeds each line back through parse_move, so every move is re-checked.", "amber"), t0 + 6, .5, 12);
  },
  reqs: ["FR-30"], usedBy: ["game.make_move (history \"input\")", "storage.save_game"],
  caps: ["Castling is saved as the king's move — that is how players type it too",
    "History shows <code>move_to_text</code>; save files use <code>move_to_input</code>"],
});

/* ---------------- moves.py ---------------- */

addScene("moves overview", 34, (sc, s) => {
  header(sc, s, "moves.py · overview", "outline", '<span class="fname">moves.py</span>',
    "How each piece moves — before anyone checks for check");
  const a = infoBox(sc, 120, 280, 820, 270, "PSEUDO-LEGAL MOVES  (moves.py)",
    "Follow the piece's movement pattern: right shape, on the board, not onto your own piece. " +
    "<b>But they might leave your own king in check.</b>", "amber", { tfs: 25, dfs: 24, dtop: 70 });
  fadeIn(a, s + 1, .6, 16);
  const b = infoBox(sc, 980, 280, 820, 270, "LEGAL MOVES  (rules.py)",
    "The pseudo-legal moves that do <b>not</b> leave your king in check, plus castling. These are the only moves a player may make.",
    "green", { tfs: 25, dfs: 24, dtop: 70 });
  fadeIn(b, s + 7, .6, 16);
  const fns = ["create_move", "ray_moves", "step_moves", "pawn_attack_squares", "get_attacked_squares",
    "get_pawn_moves", "get_piece_moves", "apply_move"];
  fns.forEach((f, i) => pop(E(sc, "tag", f, { left: 120 + (i % 4) * 425, top: 620 + Math.floor(i / 4) * 80, fontSize: 22 }), s + 13 + i * .3, .45));
  narrate(sc, s + .6, s + 33.6, [
    "Move generation is split into two stages, in two different modules",
    "moves.py only knows how pieces move — it never thinks about check",
    "rules.py then throws away any move that would expose the king",
    "Splitting it this way keeps each function short and testable on its own",
  ]);
});

fnScene({
  mod: "moves.py", name: "create_move", pos: "1 of 8", status: "outline",
  job: "Build a move dictionary",
  sig: "def create_move(board, start, end, special=None, captured=None):",
  plan: ["Look up the moving piece on the start square.",
    "If <code>captured</code> is None, use whatever is on the end square (\".\" if empty).",
    "Return the dictionary with from, to, piece, captured and special."],
  visual: (sc, s, t0) => {
    const c = code(sc, 1060, 300, ["{\"from\": (4, 4),", " \"to\": (3, 3),", " \"piece\": \"P\",",
      " \"captured\": \"p\",", " \"special\": None}"], { fs: 26, w: 600 });
    fadeIn(c.card, t0 + 2, .5, 12);
    fadeIn(E(sc, "tdesc wrap", "Why the <code>captured</code> argument? For en passant the captured pawn is <b>not</b> on the end square — the caller passes \"p\" explicitly.",
      { left: 1060, top: 620, width: 740, fontSize: 22, lineHeight: 1.4 }), t0 + 8, .5, 10);
  },
  usedBy: ["every move generator", "rules.get_castling_moves"],
  caps: ["One function builds every move, so every move has exactly the same keys",
    "Recording the captured piece now means undo and history never have to guess"],
});

addScene("ray_moves plan", 30, (sc, s) => {
  header(sc, s, "moves.py · 2 of 8", "outline", '<span class="fname">ray_moves</span>',
    "RECURSIVELY collect the squares a sliding piece can reach (TR-05)");
  const c = code(sc, 120, 280, [
    "def ray_moves(board, row, col, d_row, d_col, colour):",
    "    next_row, next_col = row + d_row, col + d_col",
    "    if not on_board(next_row, next_col):",
    "        return []                              # base case",
    "    piece = board[next_row][next_col]",
    "    if piece == EMPTY:",
    "        return [(next_row, next_col)] + ray_moves(",
    "            board, next_row, next_col, d_row, d_col, colour)",
    "    if piece_colour(piece) != colour:",
    "        return [(next_row, next_col)]          # capture",
    "    return []                                  # own piece",
  ], { fs: 23, w: 1100 });
  fadeIn(c.card, s + .8, .6, 16);
  const notes = [[1, "Step one square in the direction."], [3, "Off the board: nothing more — the base case."],
    [6, "Empty: this square, plus whatever the next call finds."], [9, "Enemy: this square (a capture), then stop."],
    [10, "Own piece: blocked — nothing."]];
  notes.forEach(([li, n], i) => {
    const t = s + 3 + i * 4.5;
    c.focus(li, t);
    fadeIn(E(sc, "lbl wrap", `<span class="num" style="position:relative;display:inline-flex;width:30px;height:30px;font-size:15px;margin-right:12px">${i + 1}</span>${esc(n)}`,
      { left: 1270, top: 290 + i * 110, width: 540, fontSize: 22, lineHeight: 1.4 }), t, .5, 10);
  });
  c.unfocus(s + 26);
  fadeIn(E(sc, "chip sm outline", "a sketch of the plan — the real body is still to be written", { left: 120, top: 760 }), s + 4, .5, 0);
  narrate(sc, s + .6, s + 29.6, [
    "This is the plan from the docstring, written out as the code it describes",
    "A recursive function needs a base case — here, stepping off the board",
    "Every other case either stops, or calls itself one square further along",
  ]);
});

addScene("ray_moves call stack", 40, (sc, s) => {
  header(sc, s, "moves.py · ray_moves", "outline", "Watching the recursion",
    "A rook on a1 looks up the a-file; an enemy pawn waits on a5");
  const B = makeBoard(sc, 150, 290, 70, ["....k...", "........", "........", "p.......", "........", "........", "........", "R...K..."]);
  boardFade(B, s + .6);
  const sqs = ["a1", "a2", "a3", "a4"];
  const notes = ["a2 is empty → [a2] + ray_moves(…)", "a3 is empty → [a3] + ray_moves(…)",
    "a4 is empty → [a4] + ray_moves(…)", "a5 is an enemy → return [a5]"];
  const rets = ["↩ returns [a2, a3, a4, a5]", "↩ returns [a3, a4, a5]", "↩ returns [a4, a5]", "↩ returns [a5]"];
  const probe = mark(B, 7, 0, "scan");
  tw(probe, "opacity", 0, 1, s + 2.6, .2);
  for (let i = 0; i < 4; i++) {
    const t = s + 3 + i * 3, fx = 820 + i * 34, fy = 300 + i * 92;
    const fr = E(sc, "frame", "", { left: fx, top: fy, width: 920, height: 76 });
    if (i === 3) fr.style.borderLeftColor = "var(--red)";
    E(fr, "ft", `ray_moves(from ${sqs[i]}, step ↑)`, {});
    fadeIn(fr, t, .45, 16);
    const note = E(fr, "note", notes[i], { left: 400, top: 24 });
    if (i === 3) note.style.color = "var(--red)";
    fadeIn(note, t + .8, .4, 0);
    tw(probe, "y", -i * 70, -(i + 1) * 70, t + .5, .4, "inOut");
    pop(mark(B, 6 - i, 0, i < 3 ? "path" : "ring"), t + .9, .4);
    const rt = s + 17 + (3 - i) * 2;
    fadeOut(note, rt, .25);
    fadeIn(E(fr, "ret", rets[i], { left: 400, top: 23 }), rt + .2, .35, 0);
  }
  tw(probe, "opacity", 1, 0, s + 15.5, .3);
  fadeIn(E(sc, "big g", "ray_moves(board, 7, 0, -1, 0, \"w\")  →  [(6,0), (5,0), (4,0), (3,0)]",
    { left: 150, top: 900, fontSize: 26 }), s + 25.5, .6, 10);
  narrate(sc, s + .6, s + 39.6, [
    "Each call looks at one square, then hands the rest of the job to a new call",
    "The calls pile up on the <b class=\"b\">call stack</b> until one of them hits the enemy pawn and stops",
    "Then each call returns its list to the one before — the answer builds up as the stack unwinds",
    "This exact case is a real test: <code>test_ray_captures_enemy_and_stops</code>",
  ]);
});

addScene("ray tests", 30, (sc, s) => {
  header(sc, s, "moves.py · ray_moves", "outline", "Three ways a ray can end", "Each one has its own test");
  const cases = [
    ["Board edge", "test_ray_stops_at_edge", ["........", "........", "........", "........", "........", "........", "........", "R......."], [[6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0]], null, "7 squares up; 0 squares down"],
    ["Enemy piece", "test_ray_captures_enemy_and_stops", ["........", "........", "p.......", "........", "p.......", "........", "........", "R......."], [[6, 0], [5, 0]], [4, 0], "stops on the first pawn, not the second"],
    ["Own piece", "test_ray_stops_before_own_piece", ["........", "........", "........", "........", "........", "P.......", "........", "R......."], [[6, 0]], null, "stops just before it"],
  ];
  cases.forEach(([name, test, rows, path, cap, note], i) => {
    const x = 120 + i * 580, t = s + 1 + i * 6;
    fadeIn(E(sc, "lbl", name, { left: x, top: 280, fontSize: 28 }), t, .4, 0);
    const B = makeBoard(sc, x + 30, 340, 52, rows, { labels: false });
    boardFade(B, t + .2);
    path.forEach(([r, c], k) => pop(mark(B, r, c, "path"), t + 1 + k * .15, .3));
    if (cap) pop(mark(B, cap[0], cap[1], "ring"), t + 1 + path.length * .15, .4);
    fadeIn(E(sc, "tdesc wrap", note, { left: x + 30, top: 780, width: 420, fontSize: 21 }), t + 2, .4, 0);
    fadeIn(E(sc, "chip sm testc", "✔ " + test, { left: x + 30, top: 840 }), t + 2.4, .4, 0);
  });
  narrate(sc, s + .6, s + 29.6, [
    "The same function handles rooks, bishops and queens — only the direction changes",
    "A rook calls it 4 times, a bishop 4 times, a queen 8 times",
    "Each test sets up a tiny position and checks exactly which squares come back",
  ]);
});

fnScene({
  mod: "moves.py", name: "step_moves", pos: "3 of 8", status: "outline",
  job: "Squares reachable in a single step — knight and king",
  sig: "def step_moves(board, row, col, directions, colour):",
  plan: ["For each <code>(d_row, d_col)</code> in directions, work out the target square.",
    "Keep it if it is <code>on_board</code> and not occupied by one of our own pieces.",
    "Empty and enemy squares are both kept — no recursion needed."],
  gap: 3.6,
  visual: (sc, s, t0) => {
    fadeIn(E(sc, "lbl", "knight on g1 (start position)", { left: 1060, top: 285, fontSize: 21 }), t0, .4, 0);
    const B = makeBoard(sc, 1060, 325, 40, START, { labels: false });
    boardFade(B, t0);
    marks(B, [[5, 5], [5, 7]], "dot", t0 + 4);
    pop(mark(B, 6, 4, "x"), t0 + 5, .4);
    fadeIn(E(sc, "tdesc wrap", "e2 holds a white pawn → dropped. h3 and f3 are kept.",
      { left: 1420, top: 360, width: 380, fontSize: 20, lineHeight: 1.4 }), t0 + 5.5, .4, 0);
    fadeIn(E(sc, "lbl", "king in the corner", { left: 1060, top: 680, fontSize: 21 }), t0 + 7, .4, 0);
    const K = makeBoard(sc, 1060, 720, 22, ["........", "........", "........", "........", "........", "........", "........", ".......K"], { labels: false });
    boardFade(K, t0 + 7);
    marks(K, [[6, 6], [6, 7], [7, 6]], "dot", t0 + 7.6);
    fadeIn(E(sc, "tdesc wrap", "5 of its 8 steps are off the board → 3 moves",
      { left: 1420, top: 740, width: 380, fontSize: 20, lineHeight: 1.4 }), t0 + 8, .4, 0);
  },
  reqs: ["FR-11", "FR-15", "FR-17"], tests: ["test_knight_jumps", "test_king_in_corner"], usedBy: ["get_attacked_squares"],
  caps: ["Knights and kings never slide, so one loop over their directions is enough",
    "Knights \"jump\" for free: step_moves never looks at the squares in between"],
});

fnScene({
  mod: "moves.py", name: "pawn_attack_squares", pos: "4 of 8", status: "outline",
  job: "The (up to two) diagonal squares a pawn attacks",
  sig: "def pawn_attack_squares(row, col, colour):",
  plan: ["One row forward: <code>row + PAWN_DIRECTION[colour]</code>.",
    "Columns <code>col - 1</code> and <code>col + 1</code>.",
    "Keep only the squares that are on the board."],
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1100, 300, 62, ["........", "........", "........", "........", "...P....", "........", "........", "P......."]);
    boardFade(B, t0);
    marks(B, [[3, 2], [3, 4]], "redfill", t0 + 3);
    marks(B, [[6, 1]], "redfill", t0 + 6);
    fadeIn(E(sc, "tdesc wrap", "The a-file pawn only attacks one square — the other would be off the board.",
      { left: 1100, top: 840, width: 700, fontSize: 21, lineHeight: 1.4 }), t0 + 6.5, .4, 0);
  },
  usedBy: ["get_attacked_squares", "get_pawn_moves"],
  caps: ["Notice: it needs no board — only where the pawn is and which way it faces",
    "Pawns are the only piece that attacks differently from how it moves"],
});

fnScene({
  mod: "moves.py", name: "get_attacked_squares", pos: "5 of 8", status: "outline",
  job: "Squares attacked by the piece on (row, col) — used to detect check",
  sig: "def get_attacked_squares(board, row, col):",
  plan: ["Pawn: <code>pawn_attack_squares</code> — the diagonals, even if empty.",
    "Bishop, rook, queen: <code>ray_moves</code> for each of its DIRECTIONS.",
    "Knight, king: <code>step_moves</code> with its DIRECTIONS.",
    "Return all the squares in one list."],
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1100, 300, 62, ["....k...", "........", "........", "........", "........", "........", "....P...", "........"]);
    boardFade(B, t0);
    marks(B, [[5, 3], [5, 5]], "redfill", t0 + 2.5);
    marks(B, [[5, 4], [4, 4]], "dot", t0 + 4);
    fadeIn(E(sc, "tdesc wrap", "<span class='r'>red</span>: attacked (the diagonals)<br>dots: where the pawn can <b>move</b> — but it does not attack those squares",
      { left: 1100, top: 820, width: 700, fontSize: 21, lineHeight: 1.45 }), t0 + 4.5, .4, 0);
  },
  usedBy: ["rules.is_square_attacked", "get_piece_moves"],
  caps: ["\"Attacked\" and \"can move to\" are the same for every piece except the pawn",
    "Check detection asks \"is the king's square attacked?\" — so attacks need their own function"],
});

addScene("get_pawn_moves", 44, (sc, s) => {
  header(sc, s, "moves.py · 6 of 8", "outline", '<span class="fname">get_pawn_moves</span>',
    "The pawn has more rules than any other piece (FR-10, FR-19, FR-20)");
  const c = code(sc, 120, 268, ["def get_pawn_moves(board, row, col, en_passant):",
    "    \"\"\"…plan in the docstring…\"\"\"",
    "    raise NotImplementedError(\"moves.get_pawn_moves\")"], { fs: 22, w: 860 });
  fadeIn(c.card, s + .7, .5, 14);
  const items = [
    ["1  One square forward, if it is empty.", ["........", "........", "........", "........", "........", "........", "....P...", "........"], [[5, 4]], "dot"],
    ["2  Two squares from the start row, if both are empty → \"double_push\".", ["........", "........", "........", "........", "........", "........", "....P...", "........"], [[4, 4]], "fill"],
    ["3  Diagonal captures of enemy pieces.", ["........", "........", "........", "........", "........", "...n....", "....P...", "........"], [[5, 3]], "ring"],
    ["4  Onto the en_passant square → \"en_passant\" (the pawn beside us is taken).", ["........", "........", "...*....", "...pP...", "........", "........", "........", "........"], [[2, 3]], "green"],
    ["5  Reaching PROMOTION_ROW → \"promotion\".", ["........", "P.......", "........", "........", "........", "........", "........", "........"], [[0, 0]], "green"],
  ];
  items.forEach(([txt, rows, sqs, kind], i) => {
    const t = s + 2.5 + i * 7.5, t1 = t + 7.3;
    fadeIn(E(sc, "step wrap", esc(txt), { left: 120, top: 460 + i * 80, width: 860, fontSize: 24, lineHeight: 1.35,
      color: "#dfe6ee" }), t, .4, 10);
    const g = phase(sc, t, i === 4 ? null : t1);
    const B = makeBoard(g, 1180, 300, 62, rows.map(r => r.replace("*", ".")));
    sqs.forEach(([r, cc]) => pop(mark(B, r, cc, kind), t + 1, .4));
    if (i === 3) {
      fadeIn(E(g, "tdesc wrap", "Black just played d7–d5. en_passant = d6. Next move only!",
        { left: 1180, top: 840, width: 600, fontSize: 21 }), t + 1.5, .4, 0);
      pop(mark(B, 3, 3, "x"), t + 2, .4);
    }
    if (i === 4) fadeIn(E(g, "tdesc wrap", "a7–a8: the player picks Q, R, B or N", { left: 1180, top: 840, width: 600, fontSize: 21 }), t + 1.5, .4, 0);
  });
  narrate(sc, s + .6, s + 43.6, [
    "Pawns move forward but capture diagonally, and they never move backwards",
    "The double push sets up en passant for the opponent's very next move",
    "En passant is the only capture where the taken piece is not on the target square",
    "A pawn reaching the last rank becomes a new piece — the move is flagged for promotion",
  ]);
});

fnScene({
  mod: "moves.py", name: "get_piece_moves", pos: "7 of 8", status: "outline",
  job: "All pseudo-legal moves for the piece on (row, col)",
  sig: "def get_piece_moves(board, row, col, en_passant=None):",
  plan: ["Empty square → <code>[]</code>.", "Pawn → <code>get_pawn_moves</code>.",
    "Any other piece → one <code>create_move</code> per square from <code>get_attacked_squares</code>.",
    "Castling is <b>not</b> added here — rules.py adds it."],
  visual: (sc, s, t0) => {
    const svg = svgLayer(sc);
    pop(E(sc, "fbox", "get_piece_moves", { left: 1240, top: 290, width: 380, height: 80, borderColor: "var(--blue)" }), t0 + .5, .5);
    [["\".\" → []", 1080, "muted"], ["P / p → get_pawn_moves", 1300, "amber"], ["N B R Q K → get_attacked_squares", 1560, "green"]]
      .forEach(([t, x, col], i) => {
        line(svg, 1430, 372, x + 100, 470, col, t0 + 3 + i * 3, { w: 3 });
        pop(E(sc, "fbox", t, { left: x - 20, top: 480, width: 250, height: 110, fontSize: 19, borderColor: `var(--${col})` }), t0 + 3.4 + i * 3, .5);
      });
    fadeIn(E(sc, "tdesc wrap", "For every piece except the pawn, the squares it attacks are exactly the squares it can move to.",
      { left: 1060, top: 640, width: 740, fontSize: 22, lineHeight: 1.4 }), t0 + 11, .5, 0);
  },
  reqs: ["FR-10 – FR-17"], tests: ["test_rook_in_corner", "test_queen_in_centre", "test_pieces_blocked_at_start", "+9 more"], usedBy: ["rules.get_candidate_moves"],
  caps: ["The one entry point that rules.py calls for any piece",
    "Reusing get_attacked_squares means sliding and stepping logic is written only once"],
});

addScene("piece move counts", 30, (sc, s) => {
  header(sc, s, "moves.py · tests", "spec", "How many squares can each piece reach?",
    "On an empty board — straight from test_moves.py");
  const items = [
    ["Rook in a corner", "R", [7, 0], 14, (r, c) => (r === 7 || c === 0) && !(r === 7 && c === 0)],
    ["Bishop in the centre", "B", [4, 3], 13, (r, c) => Math.abs(r - 4) === Math.abs(c - 3) && r !== 4],
    ["Queen in the centre", "Q", [4, 3], 27, (r, c) => (Math.abs(r - 4) === Math.abs(c - 3) || r === 4 || c === 3) && !(r === 4 && c === 3)],
    ["King in a corner", "K", [7, 7], 3, (r, c) => Math.abs(r - 7) <= 1 && Math.abs(c - 7) <= 1 && !(r === 7 && c === 7)],
  ];
  items.forEach(([name, p, [pr, pc], n, f], i) => {
    const x = 120 + i * 440, t = s + 1 + i * 5;
    const rows = EMPTY8.map((row, r) => r === pr ? row.slice(0, pc) + p + row.slice(pc + 1) : row);
    fadeIn(E(sc, "lbl", name, { left: x, top: 290, fontSize: 24 }), t, .4, 0);
    const B = makeBoard(sc, x, 340, 46, rows, { labels: false });
    boardFade(B, t);
    const list = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (f(r, c)) list.push([r, c]);
    marks(B, list, "dot", t + .8, .03);
    pop(E(sc, "big", String(n), { left: x, top: 740, fontSize: 64, color: "var(--green)" }), t + 2, .5);
    fadeIn(E(sc, "tdesc", "moves", { left: x + (n > 9 ? 90 : 52), top: 772, fontSize: 24 }), t + 2.2, .4, 0);
  });
  narrate(sc, s + .6, s + 29.6, [
    "Counting moves is a simple, powerful test: one wrong direction changes the number",
    "The queen's 27 is the rook's pattern plus the bishop's, from the same square",
    "Sixteen tests cover moves.py, including pawns, en passant and promotion",
  ]);
});

fnScene({
  mod: "moves.py", name: "apply_move", pos: "8 of 8", status: "outline",
  job: "Return a NEW board with the move played — the original is unchanged",
  sig: "def apply_move(board, move, promotion=\"Q\"):",
  plan: ["<code>copy_board</code>, then lift the piece off its from-square.",
    "En passant: also empty the captured pawn's square.",
    "Promotion: replace the pawn with the chosen piece (upper case for White).",
    "Castling: also move the rook (h→f king side, a→d queen side).",
    "Put the piece on the to-square and return the new board."],
  gap: 4.2,
  visual: (sc, s, t0) => {
    const steps4 = [
      ["normal", ["........", "........", "........", "........", "........", "........", "....P...", "........"], () => [[6, 4], [4, 4]]],
      ["en passant", ["........", "........", "........", "...pP...", "........", "........", "........", "........"], () => [[3, 4], [2, 3]]],
      ["promotion", ["........", "P.......", "........", "........", "........", "........", "........", "........"], () => [[1, 0], [0, 0]]],
      ["castling", ["........", "........", "........", "........", "........", "........", "........", "....K..R"], () => [[7, 4], [7, 6]]],
    ];
    steps4.forEach(([name, rows, ft], i) => {
      const t = t0 + 2.6 + i * 4.2 + 1, t1 = t + 4;
      const g = phase(sc, t, i === 3 ? null : t1);
      fadeIn(E(g, "lbl a", name.toUpperCase(), { left: 1180, top: 290, fontSize: 20, letterSpacing: ".12em" }), t, .3, 0);
      const B = makeBoard(g, 1180, 330, 60, rows);
      const [from, to] = ft();
      movePiece(B, from, to, t + .8, .7);
      if (i === 1) tw(B.pieces["3,3"], "opacity", 1, 0, t + 1.5, .3);
      if (i === 2) { tw(B.pieces["1,0"], "opacity", 1, 0, t + 1.6, .2); const q = addPiece(B, "Q", 0, 0); tw(q, "opacity", 0, 1, t + 1.7, .3); }
      if (i === 3) movePiece(B, [7, 7], [7, 5], t + 1.6, .6);
    });
  },
  usedBy: ["rules.get_legal_moves (on a copy)", "game.make_move"],
  caps: ["Because the original board is never changed, rules.py can safely try out any move",
    "Each special move needs one extra step on top of the normal lift-and-place",
    "Castling is the only move where two pieces move at once"],
});
