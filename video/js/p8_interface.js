"use strict";
/* ===================== PART 8: interface.py ===================== */

partScene(8, "interface.py", "The terminal user interface — fully built",
  ["the main loop", "every command", "playing a move", "showing the position",
    "input that never crashes", "a full session, start to finish"]);

/* A terminal window; returns the body element. */
function terminal(sc, x, y, w, h, title, t) {
  const T = E(sc, "term", "", { left: x, top: y, width: w, height: h });
  fadeIn(T, t, .5, 14);
  E(T, "tbar", '<div class="tdotc" style="left:20px;top:16px;width:14px;height:14px;background:#ff5f57"></div>' +
    '<div class="tdotc" style="left:42px;top:16px;width:14px;height:14px;background:#febc2e"></div>' +
    '<div class="tdotc" style="left:64px;top:16px;width:14px;height:14px;background:#28c840"></div>' +
    `<div class="note" style="left:100px;top:11px;font-size:18px">${esc(title)}</div>`, { left: 0, top: 0, width: w, height: 46 });
  return T;
}
/* Script lines: [time, kind ("p" prompt / "o" output / "w" warning / "g" good), text, prompt] */
function playScript(T, s, script, o = {}) {
  const lh = o.lh || 34, fs = o.fs || 20, top = o.top || 62;
  script.forEach(([t, kind, text, prompt], i) => {
    const y = top + i * lh;
    if (kind === "p") {
      const el = E(T, "tl", `<span class="pr">${esc(prompt || "White")}&gt; </span><span class="ty"></span>`, { left: 26, top: y, fontSize: fs });
      fadeIn(el, s + t, .15, 0);
      typeText(el.querySelector(".ty"), text, s + t + .2, 14);
    } else {
      const col = { o: "#cfd6df", w: "var(--amber)", g: "var(--green)", r: "var(--red)", m: "#6b7787" }[kind];
      fadeIn(E(T, "tl", esc(text), { left: 26, top: y, fontSize: fs, color: col }), s + t, .25, 0);
    }
  });
}

addScene("interface overview", 30, (sc, s) => {
  header(sc, s, "interface.py · overview", "built", '<span class="fname">interface.py</span>',
    "The only module that calls input() or prints game messages");
  const fns = [["run()", "the main loop"], ["handle_command()", "routes each line of input"], ["handle_move()", "parse → validate → make"],
    ["show_position()", "board, captures, status"], ["show_legal_moves()", "the moves e2 command"], ["captured_text()", "symbols of taken pieces"],
    ["ask()", "input that survives Ctrl+C"], ["ask_promotion_piece()", "q / r / b / n"], ["safe_game_status()", "status, or None if unbuilt"],
    ["not_built_message()", "the friendly placeholder"]];
  fns.forEach(([n, d], i) => {
    const colN = i % 2, rowN = Math.floor(i / 2);
    const cd = card(sc, 120 + colN * 860, 280 + rowN * 112, 820, 94, `<div class="lbl b" style="left:24px;top:14px;font-size:24px">${esc(n)}</div>` +
      `<div class="tdesc" style="left:24px;top:54px;font-size:19px">${esc(d)}</div>`);
    fadeIn(cd, s + 1 + i * .5, .5, 12);
  });
  narrate(sc, s + .6, s + 29.6, [
    "Ten functions and one help text — all built and working today",
    "It never decides chess questions itself; it asks game.py and rules.py, then prints the answers",
    "Commands that need unbuilt functions print \"not built yet\" instead of crashing",
  ]);
});

