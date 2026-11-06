"""Saving and loading games as plain text files. FR-30, FR-31

Status: outline only. Every function is still to be implemented.

A save file lists the moves played, one per line, e.g. "e2 e4". Loading
replays them from the starting position, so every move is re-validated
and a corrupt or hand-edited file cannot create an illegal position.
"""

from .game import make_move, new_game, validate_move  # noqa: F401
from .notation import parse_move  # noqa: F401

SAVE_HEADER = "# Two-player chess save file: one move per line"


def save_game(state, filename):
    """Write the game's moves to a file. FR-30

    Returns None on success, or an error message string.
    Plan: write SAVE_HEADER, then each history entry's "input" text on
    its own line. Catch OSError and return a message instead of crashing.
    """
    raise NotImplementedError("storage.save_game")


def load_game(filename):
    """Load a game by replaying its moves. FR-31, EH-09

    Returns (state, None) on success, or (None, error message).
    Plan:
        1. Read the file's lines (OSError -> error message).
        2. Start a new_game().
        3. For each line, skipping blanks and '#' comments:
           parse_move -> validate_move -> make_move.
           Any failure -> "Line N: <reason>".
    """
    raise NotImplementedError("storage.load_game")
