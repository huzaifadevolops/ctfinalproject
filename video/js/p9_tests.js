"use strict";
/* ===================== PART 9: TESTS ===================== */

partScene(9, "The tests", "56 tests, written first — the specification in code",
  ["how the tests are organised", "skipping unbuilt code", "position helpers", "every test, file by file",
    "skipped → passed", "writing a new test"]);

addScene("tests layout", 30, (sc, s) => {
  header(sc, s, "tests/ · overview", "spec", "How the tests are organised",
    "One file per area, plus shared helpers");
  const files = [["helpers.py", "ChessTestCase, state_from_rows, play", null, "violet"],
    ["test_board_notation.py", "board setup & display, squares and move parsing", 9, "blue"],
    ["test_moves.py", "rays, every piece, pawns, en passant, promotion", 16, "green"],
    ["test_rules.py", "check, pins, mate, stalemate, castling, en passant, promotion", 18, "amber"],
    ["test_game_storage.py", "error messages, turns, undo, history, save & load", 13, "red"]];
  files.forEach(([f, d, n, col], i) => {
    const y = 280 + i * 120, t = s + 1 + i * 1.5;
    const cd = card(sc, 120, y, 1380, 100, `<div class="lbl" style="left:28px;top:18px;font-size:27px;color:var(--${col})">${f}</div>` +
      `<div class="tdesc" style="left:28px;top:60px;font-size:20px">${esc(d)}</div>`, { css: { borderLeft: `6px solid var(--${col})` } });
    fadeIn(cd, t, .5, 12);
    if (n) pop(E(sc, "big", `${n}`, { left: 1560, top: y + 22, fontSize: 48, color: `var(--${col})` }), t + .4, .5);
  });
  fadeIn(E(sc, "lbl", "= 56 tests", { left: 1540, top: 880, fontSize: 30 }), s + 9, .5, 0);
  narrate(sc, s + .6, s + 29.6, [
    "Each test file matches part of the code, so a failing test points straight at a module",
    "The tests use Python's built-in <code>unittest</code> — nothing to install",
    "Run them all with <code>python -m unittest discover -s tests</code>",
  ]);
});

addScene("ChessTestCase", 40, (sc, s) => {
  header(sc, s, "tests/helpers.py", "built", "Skipping tests for unbuilt code",
    "skip_if_not_built and ChessTestCase");
  const c = code(sc, 120, 270, [
    "def skip_if_not_built(test):",
    "    @functools.wraps(test)",
    "    def wrapper(self):",
    "        try:",
    "            test(self)",
    "        except NotImplementedError as error:",
    "            self.skipTest(\"not built yet: \" + str(error))",
    "    return wrapper",
    "",
    "class ChessTestCase(unittest.TestCase):",
    "    def __init_subclass__(cls, **kwargs):",
    "        super().__init_subclass__(**kwargs)",
    "        for name, value in list(vars(cls).items()):",
    "            if name.startswith(\"test\") and callable(value):",
    "                setattr(cls, name, skip_if_not_built(value))",
  ], { fs: 21, w: 1000 });
  fadeIn(c.card, s + .8, .6, 16);
  const notes = [[2, "A wrapper runs the real test inside a try block.", "blue"],
    [6, "If an outline is hit, the test is skipped — not failed.", "amber"],
    [10, "This runs automatically when a test class is defined…", "violet"],
    [14, "…and wraps every method whose name starts with \"test\".", "green"]];
  notes.forEach(([li, n, col], i) => {
    const t = s + 3 + i * 7;
    c.focus(li, t);
    fadeIn(infoBox(sc, 1170, 280 + i * 150, 630, 130, ["WRAP", "SKIP", "HOOK", "APPLY"][i], n, col, { dfs: 21 }), t, .5, 12);
  });
  c.unfocus(s + 33);
  narrate(sc, s + .6, s + 39.6, [
    "Test files simply inherit from <code>ChessTestCase</code> instead of <code>unittest.TestCase</code>",
    "Every test is then protected: unbuilt code means \"skipped\", not a wall of errors",
    "As soon as a function is written, its tests stop skipping and really run",
    "So the test suite tracks progress automatically",
  ]);
});

