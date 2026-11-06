"use strict";
/* ============ PART 4: main.py, constants.py, board.py ============ */

partScene(4, "main.py, constants.py & board.py", "The entry point, the fixed tables, and the board itself",
  ["main.py", "constants.py \u2014 every table", "board.py \u2014 11 functions", "create & display (built)",
    "helpers (outline)", "find_king \u2014 nested loops"]);

fnScene({
  mod: "main.py", name: "main", pos: "entry point", status: "built",
  job: "The smallest file in the project \u2014 and the first one to run",
  code: [
    "from chessgame.interface import run",
    "",
    "def main():",
    "    \"\"\"Start the game.\"\"\"",
    "    run()",
    "",
    "if __name__ == \"__main__\":",
    "    main()",
  ],
  codeFs: 20,
  plan: [
    "Imports <code>run</code> from the interface module \u2014 the top layer of the package.",
    "<code>main()</code> does one thing: hands control to <code>interface.run()</code>.",
    "The <code>if __name__ == \"__main__\"</code> guard runs the game only when started as <code>python main.py</code>.",
    "So tests and other scripts can import it without a game starting.",
  ],
  focus: [0, 4, 6, 7],
  reqs: ["FR-33 quit cleanly (via run)"],
  visual: (sc, s, t0) => {
    const T = E(sc, "term", "", { left: 1060, top: 300, width: 740, height: 200 });
    fadeIn(T, t0 + 8, .5, 14);
    const l = E(T, "tl", '<span class="pr">$ </span><span class="ty"></span>', { left: 30, top: 30, fontSize: 24 });
    typeText(l.querySelector(".ty"), "python main.py", t0 + 8.6, 14);
    fadeIn(E(T, "tl", "Two-Player Chess. Type 'help' for commands.", { left: 30, top: 80, fontSize: 20 }), t0 + 10, .3, 0);
    fadeIn(E(T, "tl", "    a b c d e f g h", { left: 30, top: 118, fontSize: 20 }), t0 + 10.2, .3, 0);
  },
  caps: ["main.py is deliberately tiny: all the real work lives inside the chessgame package",
    "The <code>__name__</code> guard is standard Python \u2014 it separates \"run me\" from \"import me\""],
});

addScene("constants overview", 34, (sc, s) => {
  header(sc, s, "constants.py \u00b7 overview", "built", '<span class="fname">constants.py</span>',
    "Every fixed value, defined once \u2014 this module imports nothing");
  const c = code(sc, 120, 270, [
    "EMPTY = \".\"",
    "WHITE = \"w\"",
    "BLACK = \"b\"",
    "BOARD_SIZE = 8",
    "",
    "FILES = \"abcdefgh\"   # index = column",
    "RANKS = \"87654321\"   # index = row",
    "",
    "COLOUR_NAMES = {WHITE: \"White\", BLACK: \"Black\"}",
    "PIECE_NAMES = {\"K\": \"King\", \"Q\": \"Queen\", ...}",
    "BACK_RANK = [\"R\", \"N\", \"B\", \"Q\", \"K\", \"B\", \"N\", \"R\"]",
  ], { fs: 22, w: 900 });
  fadeIn(c.card, s + .8, .6, 16);
  const notes = [
    [0, "EMPTY, WHITE, BLACK", "Named values instead of bare strings \u2014 a typo in a name is an error, a typo in \".\" is a silent bug."],
    [5, "FILES and RANKS", "Turn square names into indexes: FILES.index(\"e\") is 4, RANKS.index(\"2\") is 6."],
    [8, "COLOUR_NAMES, PIECE_NAMES", "Readable words for messages like \"White to move\" or \"A knight cannot move...\""],
    [10, "BACK_RANK", "White's first rank, a to h. create_board lower-cases it for Black."],
  ];
  notes.forEach(([li, a, b], i) => {
    const t = s + 3 + i * 6.5;
    c.focus(li, t);
    fadeIn(infoBox(sc, 1080, 270 + i * 160, 720, 145, a, b, ["blue", "green", "violet", "amber"][i], { dfs: 20 }), t, .5, 14);
  });
  c.unfocus(s + 30);
  narrate(sc, s + .6, s + 33.6, [
    "constants.py is the bottom layer \u2014 every other module reads from it",
    "Defining a value once means it can never get out of sync between files",
    "Many of these are the dictionaries required by <b class=\"v\">TR-02</b>",
  ]);
});

