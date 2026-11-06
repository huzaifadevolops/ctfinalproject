"""The interactive terminal interface: prompts, commands and output.

Status: built. Commands that rely on engine functions that are still
outlines print a "not built yet" message instead of crashing.

This is the only module that calls input() or prints game messages; the
other modules just compute results, which keeps them easy to test.
"""

from .board import print_board, symbol_for, terminal_supports_unicode
from .constants import COLOUR_NAMES, DEFAULT_SAVE_FILE, PROMOTION_CHOICES
from .game import (
    history_lines, make_move, new_game, undo_move, validate_move,
)
from .notation import parse_move, parse_square, square_name
from .rules import get_game_status, get_legal_moves
from .storage import load_game, save_game2

HELP_TEXT = """Commands:
  e2 e4        move a piece (also e2e4; add q/r/b/n to promote: e7 e8 q)
  moves e2     show the legal moves for the piece on e2
  history      show the moves played so far
  undo         take back the last move
  save [file]  save the game (default: savegame.txt)
  load [file]  load a saved game (default: savegame.txt)
  new          start a new game
  help         show this list
  quit         leave the game"""


def not_built_message(error):
    """Message shown when a command needs a function not yet written."""
    return ("This feature is not built yet (needs " + str(error)
            + "). See MODULES.md.")


def safe_game_status(state):
    """get_game_status, or None while the rules engine is not built."""
    try:
        return get_game_status(state)
    except NotImplementedError:
        return None


def ask(prompt):
    """Read a line of input. Returns 'quit' on Ctrl+C or end of input."""
    try:
        return input(prompt).strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return "quit"


def ask_promotion_piece():
    """Ask which piece to promote to until a valid letter is given."""
    while True:
        choice = ask("Promote to (q/r/b/n): ").upper()
        if choice == "QUIT":
            return "Q"
        if len(choice) == 1 and choice in PROMOTION_CHOICES:
            return choice
        print("Please type q, r, b or n.")


def captured_text(state, by_colour, use_unicode):
    """Symbols of the pieces captured by one side."""
    symbols = []
    for piece in state["captured"]:
        captured_by_white = piece.islower()
        if captured_by_white == (by_colour == "w"):
            symbols.append(symbol_for(piece, use_unicode))
    return " ".join(symbols) if symbols else "-"


def show_position(state, use_unicode, highlights=None):
    """Print the board, captured pieces and whose turn it is."""
    print()
    print_board(state["board"], use_unicode, highlights)
    print("Captured by White: " + captured_text(state, "w", use_unicode))
    print("Captured by Black: " + captured_text(state, "b", use_unicode))
    status = safe_game_status(state)
    player = COLOUR_NAMES[state["turn"]]
    if status == "checkmate":
        winner = COLOUR_NAMES["b" if state["turn"] == "w" else "w"]
        print("Checkmate! " + winner + " wins.")
    elif status == "stalemate":
        print("Stalemate! The game is a draw.")
    elif status == "check":
        print(player + " is in check!")
    if status in ("checkmate", "stalemate"):
        print("Type 'undo', 'new', 'save' or 'quit'.")
    else:
        print(player + " to move.")


def show_legal_moves(state, square_text, use_unicode):
    """Handle the 'moves <square>' command."""
    square = parse_square(square_text)
    if square is None:
        print("Invalid square. Use a square like e2.")
        return
    moves = get_legal_moves(state, square[0], square[1])
    if not moves:
        print("No legal moves from " + square_text + ".")
        return
    targets = [move["to"] for move in moves]
    print_board(state["board"], use_unicode, targets)
    names = sorted(square_name(target) for target in targets)
    print("Legal moves from " + square_text + ": " + ", ".join(names))


def handle_move(state, text):
    """Try to play a move typed by the player. Returns True if played."""
    if safe_game_status(state) in ("checkmate", "stalemate"):
        print("The game is over. Type 'undo', 'new' or 'quit'.")
        return False
    parsed = parse_move(text)
    if parsed is None:
        print("Invalid input. Type a move like e2 e4, or 'help'.")
        return False
    start, end, promotion = parsed
    move, error = validate_move(state, start, end)
    if move is None:
        print(error)
        return False
    if move["special"] == "promotion" and promotion is None:
        promotion = ask_promotion_piece()
    print(COLOUR_NAMES[state["turn"]] + " played "
          + make_move(state, move, promotion or "Q"))
    return True


def handle_command(state, text, use_unicode):
    """Run one line of input. Returns (state, keep_running, redraw)."""
    words = text.split()
    command = words[0].lower() if words else ""
    argument = words[1] if len(words) > 1 else None

    if command == "":
        return state, True, False
    if command in ("quit", "exit"):
        return state, False, False
    if command == "help":
        print(HELP_TEXT)
        return state, True, False
    if command == "moves":
        if argument is None:
            print("Usage: moves e2")
        else:
            show_legal_moves(state, argument.lower(), use_unicode)
        return state, True, False
    if command == "history":
        lines = history_lines(state)
        print("\n".join(lines) if lines else "No moves yet.")
        return state, True, False
    if command == "undo":
        if undo_move(state):
            print("Last move undone.")
            return state, True, True
        print("Nothing to undo.")
        return state, True, False
    if command == "new":
        print("Starting a new game.")
        return new_game(), True, True
    if command == "save":
        error = save_game(state, argument or DEFAULT_SAVE_FILE)
        print(error or "Game saved to " + (argument or DEFAULT_SAVE_FILE))
        return state, True, False
    if command == "load":
        loaded, error = load_game(argument or DEFAULT_SAVE_FILE)
        if loaded is None:
            print(error)
            return state, True, False
        print("Game loaded.")
        return loaded, True, True
    return state, True, handle_move(state, text)


def run():
    """Main game loop: show the board, read input, repeat."""
    use_unicode = terminal_supports_unicode()
    state = new_game()
    print("Two-Player Chess. Type 'help' for commands.")
    show_position(state, use_unicode)
    running = True
    while running:
        prompt = COLOUR_NAMES[state["turn"]] + "> "
        text = ask(prompt)
        try:
            state, running, redraw = handle_command(state, text,
                                                    use_unicode)
        except NotImplementedError as error:
            print(not_built_message(error))
            redraw = False
        if running and redraw:
            show_position(state, use_unicode)
    print("Goodbye!")