addScene("position helpers", 36, (sc, s) => {
  header(sc, s, "tests/helpers.py", "built", "Two helpers for setting up positions", null);
  const a = code(sc, 120, 270, [
    "def state_from_rows(rows, turn=\"w\",",
    "                    castling=False, en_passant=None):",
    "    state = new_game()",
    "    state[\"board\"] = board_from_strings(rows)",
    "    ...  # set turn, castling, en passant",
    "    return state",
  ], { fs: 21, w: 820 });
  fadeIn(a.card, s + .8, .6, 16);
  const b = code(sc, 980, 270, [
    "def play(state, *move_texts):",
    "    for text in move_texts:",
    "        start, end, promotion = parse_move(text)",
    "        move, error = validate_move(state, start, end)",
    "        if move is None:",
    "            raise AssertionError(text + \": \" + error)",
    "        make_move(state, move, promotion or \"Q\")",
    "    return state",
  ], { fs: 21, w: 820 });
  fadeIn(b.card, s + 6, .6, 16);
  const ex = card(sc, 120, 640, 1680, 230, "");
  fadeIn(ex, s + 14, .6, 14);
  E(ex, "lbl a", "USED LIKE THIS", { left: 30, top: 24, fontSize: 18, letterSpacing: ".12em" });
  E(ex, "code", hl("state = play(new_game(), \"f2 f3\", \"e7 e5\", \"g2 g4\", \"d8 h4\")"), { left: 30, top: 70, fontSize: 24 });
  E(ex, "code", hl("self.assertTrue(is_checkmate(state, \"w\"))     # Fool's Mate"), { left: 30, top: 120, fontSize: 24 });
  E(ex, "tdesc", "Moves go through the real parse → validate → make pipeline — exactly like a player's.", { left: 30, top: 176, fontSize: 21 });
  narrate(sc, s + .6, s + 35.6, [
    "<code>state_from_rows</code> builds any position from eight strings, with castling off by default",
    "<code>play</code> plays a list of typed moves, and fails loudly if any of them is illegal",
    "Together they make most tests just two or three lines long",
  ]);
});

/* A scrolling list of test names with one-line descriptions. */
function testList(name, file, rows, dur, caps) {
  addScene(name, dur, (sc, s) => {
    header(sc, s, "tests/ · " + file, "spec", esc(file), `${rows.length} tests`);
    const perCol = Math.ceil(rows.length / 2);
    const gap = Math.min(1.6, (dur - 8) / rows.length);
    rows.forEach(([t, d], i) => {
      const colN = i < perCol ? 0 : 1, rowN = i < perCol ? i : i - perCol;
      const y = 276 + rowN * (rows.length > 12 ? 74 : 82);
      const el = E(sc, "", `<div class="lbl g" style="left:0;top:0;font-size:20px">✔ ${esc(t)}</div>` +
        `<div class="tdesc" style="left:30px;top:30px;font-size:18px">${esc(d)}</div>`, { left: 120 + colN * 860, top: y, width: 820, height: 64 });
      slideIn(el, s + 1 + i * gap, -16, .4);
    });
    narrate(sc, s + .6, s + dur - .4, caps);
  });
}

testList("test_board_notation", "test_board_notation.py", [
  ["test_starting_position", "rows 0, 1, 4 and 7 of create_board()"],
  ["test_find_king", "white king (7,4), black king (0,4)"],
  ["test_piece_colour", "\"Q\" → w, \"q\" → b, \".\" → None"],
  ["test_board_text_has_labels", "file letters and \"8 | r n b q k b n r | 8\""],
  ["test_parse_square", "a8, e2, h1 and capital E2"],
  ["test_parse_square_invalid", "e9, i2, e, e22, empty, 22 → None"],
  ["test_square_name_round_trip", "name → square → name"],
  ["test_parse_move_formats", "e2 e4, e2e4, extra spaces, promotions"],
  ["test_parse_move_invalid", "eight kinds of bad input → None"],
], 30, ["Two of these already pass today: the starting position and the board text",
  "The other seven wait for board helpers and notation.py"]);