addScene("constants DIRECTIONS", 40, (sc, s) => {
  header(sc, s, "constants.py \u00b7 DIRECTIONS", "built", "How pieces move, as data",
    "(row change, column change) for every direction a piece can go");
  const c = code(sc, 120, 270, [
    "STRAIGHT = [(-1, 0), (1, 0), (0, -1), (0, 1)]",
    "DIAGONAL = [(-1, -1), (-1, 1), (1, -1), (1, 1)]",
    "DIRECTIONS = {",
    "    \"N\": [(-2, -1), (-2, 1), (-1, -2), (-1, 2),",
    "          (1, -2), (1, 2), (2, -1), (2, 1)],",
    "    \"B\": DIAGONAL,",
    "    \"R\": STRAIGHT,",
    "    \"Q\": STRAIGHT + DIAGONAL,",
    "    \"K\": STRAIGHT + DIAGONAL,",
    "}",
    "SLIDING_PIECES = \"BRQ\"",
  ], { fs: 22, w: 820 });
  fadeIn(c.card, s + .8, .6, 16);
  const sq = 58, bx = 1080, by = 290;
  const B = makeBoard(sc, bx, by, sq, ["........", "........", "........", "...N....", "........", "........", "........", "........"], { labels: false });
  boardFade(B, s + 1.2);
  const svg = svgLayer(sc);
  c.focus(3, s + 3);
  const kn = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  kn.forEach(([dr, dc], i) => {
    const t = s + 3.4 + i * .5;
    line(svg, B.cx(3), B.cy(3), B.cx(3 + dc), B.cy(3 + dr), "blue", t, { w: 4, dur: .4 });
    pop(mark(B, 3 + dr, 3 + dc, "fill"), t + .3, .35);
    const lab = E(sc, "note", `(${dr},${dc})`, { left: B.cx(3 + dc) - 28, top: B.cy(3 + dr) - 12, fontSize: 15, color: "#fff" });
    fadeIn(lab, t + .4, .3, 0);
  });
  const fadeAll = s + 12;
  tw(B.el, "opacity", 1, 0, fadeAll, .4);
  tw(svg, "opacity", 1, 0, fadeAll, .4);
  B.labels.forEach(l => tw(l, "opacity", 1, 0, fadeAll, .4));
  sc.querySelectorAll(".note").forEach(n => tw(n, "opacity", 1, 0, fadeAll, .4));
  const B2 = makeBoard(sc, bx, by, sq, ["........", "........", "........", "...Q....", "........", "........", "........", "........"], { labels: false });
  fadeIn(B2.el, fadeAll + .5, .5, 10);
  c.focus(7, fadeAll + .6);
  const svg2 = svgLayer(sc);
  [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc], i) => {
    const t = fadeAll + 1 + i * .45;
    let r = 3, cc = 3, k = 0;
    while (r + dr >= 0 && r + dr < 8 && cc + dc >= 0 && cc + dc < 8) { r += dr; cc += dc; k++; }
    line(svg2, B2.cx(3), B2.cy(3), B2.cx(cc), B2.cy(r), i < 4 ? "green" : "amber", t, { w: 5, dur: .5 });
  });
  c.focus(10, s + 21);
  fadeIn(E(sc, "tdesc wrap", "Queen = rook directions + bishop directions. B, R and Q <b>slide</b> any distance; N and K take <b>one step</b>.",
    { left: 1080, top: 790, width: 720, fontSize: 22, lineHeight: 1.4 }), s + 21, .5, 10);
  c.unfocus(s + 36);
  narrate(sc, s + .6, s + 39.6, [
    "Instead of writing separate code for each piece, the movement patterns are stored as data",
    "A knight has eight fixed jumps \u2014 each one is a (row, column) offset",
    "A queen has eight directions, and slides along each one until something stops her",
    "<code>SLIDING_PIECES</code> tells moves.py which pieces need the recursive <code>ray_moves</code>",
  ]);
});