fnScene({
  mod: "interface.py", name: "run", pos: "the main loop", status: "built", layout: "code",
  job: "Show the board, read input, run it, repeat",
  code: ["def run():", "    use_unicode = terminal_supports_unicode()", "    state = new_game()",
    "    print(\"Two-Player Chess. Type 'help' for commands.\")", "    show_position(state, use_unicode)",
    "    running = True", "    while running:", "        prompt = COLOUR_NAMES[state[\"turn\"]] + \"> \"",
    "        text = ask(prompt)", "        try:", "            state, running, redraw = handle_command(",
    "                state, text, use_unicode)", "        except NotImplementedError as error:",
    "            print(not_built_message(error))", "            redraw = False",
    "        if running and redraw:", "            show_position(state, use_unicode)", "    print(\"Goodbye!\")"],
  codeFs: 19,
  plan: ["Check the terminal, create a new game, show the board.", "Loop while <code>running</code> is True.",
    "The prompt names the player: <code>White&gt;</code> or <code>Black&gt;</code>.",
    "<code>handle_command</code> returns the new state and two flags.",
    "Unbuilt engine code? Print a friendly message and carry on.",
    "Redraw only when the position changed; say Goodbye at the end."],
  focus: [2, 6, 7, 10, 12, 15],
  gap: 3.6,
  dur: 32,
  reqs: ["FR-03", "FR-05", "FR-33"], usedBy: ["main.main"],
  caps: ["A classic read–evaluate–print loop, like the Python shell itself",
    "The <code>try/except</code> here is the safety net that lets the outline run without crashing",
    "Returning the state means commands like <code>new</code> and <code>load</code> can swap in a whole new game"],
});

addScene("handle_command", 44, (sc, s) => {
  header(sc, s, "interface.py · handle_command", "built", '<span class="fname">handle_command</span>',
    "Runs one line of input — returns (state, keep_running, redraw)");
  const rows = [
    ["(empty line)", "nothing", "state, True, False"],
    ["quit / exit", "stop the loop", "state, False, False"],
    ["help", "print HELP_TEXT", "state, True, False"],
    ["moves e2", "show_legal_moves", "state, True, False"],
    ["history", "history_lines → print", "state, True, False"],
    ["undo", "undo_move → \"Last move undone.\"", "state, True, True"],
    ["new", "\"Starting a new game.\"", "new_game(), True, True"],
    ["save [file]", "save_game → message", "state, True, False"],
    ["load [file]", "load_game → new state or error", "loaded, True, True"],
    ["anything else", "treat it as a move: handle_move", "state, True, played?"],
  ];
  E(sc, "tbl th", "PLAYER TYPES", { left: 140, top: 270 });
  E(sc, "tbl th", "WHAT HAPPENS", { left: 520, top: 270 });
  E(sc, "tbl th", "RETURNS", { left: 1260, top: 270 });
  rows.forEach(([a, b, c], i) => {
    const y = 314 + i * 60;
    const r = E(sc, "", `<div class="tbl" style="left:0;top:0;color:var(--blue)">${esc(a)}</div>` +
      `<div class="tbl" style="left:380px;top:0">${esc(b)}</div>` +
      `<div class="tbl" style="left:1120px;top:0;color:var(--green)">${esc(c)}</div>`, { left: 140, top: y, width: 1700, height: 40 });
    slideIn(r, s + 1.2 + i * 1.6, -20, .4);
  });
  narrate(sc, s + .6, s + 43.6, [
    "The first word decides the command; an optional second word is its argument",
    "Each branch does one thing and returns straight away — easy to read, easy to extend",
    "The redraw flag is True only when the board might have changed",
    "If nothing matches, the text must be a move — so handle_move gets it",
  ]);
});

fnScene({
  mod: "interface.py", name: "handle_move", pos: "playing a move", status: "built", layout: "code",
  job: "Try to play a move typed by the player — returns True if played",
  code: ["def handle_move(state, text):", "    if safe_game_status(state) in (\"checkmate\", \"stalemate\"):",
    "        print(\"The game is over. Type 'undo', 'new' or 'quit'.\")", "        return False",
    "    parsed = parse_move(text)", "    if parsed is None:", "        print(\"Invalid input. Type a move like e2 e4, or 'help'.\")",
    "        return False", "    start, end, promotion = parsed", "    move, error = validate_move(state, start, end)",
    "    if move is None:", "        print(error)", "        return False",
    "    if move[\"special\"] == \"promotion\" and promotion is None:", "        promotion = ask_promotion_piece()",
    "    print(COLOUR_NAMES[state[\"turn\"]] + \" played \"", "          + make_move(state, move, promotion or \"Q\"))", "    return True"],
  codeFs: 18,
  plan: ["Game already over? Say so.", "<code>parse_move</code>: bad format → \"Invalid input\" (EH-01).",
    "<code>validate_move</code>: illegal → print its message (EH-02–06).",
    "Promotion with no letter typed? Ask for one.", "<code>make_move</code>, then print \"White played e2-e4\"."],
  focus: [1, 5, 10, 13, 15],
  gap: 4,
  dur: 30,
  reqs: ["FR-06", "FR-09", "FR-20", "EH-01 – EH-06"], usedBy: ["handle_command"],
  caps: ["Every way a move can fail ends in a printed message and <code>return False</code>",
    "The player can type <code>e7 e8 q</code> in one go, or just <code>e7 e8</code> and be asked",
    "No chess logic here at all — it just connects notation, game and the screen"],
});

