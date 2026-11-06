"use strict";
/* ===================== PART 3: DATA FORMATS ===================== */

partScene(3, "Shared data formats", "Three structures every module agrees on",
  ["the board", "coordinates", "piece letters", "a move dictionary", "the game state", "history entries"]);

/* Draw an 8x8 grid of letters with row/col indexes. Returns cell lookup. */
function letterGrid(sc, x, y, sq, rows, t, o = {}) {
  const cells = {};
  for (let r = 0; r < 8; r++) {
    fadeIn(E(sc, "idx", String(r), { left: x - 40, top: y + r * sq + sq / 2 - 12, width: 30 }), t + .3, .4, 0);
    if (o.ranks) fadeIn(E(sc, "frank", String(8 - r), { left: x + 8 * sq + 10, top: y + r * sq + sq / 2 - 13, width: 30 }), t + .3, .4, 0);
    for (let c = 0; c < 8; c++) {
      const ch = rows[r][c];
      const cell = E(sc, "gcell gl", ch, { left: x + c * sq, top: y + r * sq, width: sq, height: sq,
        color: ch === "." ? "#4a5462" : ch === ch.toUpperCase() ? "#f3f5f8" : "var(--amber)", fontSize: Math.round(sq * .45) });
      tw(cell, "opacity", 0, 1, t + (r * 8 + c) * .012, .3);
      cells[r + "," + c] = cell;
    }
  }
  for (let c = 0; c < 8; c++) {
    fadeIn(E(sc, "idx", String(c), { left: x + c * sq, top: y - 30, width: sq }), t + .3, .4, 0);
    if (o.ranks) fadeIn(E(sc, "frank", FILES[c], { left: x + c * sq, top: y + 8 * sq + 8, width: sq }), t + .3, .4, 0);
  }
  return cells;
}
function hiCell(sc, x, y, sq, r, c, t, t1, col = "blue") {
  const h = E(sc, "", "", { left: x + c * sq - 3, top: y + r * sq - 3, width: sq + 6, height: sq + 6,
    borderRadius: "8px", boxShadow: `0 0 0 4px var(--${col}), 0 0 28px var(--${col})` });
  pop(h, t, .4);
  if (t1) fadeOut(h, t1, .3);
  return h;
}

addScene("board list", 38, (sc, s) => {
  header(sc, s, "DATA · THE BOARD", null, "The board is a list of 8 lists",
    "Each inner list is one row; each item is one square");
  const x = 160, y = 320, sq = 66;
  letterGrid(sc, x, y, sq, START, s + .8);
  fadeIn(E(sc, "note", "col →", { left: x - 4, top: y - 62, fontSize: 18 }), s + 1, .4, 0);
  fadeIn(E(sc, "note", "row ↓", { left: x - 100, top: y - 30, fontSize: 18 }), s + 1, .4, 0);
  const c = code(sc, 860, 300, [
    "board = [",
    "    [\"r\", \"n\", \"b\", \"q\", \"k\", \"b\", \"n\", \"r\"],  # row 0",
    "    [\"p\", \"p\", \"p\", \"p\", \"p\", \"p\", \"p\", \"p\"],  # row 1",
    "    [\".\", \".\", \".\", \".\", \".\", \".\", \".\", \".\"],  # row 2",
    "    ...",
    "    [\"P\", \"P\", \"P\", \"P\", \"P\", \"P\", \"P\", \"P\"],  # row 6",
    "    [\"R\", \"N\", \"B\", \"Q\", \"K\", \"B\", \"N\", \"R\"],  # row 7",
    "]",
  ], { fs: 21, w: 940 });
  fadeIn(c.card, s + 3, .6, 16);
  c.focus(1, s + 6); hiCell(sc, x, y, sq, 0, 0, s + 6, s + 9, "amber");
  c.focus(6, s + 10); hiCell(sc, x, y, sq, 6, 4, s + 13, s + 22);
  c.unfocus(s + 12.5);
  const q = E(sc, "big", "", { left: 860, top: 690, fontSize: 34 });
  fadeIn(q, s + 13, .3, 0);
  typeText(q, "board[6][4]  →  \"P\"", s + 13.2, 14);
  fadeIn(E(sc, "tdesc", "first index = row, second index = column", { left: 860, top: 750, fontSize: 24 }), s + 15, .5, 0);
  const q2 = E(sc, "big", "", { left: 860, top: 810, fontSize: 34 });
  fadeIn(q2, s + 23, .3, 0);
  typeText(q2, "board[0][4]  →  \"k\"", s + 23.2, 14);
  hiCell(sc, x, y, sq, 0, 4, s + 23.2, null, "amber");
  narrate(sc, s + .6, s + 37.6, [
    "A list of lists is the simplest way to model a grid — it is requirement <b class=\"v\">TR-01</b>",
    "Row 0 is Black's back rank at the top; row 7 is White's back rank at the bottom",
    "Two indexes pick out a square: <code>board[row][col]</code>",
    "Empty squares hold a full stop, so every square always holds a one-character string",
  ]);
});