addScene("constants pawn tables", 34, (sc, s) => {
  header(sc, s, "constants.py \u00b7 PAWN TABLES", "built", "Pawns depend on colour",
    "They are the only piece whose direction depends on who owns it");
  const c = code(sc, 120, 270, [
    "PAWN_DIRECTION = {WHITE: -1, BLACK: 1}",
    "PAWN_START_ROW = {WHITE: 6, BLACK: 1}",
    "PROMOTION_ROW = {WHITE: 0, BLACK: 7}",
    "PROMOTION_CHOICES = \"QRBN\"",
  ], { fs: 24, w: 820 });
  fadeIn(c.card, s + .8, .6, 16);
  const sq = 60, bx = 1120, by = 290;
  const B = makeBoard(sc, bx, by, sq, ["........", "...p....", "........", "........", "........", "........", "....P...", "........"]);
  boardFade(B, s + 1.2);
  const svg = svgLayer(sc);
  c.focus(0, s + 3);
  line(svg, B.cx(4), B.cy(6) - 20, B.cx(4), B.cy(4) + 10, "blue", s + 3.4, { w: 6 });
  line(svg, B.cx(3), B.cy(1) + 20, B.cx(3), B.cy(3) - 10, "amber", s + 4, { w: 6 });
  fadeIn(E(sc, "lbl b", "White: row \u2212 1 (up)", { left: 120, top: 500, fontSize: 25 }), s + 3.6, .4, 0);
  fadeIn(E(sc, "lbl a", "Black: row + 1 (down)", { left: 120, top: 545, fontSize: 25 }), s + 4.2, .4, 0);
  c.focus(1, s + 9);
  const r6 = E(sc, "", "", { left: bx, top: by + 6 * sq, width: 8 * sq, height: sq, background: "rgba(106,169,255,.28)" });
  const r1 = E(sc, "", "", { left: bx, top: by + 1 * sq, width: 8 * sq, height: sq, background: "rgba(240,180,76,.28)" });
  fadeIn(r6, s + 9.2, .4, 0); fadeIn(r1, s + 9.4, .4, 0);
  fadeIn(E(sc, "tdesc", "start rows: a pawn here may move two squares", { left: 120, top: 610, fontSize: 23 }), s + 9.6, .4, 0);
  fadeOut(r6, s + 15); fadeOut(r1, s + 15);
  c.focus(2, s + 15.4);
  const p0 = E(sc, "", "", { left: bx, top: by, width: 8 * sq, height: sq, background: "rgba(76,195,138,.35)" });
  const p7 = E(sc, "", "", { left: bx, top: by + 7 * sq, width: 8 * sq, height: sq, background: "rgba(76,195,138,.35)" });
  fadeIn(p0, s + 15.6, .4, 0); fadeIn(p7, s + 15.8, .4, 0);
  fadeIn(E(sc, "tdesc", "promotion rows: the far side for each colour", { left: 120, top: 660, fontSize: 23 }), s + 16, .4, 0);
  c.focus(3, s + 22);
  fadeIn(E(sc, "tdesc wrap", "PROMOTION_CHOICES: the four pieces a pawn may become \u2014 queen, rook, bishop, knight (never a king).",
    { left: 120, top: 710, width: 860, fontSize: 23, lineHeight: 1.4 }), s + 22.2, .4, 0);
  c.unfocus(s + 30);
  narrate(sc, s + .6, s + 33.6, [
    "Each table is a tiny dictionary keyed by colour \u2014 no if/else needed in the move code",
    "White pawns march up the rows, Black pawns march down",
    "The same tables answer \"may it double-push?\" and \"does it promote?\"",
  ]);
});

addScene("constants castling tables", 34, (sc, s) => {
  header(sc, s, "constants.py \u00b7 CASTLING TABLES", "built", "Castling rights, as data", null);
  const c = code(sc, 120, 270, [
    "# K/Q = White king/queen side, k/q = Black",
    "ROOK_CORNERS = {(7, 7): \"K\", (7, 0): \"Q\",",
    "                (0, 7): \"k\", (0, 0): \"q\"}",
    "CASTLING_KEYS = {WHITE: (\"K\", \"Q\"),",
    "                 BLACK: (\"k\", \"q\")}",
    "HOME_ROW = {WHITE: 7, BLACK: 0}",
  ], { fs: 23, w: 860 });
  fadeIn(c.card, s + .8, .6, 16);
  const sq = 60, bx = 1120, by = 290;
  const B = makeBoard(sc, bx, by, sq, ["r...k..r", "........", "........", "........", "........", "........", "........", "R...K..R"]);
  boardFade(B, s + 1.2);
  c.focus(1, s + 3);
  [[7, 7, "K"], [7, 0, "Q"], [0, 7, "k"], [0, 0, "q"]].forEach(([r, cc, k], i) => {
    const t = s + 3.4 + i * .7;
    pop(mark(B, r, cc, "amber"), t, .4);
    const tag = E(sc, "chip sm outline", k, { left: bx + cc * sq + (cc ? sq + 10 : -50), top: by + r * sq + 14 });
    pop(tag, t + .1, .4);
  });
  fadeIn(E(sc, "tdesc wrap", "Each rook's starting corner \u2192 the castling right it controls. If that rook moves or is captured, the right is lost for good.",
    { left: 120, top: 560, width: 860, fontSize: 23, lineHeight: 1.4 }), s + 6.5, .5, 10);
  c.focus(3, s + 13);
  fadeIn(E(sc, "tdesc wrap", "CASTLING_KEYS: which two rights belong to each side \u2014 a king move clears both.",
    { left: 120, top: 680, width: 860, fontSize: 23, lineHeight: 1.4 }), s + 13.2, .5, 10);
  c.focus(5, s + 19);
  const hr = E(sc, "", "", { left: bx, top: by + 7 * sq, width: 8 * sq, height: sq, boxShadow: "inset 0 0 0 4px var(--blue)" });
  fadeIn(hr, s + 19.2, .4, 0);
  fadeIn(E(sc, "tdesc wrap", "HOME_ROW: the row each king and its rooks start on.",
    { left: 120, top: 770, width: 860, fontSize: 23, lineHeight: 1.4 }), s + 19.2, .5, 10);
  c.unfocus(s + 30);
  narrate(sc, s + .6, s + 33.6, [
    "Castling is allowed only if the king and that rook have never moved",
    "The game state keeps four true/false rights; these tables say which square controls which right",
    "game.update_castling_rights and rules.get_castling_moves both use them",
  ]);
});