fnScene({
  mod: "interface.py", name: "show_position", pos: "after every move", status: "built", layout: "code",
  job: "Print the board, captured pieces, any check message, and whose turn it is",
  code: ["def show_position(state, use_unicode, highlights=None):", "    print()",
    "    print_board(state[\"board\"], use_unicode, highlights)",
    "    print(\"Captured by White: \" + captured_text(state, \"w\", use_unicode))",
    "    print(\"Captured by Black: \" + captured_text(state, \"b\", use_unicode))",
    "    status = safe_game_status(state)", "    player = COLOUR_NAMES[state[\"turn\"]]",
    "    if status == \"checkmate\":", "        winner = COLOUR_NAMES[\"b\" if state[\"turn\"] == \"w\" else \"w\"]",
    "        print(\"Checkmate! \" + winner + \" wins.\")", "    elif status == \"stalemate\":",
    "        print(\"Stalemate! The game is a draw.\")", "    elif status == \"check\":",
    "        print(player + \" is in check!\")", "    if status in (\"checkmate\", \"stalemate\"):",
    "        print(\"Type 'undo', 'new', 'save' or 'quit'.\")", "    else:", "        print(player + \" to move.\")"],
  codeFs: 18,
  plan: ["Draw the board.", "List the pieces each side has captured (FR-29).",
    "Ask for the game status — safely, in case rules.py is not built.",
    "Checkmate names the <b>winner</b>: the side that is <i>not</i> to move.",
    "Otherwise announce check, then whose turn it is (FR-05)."],
  focus: [2, 3, 5, 8, 12],
  gap: 4,
  dur: 30,
  reqs: ["FR-05", "FR-22", "FR-23", "FR-24", "FR-29"], usedBy: ["run", "after undo / new / load"],
  caps: ["Everything the players need to know about the position, every time it changes",
    "When checkmate is reached, the side to move is the loser — so the winner is the other colour"],
});

fnScene({
  mod: "interface.py", name: "show_legal_moves", pos: "the moves command", status: "built",
  job: "Handle 'moves e2': highlight every square the piece can go to",
  code: ["def show_legal_moves(state, square_text, use_unicode):", "    square = parse_square(square_text)",
    "    if square is None:", "        print(\"Invalid square. Use a square like e2.\")", "        return",
    "    moves = get_legal_moves(state, square[0], square[1])", "    if not moves:",
    "        print(\"No legal moves from \" + square_text + \".\")", "        return",
    "    targets = [move[\"to\"] for move in moves]", "    print_board(state[\"board\"], use_unicode, targets)",
    "    names = sorted(square_name(target) for target in targets)",
    "    print(\"Legal moves from \" + square_text + \": \" + \", \".join(names))"],
  codeFs: 17,
  plan: ["Parse the square; get its legal moves from rules.py.",
    "Pass the target squares to print_board as highlights: <code>*</code> empty, <code>x</code> capture."],
  focus: [5, 10],
  gap: 4,
  visual: (sc, s, t0) => {
    const T = terminal(sc, 1060, 290, 740, 560, "moves g1", t0 + 1);
    const rows = ["    a b c d e f g h", "  +-----------------+", "8 | r n b q k b n r | 8", "7 | p p p p p p p p | 7",
      "6 | . . . . . . . . | 6", "5 | . . . . . . . . | 5", "4 | . . . . . . . . | 4", "3 | . . . . . * . * | 3",
      "2 | P P P P P P P P | 2", "1 | R N B Q K B N R | 1", "  +-----------------+", "Legal moves from g1: f3, h3"];
    rows.forEach((r, i) => fadeIn(E(T, "tl", esc(r), { left: 30, top: 66 + i * 38, fontSize: 22,
      color: i === 7 ? "var(--green)" : i === 11 ? "var(--blue)" : "#cfd6df" }), t0 + 2 + i * .08, .2, 0));
  },
  reqs: ["FR-26"], usedBy: ["handle_command (moves)"],
  caps: ["A learning aid: players can ask what any piece is allowed to do",
    "It reuses the same get_legal_moves that validates real moves, so the hint is always right"],
});

