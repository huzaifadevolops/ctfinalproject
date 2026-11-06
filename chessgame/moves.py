"""Move generation for each piece type.

Status: outline only. Every function is still to be implemented.

These functions produce *pseudo-legal* moves: moves that follow each
piece's movement pattern but are not yet checked for leaving the king in
check. The rules module filters them into fully legal moves.

A move is a dictionary:
    {"from": (row, col), "to": (row, col), "piece": "P",
     "captured": "p" or EMPTY, "special": None or one of
     "double_push", "en_passant", "promotion", "castle"}
"""

from .board import copy_board, on_board, piece_colour  # noqa: F401
from .board import piece_type  # noqa: F401
from .constants import (  # noqa: F401
    DIRECTIONS, EMPTY, PAWN_DIRECTION, PAWN_START_ROW, PROMOTION_ROW,
    SLIDING_PIECES, WHITE,
)


def create_move(board, start, end, special=None, captured=None):
    """Build a move dictionary (see the module docstring).

    If captured is None, use whatever piece is on the end square.
    """
    raise NotImplementedError("moves.create_move")


def ray_moves(board, row, col, d_row, d_col, colour):
    """RECURSIVELY collect the squares a sliding piece can reach. FR-16

    Used for rooks, bishops and queens.
    Plan:
        1. Step one square: (row + d_row, col + d_col).
        2. Base case: off the board -> return [].
        3. Empty square -> return [this square] + ray_moves(from here).
        4. Enemy piece -> return [this square] (capture, then stop).
        5. Own piece -> return [] (blocked).
    """
    raise NotImplementedError("moves.ray_moves")


def step_moves(board, row, col, directions, colour):
    """Squares reachable in one step (knight and king). FR-11, FR-15

    Plan: for each (d_row, d_col) in directions, keep the square if it
    is on the board and not occupied by one of our own pieces.
    """
    raise NotImplementedError("moves.step_moves")


def pawn_attack_squares(row, col, colour):
    """The (up to two) diagonal squares a pawn attacks.

    Plan: one row forward (PAWN_DIRECTION[colour]), columns col-1 and
    col+1, keeping only squares on the board.
    """
    raise NotImplementedError("moves.pawn_attack_squares")


def get_attacked_squares(board, row, col):
    """Squares attacked by the piece on (row, col). Used for check.

    Plan:
        - Pawn: pawn_attack_squares (diagonals, even if empty).
        - Bishop/rook/queen: ray_moves for each of its DIRECTIONS.
        - Knight/king: step_moves with its DIRECTIONS.
    """
    raise NotImplementedError("moves.get_attacked_squares")


def get_pawn_moves(board, row, col, en_passant):
    """Pseudo-legal pawn moves. FR-10, FR-19, FR-20

    Plan:
        1. One square forward if empty.
        2. Two squares forward from PAWN_START_ROW if both are empty
           (special = "double_push").
        3. Diagonal captures of enemy pieces.
        4. Diagonal move onto the en_passant square
           (special = "en_passant"; captured pawn is beside us).
        5. Any move reaching PROMOTION_ROW gets special = "promotion".
    """
    raise NotImplementedError("moves.get_pawn_moves")


def get_piece_moves(board, row, col, en_passant=None):
    """All pseudo-legal moves for the piece on (row, col). FR-10..FR-17

    Plan: empty square -> []; pawn -> get_pawn_moves; any other piece ->
    one move per square from get_attacked_squares.
    Castling is added by the rules module, not here.
    """
    raise NotImplementedError("moves.get_piece_moves")


def apply_move(board, move, promotion="Q"):
    """Return a NEW board with the move played (original unchanged).

    Plan:
        1. Copy the board; lift the piece off the from-square.
        2. En passant: also empty the captured pawn's square.
        3. Promotion: replace the pawn with the chosen piece
           (upper case for White, lower case for Black).
        4. Castling: also move the rook (h-file -> f-file for king side,
           a-file -> d-file for queen side).
        5. Put the piece on the to-square and return the new board.
    """
    raise NotImplementedError("moves.apply_move")