addScene("constants symbols", 30, (sc, s) => {
  header(sc, s, "constants.py \u00b7 DISPLAY", "built", "SYMBOLS and the rest", null);
  const sy = [["K", "\u2654"], ["Q", "\u2655"], ["R", "\u2656"], ["B", "\u2657"], ["N", "\u2658"], ["P", "\u2659"],
    ["k", "\u265a"], ["q", "\u265b"], ["r", "\u265c"], ["b", "\u265d"], ["n", "\u265e"], ["p", "\u265f"]];
  fadeIn(E(sc, "lbl a", "SYMBOLS: LETTER \u2192 UNICODE", { left: 120, top: 270, fontSize: 18, letterSpacing: ".12em" }), s + .8, .4, 0);
  sy.forEach(([L, g], i) => {
    const x = 120 + (i % 6) * 145, y = 320 + Math.floor(i / 6) * 120;
    const cd = card(sc, x, y, 125, 100, `<div class="big" style="left:18px;top:30px;font-size:28px">${L}</div>` +
      `<div style="left:62px;top:14px;font-size:54px;font-family:'Segoe UI Symbol'">${g}\uFE0E</div>`);
    pop(cd, s + 1 + i * .15, .4);
  });
  fadeIn(E(sc, "tdesc wrap", "If the terminal cannot print these, the board falls back to the plain letters.",
    { left: 120, top: 580, width: 860, fontSize: 23, lineHeight: 1.4 }), s + 4, .5, 10);
  const rest = [["SLIDING_PIECES = \"BRQ\"", "pieces that use recursive ray_moves"],
    ["PROMOTION_CHOICES = \"QRBN\"", "what a pawn may become"],
    ["DEFAULT_SAVE_FILE = \"savegame.txt\"", "used when save/load get no file name"]];
  rest.forEach(([a, b], i) => fadeIn(card(sc, 1040, 300 + i * 150, 760, 125,
    `<div class="lbl" style="left:24px;top:20px;font-size:23px">${esc(a)}</div><div class="tdesc" style="left:24px;top:66px;font-size:20px">${esc(b)}</div>`),
  s + 8 + i * 3, .5, 14));
  narrate(sc, s + .6, s + 29.6, [
    "Unicode has a symbol for every chess piece \u2014 <code>SYMBOLS</code> maps each letter to one",
    "The display code never hard-codes a symbol; it always looks it up here",
    "That completes constants.py: names, directions, pawn rules, castling and display",
  ]);
});

addScene("board overview", 30, (sc, s) => {
  header(sc, s, "board.py \u00b7 overview", "partial", '<span class="fname">board.py</span>',
    "Creating, inspecting and displaying the 8\u00d78 board");
  const fns = [["create_board()", "the starting position", "built"], ["terminal_supports_unicode()", "can we print \u2654?", "built"],
    ["symbol_for(piece)", "display character", "built"], ["board_to_text(board, \u2026)", "board as a string", "built"],
    ["print_board(board, \u2026)", "prints it", "built"], ["board_from_strings(rows)", "board from 8 strings", "outline"],
    ["copy_board(board)", "independent copy", "outline"], ["on_board(row, col)", "inside the 8\u00d78?", "outline"],
    ["piece_colour(piece)", "\"w\", \"b\" or None", "outline"], ["piece_type(piece)", "\"n\" \u2192 \"N\"", "outline"],
    ["find_king(board, colour)", "where is the king?", "outline"]];
  fns.forEach(([n, d, st], i) => {
    const colN = i < 6 ? 0 : 1, rowN = i < 6 ? i : i - 6;
    const x = 120 + colN * 860, y = 280 + rowN * 104;
    const cd = card(sc, x, y, 820, 88, `<div class="lbl" style="left:24px;top:14px;font-size:23px">${esc(n)}</div>` +
      `<div class="tdesc" style="left:24px;top:52px;font-size:19px">${esc(d)}</div>` +
      `<div class="chip sm ${st}" style="right:20px;top:26px">${st === "built" ? "BUILT" : "OUTLINE"}</div>`);
    fadeIn(cd, s + 1 + i * .5, .5, 12);
  });
  narrate(sc, s + .6, s + 29.6, [
    "board.py has two halves: things the UI needed straight away, and small helpers",
    "Creating and drawing the board is <b class=\"g\">built</b> \u2014 that is why the game can already start",
    "The six helpers are <b class=\"a\">outlines</b>; they are first in the build order because everything uses them",
  ]);
});