testList("test_moves", "test_moves.py", [
  ["test_ray_stops_at_edge", "7 squares one way, 0 the other"],
  ["test_ray_captures_enemy_and_stops", "stops on the first enemy"],
  ["test_ray_stops_before_own_piece", "never lands on a friend"],
  ["test_rook_in_corner", "14 moves"], ["test_bishop_in_centre", "13 moves"], ["test_queen_in_centre", "27 moves"],
  ["test_knight_jumps", "g1 → f3, h3 over the pawns"], ["test_king_in_corner", "3 moves"],
  ["test_pieces_blocked_at_start", "rook, bishop, queen, king: none"],
  ["test_pawn_single_and_double_push", "e2 → e3, e4"], ["test_pawn_blocked", "piece in front: nothing"],
  ["test_pawn_double_push_blocked", "only one square if e4 is taken"], ["test_pawn_captures_diagonally", "enemy only, not own piece"],
  ["test_black_pawn_moves_down", "e7 → e6, e5"], ["test_en_passant_move", "flagged, captured = \"p\""],
  ["test_promotion_flag", "a7 → a8 is \"promotion\""],
], 34, ["Sixteen tests pin down how every piece moves — requirements FR-10 to FR-17",
  "Each one uses an almost empty board, so only one rule is being tested at a time"]);

testList("test_rules", "test_rules.py", [
  ["test_twenty_opening_moves", "White starts with 20"], ["test_rook_gives_check", "check on e8, not on White"],
  ["test_pinned_piece_cannot_move", "pinned knight: no moves"], ["test_king_cannot_move_into_check", "only d2 and f1"],
  ["test_must_escape_check", "a6 does not answer check"], ["test_fools_mate", "checkmate in 4 moves"],
  ["test_stalemate", "king a8, queen b6"], ["test_both_sides_allowed", "g1 and c1 offered"],
  ["test_castling_moves_rook", "R....RK. and rights cleared"], ["test_no_castling_without_rights", "rights off → no castling"],
  ["test_no_castling_through_attacked_square", "f1 attacked"], ["test_no_castling_out_of_check", "king in check"],
  ["test_no_castling_when_blocked", "knight on b1"], ["test_rights_lost_after_rook_moves", "h1–h2–h1 still loses K"],
  ["test_en_passant_capture", "e5xd6 removes the d5 pawn"], ["test_en_passant_expires", "one move later: illegal"],
  ["test_promote_to_knight", "a7 a8 n"], ["test_default_promotion_is_queen", "no letter → queen"],
], 38, ["The biggest file: eighteen tests for the rules engine",
  "Every special rule — castling, en passant, promotion — has both allowed and forbidden cases",
  "These are the tests to watch while building rules.py"]);

testList("test_game_storage", "test_game_storage.py", [
  ["test_empty_square", "\"no piece\""], ["test_opponents_piece", "\"not your piece\""],
  ["test_capture_own_piece", "\"own piece\""], ["test_illegal_pattern", "\"pawn cannot move\""],
  ["test_turns_alternate", "after e2 e4 it is Black's turn"], ["test_undo_restores_position", "board, turn, captures, en passant"],
  ["test_undo_everything", "back to the start, all rights"], ["test_nothing_to_undo", "returns False"],
  ["test_history_lines", "1. f2-f3 e7-e5 / 2. g2-g4 d8-h4#"], ["test_save_and_load_round_trip", "same board, turn, captures"],
  ["test_load_missing_file", "\"Could not open\""], ["test_load_corrupt_file", "\"Line 2\""],
  ["test_load_illegal_move", "\"Line 1\""],
], 32, ["The error-message tests check for key words, so the exact wording can still be polished",
  "Undo is tested by undoing everything and comparing with a brand-new board"]);

