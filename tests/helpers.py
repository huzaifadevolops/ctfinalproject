"""Shared helpers for building test positions."""

import functools
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(
    __file__))))

from chessgame.board import board_from_strings  # noqa: E402
from chessgame.game import make_move, new_game, validate_move  # noqa: E402
from chessgame.notation import parse_move  # noqa: E402


def skip_if_not_built(test):
    """Wrap a test so an outline function skips it instead of erroring."""
    @functools.wraps(test)
    def wrapper(self):
        try:
            test(self)
        except NotImplementedError as error:
            self.skipTest("not built yet: " + str(error))
    return wrapper


class ChessTestCase(unittest.TestCase):
    """TestCase whose tests are skipped while the code is an outline.

    Once a function is implemented, its tests start running for real.
    """

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        for name, value in list(vars(cls).items()):
            if name.startswith("test") and callable(value):
                setattr(cls, name, skip_if_not_built(value))


def state_from_rows(rows, turn="w", castling=False, en_passant=None):
    """Make a game state from 8 board strings (rank 8 first)."""
    state = new_game()
    state["board"] = board_from_strings(rows)
    state["turn"] = turn
    for key in state["castling"]:
        state["castling"][key] = castling
    state["en_passant"] = en_passant
    return state


def play(state, *move_texts):
    """Play moves like 'e2 e4' in order, failing loudly if one is illegal."""
    for text in move_texts:
        start, end, promotion = parse_move(text)
        move, error = validate_move(state, start, end)
        if move is None:
            raise AssertionError(text + ": " + error)
        make_move(state, move, promotion or "Q")
    return state
