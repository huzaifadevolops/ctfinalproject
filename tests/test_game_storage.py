"""Tests for game.py (validation, undo, history) and storage.py."""

import os
import tempfile
import unittest

from helpers import ChessTestCase, play
from chessgame.board import create_board
from chessgame.game import history_lines, new_game, undo_move, validate_move
from chessgame.storage import load_game, save_game


class TestValidation(ChessTestCase):

    def test_empty_square(self):
        move, error = validate_move(new_game(), (4, 4), (3, 4))
        self.assertIsNone(move)
        self.assertIn("no piece", error)

    def test_opponents_piece(self):
        move, error = validate_move(new_game(), (1, 4), (3, 4))
        self.assertIsNone(move)
        self.assertIn("not your piece", error)

    def test_capture_own_piece(self):
        move, error = validate_move(new_game(), (7, 0), (6, 0))
        self.assertIsNone(move)
        self.assertIn("own piece", error)

    def test_illegal_pattern(self):
        move, error = validate_move(new_game(), (6, 4), (3, 4))
        self.assertIsNone(move)
        self.assertIn("pawn cannot move", error)

    def test_turns_alternate(self):
        state = play(new_game(), "e2 e4")
        self.assertEqual(state["turn"], "b")
        _, error = validate_move(state, (4, 4), (3, 4))
        self.assertIn("not your piece", error)


class TestUndoAndHistory(ChessTestCase):

    def test_undo_restores_position(self):
        state = play(new_game(), "e2 e4", "d7 d5", "e4 d5")
        self.assertTrue(undo_move(state))
        self.assertEqual(state["turn"], "w")
        self.assertEqual(state["captured"], [])
        self.assertEqual(state["board"][3][3], "p")
        self.assertEqual(state["en_passant"], (2, 3))

    def test_undo_everything(self):
        state = play(new_game(), "e2 e4", "e7 e5", "e1 e2")
        while undo_move(state):
            pass
        self.assertEqual(state["board"], create_board())
        self.assertTrue(all(state["castling"].values()))

    def test_nothing_to_undo(self):
        self.assertFalse(undo_move(new_game()))

    def test_history_lines(self):
        state = play(new_game(), "f2 f3", "e7 e5", "g2 g4", "d8 h4")
        self.assertEqual(history_lines(state),
                         ["1. f2-f3 e7-e5", "2. g2-g4 d8-h4#"])


class TestStorage(ChessTestCase):

    def setUp(self):
        self.folder = tempfile.mkdtemp()
        self.path = os.path.join(self.folder, "game.txt")

    def test_save_and_load_round_trip(self):
        state = play(new_game(), "e2 e4", "d7 d5", "e4 d5", "g8 f6")
        self.assertIsNone(save_game(state, self.path))
        loaded, error = load_game(self.path)
        self.assertIsNone(error)
        self.assertEqual(loaded["board"], state["board"])
        self.assertEqual(loaded["turn"], state["turn"])
        self.assertEqual(loaded["captured"], state["captured"])

    def test_load_missing_file(self):
        loaded, error = load_game(os.path.join(self.folder, "none.txt"))
        self.assertIsNone(loaded)
        self.assertIn("Could not open", error)

    def test_load_corrupt_file(self):
        with open(self.path, "w", encoding="utf-8") as save_file:
            save_file.write("e2 e4\nbanana\n")
        loaded, error = load_game(self.path)
        self.assertIsNone(loaded)
        self.assertIn("Line 2", error)

    def test_load_illegal_move(self):
        with open(self.path, "w", encoding="utf-8") as save_file:
            save_file.write("e2 e5\n")
        loaded, error = load_game(self.path)
        self.assertIsNone(loaded)
        self.assertIn("Line 1", error)


if __name__ == "__main__":
    unittest.main()
