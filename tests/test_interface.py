"""Tests for interface.py: the command logic behind the window.

These need no window and no pygame: interface.py only returns values.
"""

import unittest

from helpers import ChessTestCase, play
from chessgame.game import new_game
from chessgame.interface import (
    captured_by, handle_command, status_lines, try_move,
)


class TestCommands(ChessTestCase):

    def test_help_lists_commands(self):
        result = handle_command(new_game(), "help")
        self.assertTrue(any("undo" in line for line in result["messages"]))
        self.assertFalse(result["quit"])

    def test_quit(self):
        self.assertTrue(handle_command(new_game(), "quit")["quit"])
        self.assertTrue(handle_command(new_game(), "EXIT")["quit"])

    def test_empty_input_does_nothing(self):
        state = new_game()
        result = handle_command(state, "   ")
        self.assertIs(result["state"], state)
        self.assertEqual(result["messages"], [])

    def test_new_game_replaces_state(self):
        state = new_game()
        state["turn"] = "b"
        result = handle_command(state, "new")
        self.assertEqual(result["state"]["turn"], "w")

    def test_invalid_input_message(self):
        result = handle_command(new_game(), "hello")
        self.assertIn("Invalid input", result["messages"][0])

    def test_moves_command_highlights(self):
        result = handle_command(new_game(), "moves e2")
        self.assertEqual(sorted(result["highlights"]), [(4, 4), (5, 4)])


class TestStatusAndMoves(ChessTestCase):

    def test_status_at_start(self):
        self.assertEqual(status_lines(new_game())[-1], "White to move.")

    def test_captured_by(self):
        state = new_game()
        state["captured"] = ["p", "N", "p"]
        self.assertEqual(captured_by(state, "w"), ["p", "p"])
        self.assertEqual(captured_by(state, "b"), ["N"])

    def test_try_move_plays(self):
        state = new_game()
        result = try_move(state, (6, 4), (4, 4))
        self.assertTrue(result["played"])
        self.assertEqual(result["messages"], ["White played e2-e4"])

    def test_promotion_asks_for_piece(self):
        state = play(new_game(), "a2 a4", "b7 b5", "a4 b5", "h7 h6",
                     "b5 b6", "h6 h5", "b6 a7", "h5 h4")
        result = try_move(state, (1, 0), (0, 1))
        self.assertEqual(result["promotion"], ((1, 0), (0, 1)))
        self.assertFalse(result["played"])


if __name__ == "__main__":
    unittest.main()