addScene("coordinates", 36, (sc, s) => {
  header(sc, s, "DATA · COORDINATES", null, "From square names to (row, col)",
    "Players say \"e2\"; the program says (6, 4)");
  const x = 160, y = 320, sq = 66;
  letterGrid(sc, x, y, sq, EMPTY8, s + .6, { ranks: true });
  const ex = [["a8", 0, 0], ["e2", 6, 4], ["e4", 4, 4], ["h1", 7, 7]];
  ex.forEach(([n, r, c], i) => {
    const t = s + 3 + i * 4.5;
    hiCell(sc, x, y, sq, r, c, t, t + 4.2, ["amber", "blue", "green", "violet"][i]);
    const el = E(sc, "big", `<span style="color:var(--${["amber", "blue", "green", "violet"][i]})">${n}</span>  →  (${r}, ${c})`,
      { left: 880, top: 320 + i * 70, fontSize: 36 });
    fadeIn(el, t, .5, 10);
  });
  const rule = card(sc, 880, 640, 920, 240, "");
  fadeIn(rule, s + 22, .6, 16);
  E(rule, "lbl a", "THE RULE", { left: 30, top: 24, fontSize: 18, letterSpacing: ".12em" });
  E(rule, "lbl", 'col = FILES.index(file)   <span class="m"># "abcdefgh"</span>', { left: 30, top: 70, fontSize: 25 });
  E(rule, "lbl", 'row = RANKS.index(rank)   <span class="m"># "87654321"</span>', { left: 30, top: 120, fontSize: 25 });
  E(rule, "tdesc", "Both strings live in constants.py — notation.py uses them", { left: 30, top: 178, fontSize: 21 });
  narrate(sc, s + .6, s + 35.6, [
    "Files a–h become columns 0–7, left to right",
    "Ranks are flipped: rank 8 is row 0 and rank 1 is row 7, because the board is printed top-down",
    "Looking a character up in a string gives its index — that is the whole conversion",
  ]);
});

addScene("piece letters", 28, (sc, s) => {
  header(sc, s, "DATA · PIECES", null, "One letter per piece",
    "Upper case is White, lower case is Black");
  const names = [["K", "King"], ["Q", "Queen"], ["R", "Rook"], ["B", "Bishop"], ["N", "Knight"], ["P", "Pawn"]];
  names.forEach(([L, name], i) => {
    const y = 290 + i * 96, t = s + 1 + i * .8;
    const row = E(sc, "", "", { left: 160, top: y, width: 1600, height: 90 });
    slideIn(row, t, -20, .45);
    E(row, "big", L, { left: 0, top: 18, fontSize: 40 });
    E(row, "piece pw", glyph(L), { left: 80, top: 0, width: 80, height: 80, fontSize: 64 });
    E(row, "lbl", name, { left: 200, top: 22, fontSize: 30 });
    E(row, "big", `<span class="a">${L.toLowerCase()}</span>`, { left: 760, top: 18, fontSize: 40 });
    E(row, "piece pb", glyph(L), { left: 840, top: 0, width: 80, height: 80, fontSize: 64,
      webkitTextStroke: "1.2px #cfd6df" });
    E(row, "lbl", "Black " + name.toLowerCase(), { left: 960, top: 22, fontSize: 30, color: "var(--muted)" });
  });
  fadeIn(E(sc, "lbl", '<span class="m">empty square:</span>  "."', { left: 1400, top: 300, fontSize: 30 }), s + 7, .5, 10);
  fadeIn(E(sc, "tdesc wrap", "N is the knight — K is already taken by the king", { left: 1400, top: 360, width: 400, fontSize: 22, lineHeight: 1.4 }), s + 9, .5, 10);
  narrate(sc, s + .6, s + 27.6, [
    "Six piece types, two colours — twelve letters in total",
    "The colour is stored in the letter's case, so one character says everything",
    "<code>piece_colour</code> and <code>piece_type</code> in board.py read these letters back",
  ]);
});