fnScene({
  mod: "board.py", name: "create_board", pos: "1 of 11", status: "built",
  job: "Return a new board in the standard starting position",
  code: [
    "def create_board():",
    "    \"\"\"Return a new board in the starting position. FR-01\"\"\"",
    "    board = []",
    "    board.append([piece.lower() for piece in BACK_RANK])",
    "    board.append([\"p\"] * BOARD_SIZE)",
    "    for _ in range(4):",
    "        board.append([EMPTY] * BOARD_SIZE)",
    "    board.append([\"P\"] * BOARD_SIZE)",
    "    board.append(list(BACK_RANK))",
    "    return board",
  ],
  codeFs: 21,
  plan: [
    "Row 0: Black's back rank \u2014 BACK_RANK lower-cased.",
    "Row 1: black pawns. Rows 2\u20135: empty squares.",
    "Row 6: white pawns. Row 7: a <b>copy</b> of BACK_RANK.",
  ],
  focus: [3, 5, 8],
  gap: 3.4,
  reqs: ["FR-01"], tests: ["test_starting_position"], usedBy: ["game.new_game"],
  visual: (sc, s) => {
    const x = 1110, y = 300, sq = 64;
    const order = [[0, 2.8], [1, 6.2], [2, 6.8], [3, 7.1], [4, 7.4], [5, 7.7], [6, 9.6], [7, 10.2]];
    order.forEach(([r, t]) => {
      for (let c = 0; c < 8; c++) {
        const ch = START[r][c];
        const cell = E(sc, "gcell gl", ch, { left: x + c * sq, top: y + r * sq, width: sq, height: sq,
          color: ch === "." ? "#4a5462" : ch === ch.toUpperCase() ? "#f3f5f8" : "var(--amber)" });
        tw(cell, "opacity", 0, 1, s + t + c * .03, .25);
        tw(cell, "x", -30, 0, s + t + c * .03, .35);
      }
      fadeIn(E(sc, "idx", "row " + r, { left: x - 80, top: y + r * sq + 20, width: 70 }), s + t, .3, 0);
    });
  },
  caps: ["The board is built row by row, top to bottom, using the constants",
    "<code>list(BACK_RANK)</code> makes a copy \u2014 so changing the board never changes the constant"],
});

fnScene({
  mod: "board.py", name: "terminal_supports_unicode", pos: "2 of 11", status: "built",
  job: "Can this terminal print the chess symbols?",
  code: [
    "def terminal_supports_unicode():",
    "    encoding = getattr(sys.stdout, \"encoding\", None) or \"ascii\"",
    "    try:",
    "        \"\".join(SYMBOLS.values()).encode(encoding)",
    "        return True",
    "    except (UnicodeEncodeError, LookupError):",
    "        return False",
  ],
  codeFs: 20,
  plan: [
    "Ask Python which text encoding the terminal uses (default to ASCII if unknown).",
    "Try to encode every symbol in SYMBOLS with that encoding.",
    "Success \u2192 True: show \u2654 \u265a. An error \u2192 False: show K k instead.",
  ],
  focus: [1, 3, 5],
  visual: (sc, s, t0) => {
    const a = card(sc, 1060, 300, 740, 220, "");
    fadeIn(a, t0 + 2, .5, 14);
    E(a, "lbl g", "UTF-8 terminal", { left: 28, top: 22, fontSize: 22 });
    E(a, "tl", "8 | \u265c \u265e \u265d \u265b \u265a \u265d \u265e \u265c | 8", { left: 28, top: 80, fontSize: 28 });
    const b = card(sc, 1060, 560, 740, 220, "");
    fadeIn(b, t0 + 6, .5, 14);
    E(b, "lbl a", "old / ASCII-only terminal", { left: 28, top: 22, fontSize: 22 });
    E(b, "tl", "8 | r n b q k b n r | 8", { left: 28, top: 80, fontSize: 28 });
  },
  reqs: ["FR-04", "NFR-01"], usedBy: ["interface.run"],
  caps: ["Some terminals \u2014 especially older Windows ones \u2014 cannot print chess symbols",
    "Instead of crashing, the program quietly switches to plain letters"],
});

