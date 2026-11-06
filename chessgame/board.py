"""Creating, copying, inspecting and displaying the 8x8 board.

Status: display functions are built (UI). Helper functions are outlines.
"""

import sys

from .constants import (
    BACK_RANK, BOARD_SIZE, EMPTY, FILES, RANKS, SYMBOLS,
)


# ---------------------------------------------------------------------
# Board setup (built: the UI needs a board to display)
# ---------------------------------------------------------------------

def create_board():
    """Return a new board (list of 8 lists) in the starting position. FR-01
    """
    board = []
    board.append([piece.lower() for piece in BACK_RANK])
    board.append(["p"] * BOARD_SIZE)
    for _ in range(4):
        board.append([EMPTY] * BOARD_SIZE)
    board.append(["P"] * BOARD_SIZE)
    board.append(list(BACK_RANK))
    return board


# ---------------------------------------------------------------------
# Board helpers (outline: to be implemented)
# ---------------------------------------------------------------------

def board_from_strings(rows):
    """Build a board from 8 strings, rank 8 first, e.g. "rnbqkbnr".

    Used by tests to set up specific positions.
    Plan:
        1. Raise ValueError unless there are 8 rows of 8 characters.
        2. Turn each string into a list of characters.
        3. Return the list of 8 lists.
    """
    raise NotImplementedError("board.board_from_strings")


def copy_board(board):
    """Return an independent copy of the board.

    Plan: build a new list containing a copy of each row (row[:]), so
    changing the copy never changes the original.
    """
    raise NotImplementedError("board.copy_board")


def on_board(row, col):
    """Return True if (row, col) is inside the 8x8 board. FR-17

    Plan: both row and col must be between 0 and BOARD_SIZE - 1.
    """
    raise NotImplementedError("board.on_board")


def piece_colour(piece):
    """Return WHITE, BLACK, or None for an empty square.

    Plan: EMPTY -> None; upper-case letter -> WHITE; otherwise BLACK.
    """
    raise NotImplementedError("board.piece_colour")


def piece_type(piece):
    """Return the upper-case piece letter, e.g. 'n' -> 'N'."""
    raise NotImplementedError("board.piece_type")


def find_king(board, colour):
    """Return the (row, col) of the given side's king, or None.

    Plan (nested iteration):
        1. Work out the king letter: 'K' for White, 'k' for Black.
        2. Loop over every row, and inside that every column.
        3. Return the square as soon as the king letter is found.
    """
    raise NotImplementedError("board.find_king")


# ---------------------------------------------------------------------
# Display (built: part of the UI)
# ---------------------------------------------------------------------

def terminal_supports_unicode():
    """Return True if the terminal can print the chess symbols."""
    encoding = getattr(sys.stdout, "encoding", None) or "ascii"
    try:
        "".join(SYMBOLS.values()).encode(encoding)
        return True
    except (UnicodeEncodeError, LookupError):
        return False


def symbol_for(piece, use_unicode=True):
    """Return the display character for a piece letter. FR-04"""
    if use_unicode:
        return SYMBOLS[piece]
    return piece


def board_to_text(board, use_unicode=True, highlights=None):
    """Return the board as a printable string with rank/file labels. FR-02

    highlights is an optional list of (row, col) squares to mark with '*'
    (empty) or 'x' (capture), used to show legal moves.
    """
    highlights = highlights or []
    file_labels = "    " + " ".join(FILES)
    border = "  +" + "-" * (BOARD_SIZE * 2 + 1) + "+"
    lines = [file_labels, border]
    for row in range(BOARD_SIZE):
        cells = []
        for col in range(BOARD_SIZE):
            piece = board[row][col]
            if (row, col) in highlights:
                cells.append("*" if piece == EMPTY else "x")
            else:
                cells.append(symbol_for(piece, use_unicode))
        rank = RANKS[row]
        lines.append(rank + " | " + " ".join(cells) + " | " + rank)
    lines.append(border)
    lines.append(file_labels)
    return "\n".join(lines)


def print_board(board, use_unicode=True, highlights=None):
    """Print the board to the terminal. FR-03"""
    print(board_to_text(board, use_unicode, highlights))
