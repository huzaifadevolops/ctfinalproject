"""Command logic behind the pygame window: what each action means.

Status: built. Every function here returns values (messages are plain
strings) and never draws or prints; gui.py shows the results. Keeping the
logic out of the drawing code means it can be tested without a window.

Commands that rely on engine functions that are still outlines raise
NotImplementedError; gui.py turns that into a "not built yet" message.

A result is a dictionary:
    "state"      - the game state to use from now on
    "messages"   - list of strings to show the players
    "quit"       - True if the window should close
    "promotion"  - (start, end) if a promotion piece must be chosen
    "highlights" - squares to mark on the board (the "moves" command)
    "played"     - True if a move was made
"""

from .constants import BLACK, COLOUR_NAMES, DEFAULT_SAVE_FILE, WHITE
from .game import (
    history_lines, make_move, new_game, undo_move, validate_move,
)
from .notation import parse_move, parse_square, square_name
from .rules import get_game_status, get_legal_moves
from .storage import load_game, save_game

HELP_LINES = [
    "Click a piece, then click where it should go.",
    "Or type in the box at the bottom and press Enter:",
    "  e2 e4      move (promotion: e7 e8 q)",
    "  moves e2   show legal moves for e2",
    "  history, undo, new, help, quit",
    "  save [file] / load [file]  (default savegame.txt)",
]


def new_result(state, messages=None):
    """A result dictionary with nothing special to report."""
    return {"state": state, "messages": messages or [], "quit": False,
            "promotion": None, "highlights": [], "played": False}


def not_built_message(error):
    """Message shown when an action needs a function not yet written."""
    return ("Not built yet (needs " + str(error) + "). See MODULES.md.")


def safe_game_status(state):
    """get_game_status, or None while the rules engine is not built."""
    try:
        return get_game_status(state)
    except NotImplementedError:
        return None


def is_game_over(state):
    """True after checkmate or stalemate."""
    return safe_game_status(state) in ("checkmate", "stalemate")


def status_lines(state):
    """Lines describing the position: check, game over, whose turn. FR-05"""
    status = safe_game_status(state)
    player = COLOUR_NAMES[state["turn"]]
    if status == "checkmate":
        winner = COLOUR_NAMES[BLACK if state["turn"] == WHITE else WHITE]
        return ["Checkmate! " + winner + " wins.", "Press New or Undo."]
    if status == "stalemate":
        return ["Stalemate! The game is a draw.", "Press New or Undo."]
    if status == "check":
        return [player + " is in check!", player + " to move."]
    return [player + " to move."]


def captured_by(state, by_colour):
    """Letters of the pieces captured by one side. FR-29"""
    pieces = []
    for piece in state["captured"]:
        captured_by_white = piece.islower()
        if captured_by_white == (by_colour == WHITE):
            pieces.append(piece)
    return pieces


def legal_targets(state, square):
    """Squares the piece on square may move to, plus a message. FR-26

    Returns (targets, message); message is None when there are targets.
    """
    targets = [move["to"] for move in
               get_legal_moves(state, square[0], square[1])]
    if targets:
        return targets, None
    return [], "No legal moves from " + square_name(square) + "."


def try_move(state, start, end, promotion=None):
    """Try to play start -> end for the side to move. FR-06, FR-09, FR-20

    If the move is a promotion and no piece was chosen yet, nothing is
    played and result["promotion"] asks the window to offer a choice.
    """
    if is_game_over(state):
        return new_result(state, ["The game is over. Press New or Undo."])
    move, error = validate_move(state, start, end)
    if move is None:
        return new_result(state, [error])
    if move["special"] == "promotion" and promotion is None:
        result = new_result(state, ["Choose a piece to promote to."])
        result["promotion"] = (start, end)
        return result
    player = COLOUR_NAMES[state["turn"]]
    text = make_move(state, move, promotion or "Q")
    result = new_result(state, [player + " played " + text])
    result["played"] = True
    return result


def handle_command(state, text):
    """Run one typed command (or a typed move) and return a result."""
    words = text.split()
    command = words[0].lower() if words else ""
    argument = words[1] if len(words) > 1 else None

    if command == "":
        return new_result(state)
    if command in ("quit", "exit"):
        result = new_result(state, ["Goodbye!"])
        result["quit"] = True
        return result
    if command == "help":
        return new_result(state, list(HELP_LINES))
    if command == "moves":
        return moves_command(state, argument)
    if command == "history":
        return new_result(state, history_lines(state) or ["No moves yet."])
    if command == "undo":
        if undo_move(state):
            return new_result(state, ["Last move undone."])
        return new_result(state, ["Nothing to undo."])
    if command == "new":
        return new_result(new_game(), ["Started a new game."])
    if command == "save":
        filename = argument or DEFAULT_SAVE_FILE
        error = save_game(state, filename)
        return new_result(state, [error or "Game saved to " + filename])
    if command == "load":
        loaded, error = load_game(argument or DEFAULT_SAVE_FILE)
        if loaded is None:
            return new_result(state, [error])
        return new_result(loaded, ["Game loaded."])
    return typed_move(state, text)


def moves_command(state, argument):
    """The 'moves e2' command: highlight the legal targets of a square."""
    if argument is None:
        return new_result(state, ["Usage: moves e2"])
    square = parse_square(argument.lower())
    if square is None:
        return new_result(state, ["Invalid square. Use a square like e2."])
    targets, message = legal_targets(state, square)
    if message:
        return new_result(state, [message])
    names = sorted(square_name(target) for target in targets)
    result = new_result(state, ["Legal moves from " + argument.lower()
                                + ": " + ", ".join(names)])
    result["highlights"] = targets
    return result


def typed_move(state, text):
    """A move typed as text, e.g. 'e2 e4' or 'e7 e8 q'. EH-01"""
    parsed = parse_move(text)
    if parsed is None:
        return new_result(state, ["Invalid input. Type a move like e2 e4,"
                                  " or 'help'."])
    start, end, promotion = parsed
    return try_move(state, start, end, promotion)