fnScene({
  mod: "board.py", name: "symbol_for", pos: "3 of 11", status: "built",
  job: "The character to display for one piece letter",
  code: [
    "def symbol_for(piece, use_unicode=True):",
    "    \"\"\"Return the display character for a piece letter. FR-04\"\"\"",
    "    if use_unicode:",
    "        return SYMBOLS[piece]",
    "    return piece",
  ],
  plan: ["With Unicode: look the letter up in the SYMBOLS dictionary.",
    "Without: the letter itself is the symbol."],
  focus: [3, 4],
  visual: (sc, s, t0) => examples(sc, 1060, 300, 740, [
    ["symbol_for(\"Q\")", "\u2655"], ["symbol_for(\"n\")", "\u265e"], ["symbol_for(\".\")", "."],
    ["symbol_for(\"Q\", False)", "Q"]], t0 + 1, 1.2, { fs: 26, lh: 64 }),
  reqs: ["FR-04"], usedBy: ["board_to_text", "interface.captured_text"],
  caps: ["A dictionary lookup replaces a long chain of if-statements",
    "SYMBOLS also maps \".\" to \".\", so empty squares need no special case"],
});

fnScene({
  mod: "board.py", name: "board_to_text", pos: "4 of 11", status: "built", layout: "code",
  job: "Turn the board into a labelled string, ready to print",
  code: [
    "def board_to_text(board, use_unicode=True, highlights=None):",
    "    highlights = highlights or []",
    "    file_labels = \"    \" + \" \".join(FILES)",
    "    border = \"  +\" + \"-\" * (BOARD_SIZE * 2 + 1) + \"+\"",
    "    lines = [file_labels, border]",
    "    for row in range(BOARD_SIZE):",
    "        cells = []",
    "        for col in range(BOARD_SIZE):",
    "            piece = board[row][col]",
    "            if (row, col) in highlights:",
    "                cells.append(\"*\" if piece == EMPTY else \"x\")",
    "            else:",
    "                cells.append(symbol_for(piece, use_unicode))",
    "        rank = RANKS[row]",
    "        lines.append(rank + \" | \" + \" \".join(cells) + \" | \" + rank)",
    "    lines.append(border)",
    "    lines.append(file_labels)",
    "    return \"\\n\".join(lines)",
  ],
  codeFs: 18,
  plan: ["Build the file letters line and the +---+ border.",
    "Nested loop: for each row, then each column (<b>TR-04</b>).",
    "Highlighted squares show <code>*</code> (empty) or <code>x</code> (capture).",
    "Other squares show their symbol.",
    "Wrap each row in its rank number: <code>8 | \u2026 | 8</code>.",
    "Join all the lines with newlines (<b>TR-03</b>)."],
  focus: [2, 5, 10, 12, 14, 17],
  gap: 3.6,
  dur: 34,
  reqs: ["FR-02", "FR-26", "TR-03", "TR-04"], tests: ["test_board_text_has_labels"], usedBy: ["print_board"],
  caps: ["The board is drawn as text: one string per row, with labels on every side",
    "The highlights option is how <code>moves e2</code> shows where a piece can go",
    "Returning a string instead of printing makes this easy to test"],
});

fnScene({
  mod: "board.py", name: "print_board", pos: "5 of 11", status: "built",
  job: "Print the board to the terminal",
  code: [
    "def print_board(board, use_unicode=True, highlights=None):",
    "    \"\"\"Print the board to the terminal. FR-03\"\"\"",
    "    print(board_to_text(board, use_unicode, highlights))",
  ],
  plan: ["All the work is in board_to_text \u2014 this just prints the result.",
    "Called after every move, so the board is always redrawn."],
  focus: [2, 2],
  visual: (sc, s, t0) => {
    const T = E(sc, "term", "", { left: 1060, top: 290, width: 740, height: 560 });
    fadeIn(T, t0 + .5, .5, 14);
    const rows = ["    a b c d e f g h", "  +-----------------+", "8 | \u265c \u265e \u265d \u265b \u265a \u265d \u265e \u265c | 8",
      "7 | \u265f \u265f \u265f \u265f \u265f \u265f \u265f \u265f | 7", "6 | . . . . . . . . | 6", "5 | . . . . . . . . | 5",
      "4 | . . . . \u2659 . . . | 4", "3 | . . . . . . . . | 3", "2 | \u2659 \u2659 \u2659 \u2659 . \u2659 \u2659 \u2659 | 2",
      "1 | \u2656 \u2658 \u2657 \u2655 \u2654 \u2657 \u2658 \u2656 | 1", "  +-----------------+", "    a b c d e f g h"];
    rows.forEach((r, i) => fadeIn(E(T, "tl", r, { left: 40, top: 40 + i * 40, fontSize: 25 }), t0 + 1 + i * .1, .2, 0));
  },
  reqs: ["FR-03"], usedBy: ["interface.show_position", "interface.show_legal_moves"],
  caps: ["A thin wrapper: calculation in one function, printing in another",
    "That pattern \u2014 compute, then print \u2014 is used throughout the project"],
});

