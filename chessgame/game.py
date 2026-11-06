"""Game state: creating a game, validating and making moves, and undo.

Status: new_game is built (the UI needs a state to display). Everything
else is an outline.

The game state is a dictionary:
    "board"      - 8x8 list of lists
    "turn"       - WHITE or BLACK
    "castling"   - {"K": bool, "Q": bool, "k": bool, "q": bool}
    "en_passant" - (row, col) a pawn may capture onto, or None
    "history"    - list of entries: {"text", "input", "snapshot"}
    "captured"   - list of captured piece letters
"""

from .board import copy_board, create_board  # noqa: F401
from .board import piece_colour, piece_type  # noqa: F401
from .constants import (  # noqa: F401
    CASTLING_KEYS, EMPTY, PIECE_NAMES, ROOK_CORNERS, WHITE,
)
from .moves import apply_move  # noqa: F401
from .notation import move_to_input, move_to_text  # noqa: F401
from .notation import square_name  # noqa: F401
from .rules import get_candidate_moves, get_game_status  # noqa: F401
from .rules import get_legal_moves, opponent  # noqa: F401


def new_game():
    """Return the state dictionary for a new game. FR-25"""
    return {
        "board": create_board(),
        "turn": WHITE,
        "castling": {"K": True, "Q": True, "k": True, "q": True},
        "en_passant": None,
        "history": [],
        "captured": [],
    }


def validate_move(state, start, end):
    """Check a move for the side to play. FR-09, EH-02..EH-06

    Returns (move, None) if legal, or (None, error message) if not.
    Plan, in this order:
        1. Empty start square -> "There is no piece on e4."
        2. Opponent's piece -> "That is not your piece..."
        3. Target holds own piece -> "You cannot capture your own piece."
        4. end is in get_legal_moves -> return that move.
        5. end is in get_candidate_moves only ->
           "That move would leave your king in check."
        6. Otherwise -> "A knight cannot move from g1 to g3."
    """
    raise NotImplementedError("game.validate_move")


def update_castling_rights(state, move):
    """Remove castling rights after a king or rook moves or is captured.

    Plan: a king move removes both of that side's rights; a move from or
    to a square in ROOK_CORNERS removes that corner's right.
    """
    raise NotImplementedError("game.update_castling_rights")


def update_en_passant(state, move):
    """Set the en passant square after a two-square pawn push. FR-19

    Plan: for a "double_push" move, the square the pawn skipped over;
    for any other move, None.
    """
    raise NotImplementedError("game.update_en_passant")


def make_move(state, move, promotion="Q"):
    """Play a legal move and record it in the history. FR-27

    Returns the move's text for display, e.g. 'e2-e4' or 'd8-h4#'.
    Plan:
        1. Save a snapshot (board copy, turn, castling copy, en passant,
           number of captured pieces) for undo.
        2. Replace the board with apply_move(...).
        3. Record any captured piece.
        4. Update castling rights and the en passant square.
        5. Switch the turn.
        6. Build the text with move_to_text, adding '+' or '#'.
        7. Append {"text", "input", "snapshot"} to the history.
    """
    raise NotImplementedError("game.make_move")


def undo_move(state):
    """Take back the last move. FR-28, EH-08

    Returns False if there is nothing to undo.
    Plan: pop the last history entry and restore everything from its
    snapshot, trimming the captured list back to its saved length.
    """
    raise NotImplementedError("game.undo_move")


def history_lines(state):
    """Return the history as numbered lines. FR-27

    Example: ['1. e2-e4 e7-e5', '2. g1-f3'].
    Plan: take entries two at a time (White, Black) and number them.
    """
    raise NotImplementedError("game.history_lines")
