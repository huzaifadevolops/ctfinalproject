"""Chess rules: attacks, check, castling, legal moves and game end.

Status: outline only. Every function is still to be implemented.

Functions here take a game-state dictionary (see game.new_game) so they
can see castling rights and the en passant square.
"""

from .board import find_king, piece_colour, piece_type  # noqa: F401
from .constants import (  # noqa: F401
    BLACK, BOARD_SIZE, CASTLING_KEYS, EMPTY, HOME_ROW, WHITE,
)
from .moves import apply_move, create_move  # noqa: F401
from .moves import get_attacked_squares, get_piece_moves  # noqa: F401


def opponent(colour):
    """Return the other side's colour (WHITE <-> BLACK)."""
    raise NotImplementedError("rules.opponent")


def is_square_attacked(board, square, by_colour):
    """Return True if any piece of by_colour attacks the square.

    Plan (nested iteration): loop over every row and column; for each
    piece of by_colour, check whether square is in
    get_attacked_squares for that piece.
    """
    raise NotImplementedError("rules.is_square_attacked")


def is_in_check(board, colour):
    """Return True if the given side's king is attacked. FR-22

    Plan: find_king, then is_square_attacked by the opponent.
    """
    raise NotImplementedError("rules.is_in_check")


def can_castle_side(board, colour, rook_col, empty_cols, safe_cols):
    """Check one castling side for the conditions in FR-18.

    Plan: the rook must be on its home square, every column in
    empty_cols must be empty, and no column in safe_cols may be
    attacked by the opponent.
    """
    raise NotImplementedError("rules.can_castle_side")


def get_castling_moves(board, colour, castling_rights):
    """Return the castling moves currently available to a side. FR-18

    Plan:
        1. The king must be on its home square and not in check.
        2. King side: right still held, f and g empty and safe.
        3. Queen side: right still held, b, c and d empty; c and d safe.
        4. Each castling move is the king's move with special="castle".
    """
    raise NotImplementedError("rules.get_castling_moves")


def get_candidate_moves(state, row, col):
    """Pseudo-legal moves for one piece, plus castling for kings."""
    raise NotImplementedError("rules.get_candidate_moves")


def get_legal_moves(state, row, col):
    """Fully legal moves for the piece on (row, col). FR-21, FR-26

    Plan: for each candidate move, play it on a copy of the board with
    apply_move and keep it only if the mover's king is NOT in check.
    """
    raise NotImplementedError("rules.get_legal_moves")


def get_all_legal_moves(state, colour):
    """Every legal move for one side.

    Plan (nested iteration): loop over all squares; for each piece of
    the given colour, add its get_legal_moves.
    """
    raise NotImplementedError("rules.get_all_legal_moves")


def has_legal_moves(state, colour):
    """Return True if the side has at least one legal move."""
    raise NotImplementedError("rules.has_legal_moves")


def is_checkmate(state, colour):
    """In check and no legal moves. FR-23"""
    raise NotImplementedError("rules.is_checkmate")


def is_stalemate(state, colour):
    """Not in check but no legal moves. FR-24"""
    raise NotImplementedError("rules.is_stalemate")


def get_game_status(state):
    """Return 'checkmate', 'stalemate', 'check' or 'ongoing'.

    Always describes the side whose turn it is (state["turn"]).
    """
    raise NotImplementedError("rules.get_game_status")