fnScene({
  mod: "board.py", name: "board_from_strings", pos: "6 of 11", status: "outline",
  job: "Build a board from 8 strings \u2014 the quickest way to set up a test position",
  sig: "def board_from_strings(rows):",
  plan: ["Raise <code>ValueError</code> unless there are 8 rows of 8 characters.",
    "Turn each string into a list of characters: <code>list(\"rnbqkbnr\")</code>.",
    "Return the list of 8 lists."],
  visual: (sc, s, t0) => {
    const rows = ["\"....k...\"", "\"........\"", "\"........\"", "\"........\"", "\"........\"", "\"........\"", "\"....N...\"", "\"....K...\""];
    rows.forEach((r, i) => fadeIn(E(sc, "tl", r, { left: 1060, top: 300 + i * 42, fontSize: 24, color: "#a5e07a" }), t0 + .5 + i * .1, .3, 0));
    const svg = svgLayer(sc);
    line(svg, 1260, 450, 1360, 450, "blue", t0 + 5, { w: 4 });
    const B = makeBoard(sc, 1390, 300, 48, ["....k...", "........", "........", "........", "........", "........", "....N...", "....K..."], { labels: false });
    boardFade(B, t0 + 5.6);
    fadeIn(E(sc, "tdesc wrap", "Tests describe positions as pictures made of strings \u2014 easy to read and to write.",
      { left: 1060, top: 720, width: 740, fontSize: 22, lineHeight: 1.4 }), t0 + 7, .5, 10);
  },
  tests: ["used by state_from_rows"], usedBy: ["tests/helpers.py"],
  caps: ["Most tests start from a custom position, not the opening",
    "Rejecting a wrong-sized board early stops confusing test failures later"],
});

fnScene({
  mod: "board.py", name: "copy_board", pos: "7 of 11", status: "outline",
  job: "Return an independent copy of the board",
  sig: "def copy_board(board):",
  plan: ["Build a new list containing a copy of each row: <code>[row[:] for row in board]</code>.",
    "Now changing the copy can never change the original."],
  gap: 4,
  visual: (sc, s, t0) => {
    const a = card(sc, 1060, 290, 740, 270, "");
    fadeIn(a, t0 + .5, .5, 14);
    E(a, "lbl r", "\u2715  copy = board", { left: 28, top: 22, fontSize: 24 });
    E(a, "tdesc wrap", "Both names point at the <b>same</b> lists. Moving a piece on the \"copy\" moves it on the real board too.",
      { left: 28, top: 70, width: 680, fontSize: 21, lineHeight: 1.4 });
    E(a, "tdesc wrap", "Even <code>board[:]</code> is not enough \u2014 it copies the outer list but shares the 8 row lists.",
      { left: 28, top: 170, width: 680, fontSize: 21, lineHeight: 1.4 });
    const b = card(sc, 1060, 590, 740, 200, "");
    fadeIn(b, t0 + 6, .5, 14);
    E(b, "lbl g", "\u2714  [row[:] for row in board]", { left: 28, top: 22, fontSize: 24 });
    E(b, "tdesc wrap", "Nine new lists: one outer list and a fresh copy of every row.",
      { left: 28, top: 74, width: 680, fontSize: 21, lineHeight: 1.4 });
  },
  usedBy: ["moves.apply_move", "game.make_move (snapshot)"],
  caps: ["Lists in Python are shared by reference \u2014 assignment does not copy them",
    "rules.py tries every move on a copy, so a correct copy is essential"],
});