fnScene({
  mod: "interface.py", name: "captured_text", pos: "captures", status: "built",
  job: "The symbols of the pieces captured by one side",
  code: ["def captured_text(state, by_colour, use_unicode):", "    symbols = []", "    for piece in state[\"captured\"]:",
    "        captured_by_white = piece.islower()", "        if captured_by_white == (by_colour == \"w\"):",
    "            symbols.append(symbol_for(piece, use_unicode))", "    return \" \".join(symbols) if symbols else \"-\""],
  codeFs: 20,
  plan: ["A black (lower-case) piece in the list was taken by White, and vice versa.",
    "Collect the matching symbols; show <code>-</code> if there are none."],
  focus: [3, 6],
  gap: 4,
  visual: (sc, s, t0) => examples(sc, 1060, 300, 740, [["captured = [\"p\", \"N\", \"p\"]", ""], ["by White", "♟ ♟"], ["by Black", "♘"]],
    t0 + 1, 1.4, { fs: 24, lh: 64, title: "EXAMPLE" }),
  reqs: ["FR-29"], usedBy: ["show_position"],
  caps: ["One shared list holds every capture; the letter's case says who took it"],
});

fnScene({
  mod: "interface.py", name: "ask", pos: "safe input", status: "built",
  job: "Read a line of input — returns 'quit' on Ctrl+C or end of input",
  code: ["def ask(prompt):", "    try:", "        return input(prompt).strip()", "    except (EOFError, KeyboardInterrupt):",
    "        print()", "        return \"quit\""],
  plan: ["Read a line and strip spaces from both ends.",
    "Ctrl+C or a closed input stream would normally crash Python — here they mean \"quit\"."],
  focus: [2, 3],
  gap: 4,
  visual: (sc, s, t0) => {
    const T = terminal(sc, 1060, 300, 740, 220, "python main.py", t0 + 1);
    playScript(T, t0, [[2, "p", "^C"], [3.4, "o", ""], [3.6, "g", "Goodbye!"]], { fs: 22, lh: 40 });
  },
  reqs: ["NFR-07"], usedBy: ["run", "ask_promotion_piece"],
  caps: ["\"Never crash on user input\" includes the keyboard shortcut for stopping a program",
    "The game ends politely instead of printing a Python traceback"],
});

fnScene({
  mod: "interface.py", name: "ask_promotion_piece", pos: "promotion", status: "built",
  job: "Ask which piece to promote to, until a valid letter is given",
  code: ["def ask_promotion_piece():", "    while True:", "        choice = ask(\"Promote to (q/r/b/n): \").upper()",
    "        if choice == \"QUIT\":", "            return \"Q\"", "        if len(choice) == 1 and choice in PROMOTION_CHOICES:",
    "            return choice", "        print(\"Please type q, r, b or n.\")"],
  codeFs: 20,
  plan: ["Loop until the answer is one of Q, R, B or N.", "Anything else: explain and ask again (EH-07)."],
  focus: [5, 7],
  gap: 4,
  visual: (sc, s, t0) => {
    const T = terminal(sc, 1060, 300, 740, 300, "promotion", t0 + 1);
    playScript(T, t0, [[2, "p", "a7 a8"], [3.4, "o", "Promote to (q/r/b/n): k", ""], [4.6, "w", "Please type q, r, b or n."],
      [5.8, "o", "Promote to (q/r/b/n): n"], [7, "g", "White played a7-a8=N"]], { fs: 21, lh: 44 });
  },
  reqs: ["FR-20", "EH-07"], usedBy: ["handle_move"],
  caps: ["A while loop that only ends with a valid answer — the player cannot get it wrong",
    "Even \"k\" is refused: a pawn can never become a second king"],
});

