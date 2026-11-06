"""Converting between text (e.g. "e2 e4") and board coordinates.

Status: outline only. Every function is still to be implemented.

Coordinates are (row, col): 'a8' is (0, 0), 'e2' is (6, 4), 'h1' is (7, 7).
"""

from .constants import EMPTY, FILES, PROMOTION_CHOICES, RANKS  # noqa: F401


def parse_square(text):
    """Convert a square name like 'e4' to (row, col), or None. FR-07

    Plan:
        1. Return None unless text is exactly 2 characters.
        2. The file letter's position in FILES gives the column.
        3. The rank digit's position in RANKS gives the row.
        4. Return None if either character is not found.
    """
    raise NotImplementedError("notation.parse_square")


def square_name(square):
    """Convert (row, col) to a square name like 'e4'.

    Plan: return FILES[col] + RANKS[row].
    """
    raise NotImplementedError("notation.square_name")


def split_move_text(text):
    """Split move text into parts.

    'e2 e4' -> ['e2', 'e4'];  'e2e4' -> ['e2', 'e4'];
    'e7e8q' -> ['e7', 'e8', 'q'];  'e7 e8 q' -> ['e7', 'e8', 'q'].
    Plan: lower-case and split on spaces; if there is one 4 or 5
    character word, slice it into 2-character squares (+ promotion).
    """
    raise NotImplementedError("notation.split_move_text")


def parse_move(text):
    """Parse a move such as 'e2 e4', 'e2e4' or 'e7 e8 q'. FR-06, EH-01

    Returns (start, end, promotion): start and end are (row, col) and
    promotion is 'Q', 'R', 'B', 'N' or None.
    Returns None if the text is not a valid move.
    Plan:
        1. split_move_text; need 2 or 3 parts.
        2. parse_square on both squares; reject if either is None or
           if start == end.
        3. If there is a 3rd part it must be one of PROMOTION_CHOICES.
    """
    raise NotImplementedError("notation.parse_move")


def move_to_text(move, promotion=None):
    """Describe a move for the history list. FR-27

    Examples: 'e2-e4', 'e4xd5', 'e7-e8=Q', 'e5xd6 e.p.', 'O-O', 'O-O-O'.
    Plan: castling -> 'O-O' (king to g-file) or 'O-O-O'; otherwise
    from-square + ('-' or 'x' if a capture) + to-square, then add
    '=Q' for promotion or ' e.p.' for en passant.
    """
    raise NotImplementedError("notation.move_to_text")


def move_to_input(move, promotion=None):
    """Return the move as typed input, e.g. 'e2 e4' or 'e7 e8 q'.

    Used by save files, which replay the typed moves from the start.
    """
    raise NotImplementedError("notation.move_to_input")