addScene("move dict", 40, (sc, s) => {
  header(sc, s, "DATA · A MOVE", null, "A move is a dictionary",
    "Built by moves.create_move, used by everything after it");
  const c = code(sc, 120, 280, [
    "move = {",
    "    \"from\": (6, 4),        # e2",
    "    \"to\": (4, 4),          # e4",
    "    \"piece\": \"P\",          # what is moving",
    "    \"captured\": \".\",       # what it takes (or \".\")",
    "    \"special\": \"double_push\",",
    "}",
  ], { fs: 25, w: 820 });
  fadeIn(c.card, s + .8, .6, 16);
  [1, 2, 3, 4, 5].forEach((li, i) => c.focus(li, s + 2.5 + i * 1.6));
  c.unfocus(s + 11);
  const specials = [
    ["None", "an ordinary move or capture", "muted"],
    ["\"double_push\"", "a pawn moves two squares from its start", "blue"],
    ["\"en_passant\"", "a pawn captures a pawn that just passed it", "violet"],
    ["\"promotion\"", "a pawn reaches the far rank", "green"],
    ["\"castle\"", "the king moves two squares; the rook jumps over", "amber"],
  ];
  fadeIn(E(sc, "lbl a", "THE FIVE VALUES OF \"special\"", { left: 1010, top: 280, fontSize: 18, letterSpacing: ".12em" }), s + 11, .4, 0);
  specials.forEach(([v, d, col], i) => {
    const y = 320 + i * 104, t = s + 11.5 + i * 2.4;
    const cd = card(sc, 1010, y, 790, 90, `<div class="lbl" style="left:24px;top:14px;color:var(--${col})">${esc(v)}</div>` +
      `<div class="tdesc" style="left:24px;top:52px;font-size:20px">${esc(d)}</div>`);
    fadeIn(cd, t, .5, 12);
  });
  narrate(sc, s + .6, s + 39.6, [
    "A dictionary gives each part of a move a clear name — requirement <b class=\"v\">TR-02</b>",
    "<code>captured</code> is filled in when the move is created, so undo and history know what was taken",
    "The <code>special</code> key tells <code>apply_move</code> when a move needs extra work",
    "Only four moves in chess need special handling — everything else is <code>None</code>",
  ]);
});

addScene("game state", 42, (sc, s) => {
  header(sc, s, "DATA · THE GAME STATE", null, "The game state dictionary",
    "Everything needed to continue a game, in one place — created by game.new_game()");
  const c = code(sc, 120, 280, [
    "state = {",
    "    \"board\": [...],          # the 8x8 list of lists",
    "    \"turn\": \"w\",             # \"w\" or \"b\"",
    "    \"castling\": {\"K\": True, \"Q\": True,",
    "                 \"k\": True, \"q\": True},",
    "    \"en_passant\": None,      # or (row, col)",
    "    \"history\": [],           # one entry per move",
    "    \"captured\": [],          # letters of taken pieces",
    "}",
  ], { fs: 23, w: 860 });
  fadeIn(c.card, s + .8, .6, 16);
  const who = [
    [1, "board", "replaced by make_move with apply_move(...)", "blue"],
    [2, "turn", "switched by make_move after every move", "green"],
    [3, "castling", "K/Q = White king/queen side, k/q = Black. Cleared by update_castling_rights", "amber"],
    [5, "en_passant", "set by update_en_passant after a double push, else None", "violet"],
    [6, "history", "make_move appends; undo_move pops", "blue"],
    [7, "captured", "make_move appends the captured letter", "red"],
  ];
  who.forEach(([li, k, d, col], i) => {
    const t = s + 3 + i * 5;
    c.focus(li, t);
    const b = card(sc, 1030, 280 + i * 106, 770, 92, `<div class="lbl" style="left:24px;top:12px;color:var(--${col})">${k}</div>` +
      `<div class="tdesc wrap" style="left:24px;top:48px;width:720px;font-size:19px">${esc(d)}</div>`);
    fadeIn(b, t, .5, 12);
  });
  c.unfocus(s + 33);
  narrate(sc, s + .6, s + 41.6, [
    "The board alone is not enough to know which moves are legal",
    "You also need to know whose turn it is, who may still castle, and whether en passant is possible",
    "So all of it travels together in one dictionary — requirement <b class=\"v\">FR-25</b>",
    "The rules functions take this whole state, not just the board",
  ]);
});

addScene("history entries", 30, (sc, s) => {
  header(sc, s, "DATA · HISTORY", null, "Each history entry remembers three things", null);
  const c = code(sc, 120, 280, [
    "{",
    "    \"text\": \"e4xd5\",        # for the history list",
    "    \"input\": \"e4 d5\",       # for save files",
    "    \"snapshot\": {           # for undo",
    "        \"board\": <copy>, \"turn\": \"w\",",
    "        \"castling\": <copy>, \"en_passant\": (2, 3),",
    "        \"captured_count\": 0,",
    "    },",
    "}",
  ], { fs: 23, w: 900 });
  fadeIn(c.card, s + .8, .6, 16);
  const uses = [[1, "history command", "shows \"1. e2-e4 d7-d5\"", "blue"], [2, "save command", "writes \"e4 d5\" to the file", "green"],
    [3, "undo command", "restores the position exactly as it was", "amber"]];
  uses.forEach(([li, a, b, col], i) => {
    const t = s + 3 + i * 6;
    c.focus(li, t);
    fadeIn(infoBox(sc, 1080, 290 + i * 190, 720, 160, a, b, col, { tfs: 26, dfs: 23, dtop: 64 }), t, .5, 14);
  });
  c.unfocus(s + 22);
  narrate(sc, s + .6, s + 29.6, [
    "Every move adds one entry to <code>state[\"history\"]</code>",
    "The snapshot is taken <i>before</i> the move, so undo can put everything back",
    "Saving only needs the typed moves — loading replays them from the start",
  ]);
});