fnScene({
  mod: "interface.py", name: "safe_game_status", pos: "outline support", status: "built",
  job: "get_game_status, or None while the rules engine is not built",
  code: ["def not_built_message(error):", "    return (\"This feature is not built yet (needs \"", "            + str(error) + \"). See MODULES.md.\")",
    "", "def safe_game_status(state):", "    try:", "        return get_game_status(state)", "    except NotImplementedError:", "        return None"],
  codeFs: 20,
  plan: ["<code>not_built_message</code> turns the exception into a friendly sentence.",
    "<code>safe_game_status</code> lets the board be shown even before rules.py exists."],
  focus: [1, 6],
  gap: 4,
  visual: (sc, s, t0) => fadeIn(infoBox(sc, 1060, 300, 740, 250, "TEMPORARY HELPERS",
    "Once the engine is complete these will never trigger — but they let the UI be built and demonstrated first.", "amber", { dfs: 23 }), t0 + 2, .5, 12),
  usedBy: ["run", "show_position", "handle_move"],
  caps: ["The exception's text is the function's name, e.g. notation.parse_move — so the message says what to build next"],
});

addScene("session today", 30, (sc, s) => {
  header(sc, s, "interface.py · today", "built", "What happens if you run it today",
    "The UI works; engine commands report what they still need");
  const T = terminal(sc, 120, 280, 1680, 620, "python main.py", s + .6);
  playScript(T, s, [
    [1.2, "o", "Two-Player Chess. Type 'help' for commands.   (board is drawn here)"],
    [2.6, "p", "help"], [3.6, "o", "Commands:  e2 e4 · moves e2 · history · undo · save · load · new · help · quit"],
    [6, "p", "e2 e4"], [7, "w", "This feature is not built yet (needs notation.parse_move). See MODULES.md."],
    [10, "p", "moves e2"], [11, "w", "This feature is not built yet (needs notation.parse_square). See MODULES.md."],
    [14, "p", "undo"], [15, "w", "This feature is not built yet (needs game.undo_move). See MODULES.md."],
    [18, "p", "new"], [18.8, "o", "Starting a new game.   (board is redrawn)"],
    [21, "p", "quit"], [21.8, "g", "Goodbye!"],
  ], { fs: 22, lh: 42, top: 70 });
  narrate(sc, s + .6, s + 29.6, [
    "Commands that only need the UI — help, new, quit — already work",
    "Everything else names the exact function it is waiting for",
    "As each function is written, the matching command simply starts working",
  ]);
});

addScene("session finished", 48, (sc, s) => {
  header(sc, s, "interface.py · when finished", null, "A session with the finished engine",
    "What the same program will do once every outline is built");
  const T = terminal(sc, 120, 280, 1100, 640, "python main.py", s + .6);
  playScript(T, s, [
    [1.5, "p", "e2 e4", "White"], [2.4, "g", "White played e2-e4"],
    [4, "p", "e7 e5", "Black"], [4.9, "g", "Black played e7-e5"],
    [6.5, "p", "e1 e3", "White"], [7.4, "w", "A king cannot move from e1 to e3."],
    [10, "p", "e5 e4", "White"], [10.9, "w", "That is not your piece."],
    [13.5, "p", "moves g1", "White"], [14.4, "o", "Legal moves from g1: e2, f3, h3"],
    [17, "p", "g1 f3", "White"], [17.9, "g", "White played g1-f3"],
    [20, "p", "history", "Black"], [20.9, "o", "1. e2-e4 e7-e5"], [21.2, "o", "2. g1-f3"],
    [24, "p", "undo", "Black"], [24.9, "o", "Last move undone."],
    [27, "p", "save", "White"], [27.9, "o", "Game saved to savegame.txt"],
  ], { fs: 21, lh: 31, top: 62 });
  const notes = [[6.5, "FR-15 / EH-05", "a king only steps one square"], [10, "FR-09 / EH-03", "it is still White's turn"],
    [13.5, "FR-26", "e2 is free now the pawn has moved"], [20, "FR-27", "numbered history"], [24, "FR-28", "back to White to move"],
    [27, "FR-30", "plain-text save file"]];
  notes.forEach(([t, id, d], i) => fadeIn(card(sc, 1260, 280 + i * 106, 540, 90, `<div class="lbl v" style="left:22px;top:12px;font-size:20px">${id}</div>` +
    `<div class="tdesc" style="left:22px;top:48px;font-size:19px">${esc(d)}</div>`), s + t + .8, .5, 10));
  narrate(sc, s + .6, s + 47.6, [
    "This is the target: the same interface, driving the finished engine",
    "Wrong moves get specific, helpful messages — and the same player tries again",
    "Hints, history, undo and saving all come from functions we have already seen",
    "Each line on the right is a requirement being met",
  ]);
});