fnScene({
  mod: "board.py", name: "on_board", pos: "8 of 11", status: "outline",
  job: "Is (row, col) inside the 8\u00d78 board?",
  sig: "def on_board(row, col):",
  plan: ["Both row and col must be between 0 and <code>BOARD_SIZE - 1</code>.",
    "In Python that can be one line: <code>0 &lt;= row &lt; 8 and 0 &lt;= col &lt; 8</code>."],
  visual: (sc, s, t0) => {
    examples(sc, 1060, 290, 740, [["on_board(0, 0)", "True"], ["on_board(7, 7)", "True"],
      ["on_board(8, 3)", "False", "r"], ["on_board(2, -1)", "False", "r"]], t0 + .8, 1.2, { fs: 25, lh: 60 });
    fadeIn(E(sc, "tdesc wrap", "A knight on a1 would \"jump\" to row 9 \u2014 on_board throws those squares away.",
      { left: 1060, top: 690, width: 740, fontSize: 22, lineHeight: 1.4 }), t0 + 6, .5, 10);
  },
  reqs: ["FR-17"], usedBy: ["moves.ray_moves", "moves.step_moves", "moves.pawn_attack_squares"],
  caps: ["Every move generator steps to a new square and asks: is this still on the board?",
    "A negative index would not crash in Python \u2014 it would silently wrap around. on_board prevents that"],
});

fnScene({
  mod: "board.py", name: "piece_colour", pos: "9 of 11", status: "outline",
  job: "Which side does a piece belong to?",
  sig: "def piece_colour(piece):",
  plan: ["<code>EMPTY</code> \u2192 <code>None</code>.", "Upper-case letter \u2192 <code>WHITE</code>.",
    "Anything else \u2192 <code>BLACK</code>."],
  visual: (sc, s, t0) => examples(sc, 1060, 290, 740, [["piece_colour(\"Q\")", "\"w\""],
    ["piece_colour(\"q\")", "\"b\""], ["piece_colour(\".\")", "None", "m"]], t0 + .8, 1.4, { fs: 26, lh: 64 }),
  tests: ["test_piece_colour"], usedBy: ["moves.*", "rules.*", "game.validate_move"],
  caps: ["Probably the most-called function in the program",
    "It is how every module tells friend from enemy"],
});

fnScene({
  mod: "board.py", name: "piece_type", pos: "10 of 11", status: "outline",
  job: "The piece letter without its colour",
  sig: "def piece_type(piece):",
  plan: ["Return <code>piece.upper()</code> \u2014 \"n\" and \"N\" are both a knight."],
  visual: (sc, s, t0) => examples(sc, 1060, 290, 740, [["piece_type(\"n\")", "\"N\""],
    ["piece_type(\"K\")", "\"K\""], ["DIRECTIONS[piece_type(\"b\")]", "DIAGONAL"]], t0 + .8, 1.4, { fs: 24, lh: 64 }),
  usedBy: ["moves.get_piece_moves", "game.validate_move"],
  caps: ["Once colour is known, movement only depends on the type",
    "So <code>DIRECTIONS</code> is keyed by upper-case letters only"],
});

fnScene({
  mod: "board.py", name: "find_king", pos: "11 of 11", status: "outline",
  job: "Where is this side's king?",
  sig: "def find_king(board, colour):",
  plan: ["Work out the king letter: <code>'K'</code> for White, <code>'k'</code> for Black.",
    "Loop over every row, and inside that every column (<b>nested iteration</b>).",
    "Return the square as soon as the king letter is found; <code>None</code> if it never is."],
  gap: 4,
  visual: (sc, s, t0) => {
    const B = makeBoard(sc, 1120, 300, 64, ["r.bq.rk.", "pp...ppp", "..n..n..", "...p....", "...P....", "..N.B...", "PP...PPP", "R..QKB.R"]);
    boardFade(B, t0);
    const scan = mark(B, 0, 0, "scan");
    tw(scan, "opacity", 0, 1, t0 + 4, .2);
    const target = 7 * 8 + 4;
    for (let i = 0; i <= target; i++) {
      const t = t0 + 4.2 + i * .1;
      tw(scan, "x", 0, (i % 8) * 64, t, 0);
      tw(scan, "y", 0, Math.floor(i / 8) * 64, t, 0);
    }
    const hit = t0 + 4.2 + target * .1;
    pop(mark(B, 7, 4, "green"), hit + .2, .4);
    fadeIn(E(sc, "big g", "find_king(board, \"w\") \u2192 (7, 4)", { left: 1060, top: 860, fontSize: 28 }), hit + .4, .5, 10);
  },
  visDur: 15,
  reqs: ["TR-04"], tests: ["test_find_king"], usedBy: ["rules.is_in_check"],
  caps: ["One of the nested loops required by the proposal",
    "The white square scans every position, row by row, until it finds the king",
    "rules.is_in_check needs to know where the king is before it can ask if it is attacked"],
});