addScene("skip to pass", 34, (sc, s) => {
  header(sc, s, "tests/ · progress", "spec", "Watching the tests turn green",
    "What the test run will show as each module is built");
  const groups = [["board helpers", 2], ["notation", 5], ["moves", 16], ["rules", 18], ["game", 9], ["storage", 4]];
  const dots = [];
  for (let i = 0; i < 56; i++) {
    const x = 150 + (i % 8) * 80, y = 300 + Math.floor(i / 8) * 80;
    const d = E(sc, "tdot", "", { left: x, top: y, width: 66, height: 66 });
    pop(d, s + .8 + i * .015, .4);
    dots.push(d);
  }
  dots[0].style.background = dots[1].style.background = "#4cc38a";
  const cmd = E(sc, "card mono", '<span class="pr">$</span> <span class="ty"></span>', { left: 880, top: 296, padding: "14px 22px", fontSize: 22 });
  fadeIn(cmd, s + .9, .4, 10);
  typeText(cmd.querySelector(".ty"), "python -m unittest discover -s tests", s + 1.1, 40);
  const res = E(sc, "big", "OK (skipped=54)", { left: 880, top: 390, fontSize: 34, color: "var(--amber)" });
  fadeIn(res, s + 2.4, .4, 0);
  let idx = 2, passed = 2;
  groups.forEach(([name, n], k) => {
    const y = 470 + k * 70, T = s + 6 + k * 3.4;
    const row = E(sc, "", "", { left: 880, top: y, width: 900, height: 50 });
    E(row, "lbl", `${k + 1}  ${name}`, { left: 0, top: 8, fontSize: 24 });
    const track = E(row, "track", "", { left: 330, top: 16, width: 420, height: 18 });
    const fill = E(track, "fillbar", "", { left: 0, top: 0, width: 0 });
    E(row, "lbl g", `+${n}`, { left: 780, top: 8, fontSize: 24 });
    tw(row, "opacity", 0, .4, s + 3.5, .4);
    tw(row, "opacity", .4, 1, T, .3);
    tw(fill, "w", 0, 100, T, .9, "inOut");
    for (let j = 0; j < n; j++) {
      tw(dots[idx], "bg", "#262d38", "#4cc38a", T + j * .04, 0);
      tw(dots[idx], "scale", 1, 1.12, T + j * .04, .15);
      tw(dots[idx], "scale", 1.12, 1, T + j * .04 + .15, .2);
      idx++;
    }
    passed += n;
    tw(res, "txt", "OK (skipped=54)", passed === 56 ? "OK — 56 passed" : `OK — ${passed} passed, ${56 - passed} skipped`, T + .4, 0);
  });
  tw(res, "color", "#f0b44c", "#4cc38a", s + 6.4, 0);
  narrate(sc, s + .6, s + 33.6, [
    "Today: 2 tests pass and 54 are skipped — that is the expected result for an outline",
    "Each module that gets built turns a block of skipped tests into passes",
    "When all 56 pass, every requirement they cover has been met",
  ]);
});

addScene("writing a test", 34, (sc, s) => {
  header(sc, s, "tests/ · adding more", null, "Writing a new test",
    "Rule 5 in CLAUDE.md: every rule implemented gets tests");
  const c = code(sc, 120, 280, [
    "class TestCheck(ChessTestCase):",
    "",
    "    def test_bishop_gives_check(self):",
    "        state = state_from_rows([",
    "            \"....k...\",",
    "            \"........\",",
    "            \"..B.....\",   # bishop c6 sees e8",
    "            \"........\", \"........\", \"........\",",
    "            \"........\", \"....K...\",",
    "        ])",
    "        self.assertTrue(is_in_check(state[\"board\"], \"b\"))",
  ], { fs: 22, w: 900 });
  fadeIn(c.card, s + .8, .6, 16);
  const st = [[2, "NAME", "starts with test_ and says what it checks", "blue"], [3, "ARRANGE", "build a small position from strings", "amber"],
    [10, "ASSERT", "one clear yes/no question about the result", "green"]];
  st.forEach(([li, a, b, col], i) => {
    const t = s + 3 + i * 7;
    c.focus(li, t);
    fadeIn(infoBox(sc, 1080, 290 + i * 170, 720, 150, a, b, col, { tfs: 26, dfs: 22, dtop: 64 }), t, .5, 12);
  });
  c.unfocus(s + 25);
  narrate(sc, s + .6, s + 33.6, [
    "A good test is small: one position, one question",
    "This one would skip until rules.py is built, then check the bishop's diagonal",
    "Tests for bugs found later can be added the same way, so they never come back",
  ]);
});
