"""Tests for board.py and notation.py."""

import unittest

from helpers import ChessTestCase
from chessgame.board import (
    board_to_text, create_board, find_king, piece_colour,
)
from chessgame.notation import parse_move, parse_square, square_name


class TestBoard(ChessTestCase):

    def test_starting_position(self):
        board = create_board()
        self.assertEqual("".join(board[0]), "rnbqkbnr")
        self.assertEqual("".join(board[1]), "pppppppp")
        self.assertEqual("".join(board[4]), "........")
        self.assertEqual("".join(board[7]), "RNBQKBNR")

    def test_find_king(self):
        board = create_board()
        self.assertEqual(find_king(board, "w"), (7, 4))
        self.assertEqual(find_king(board, "b"), (0, 4))

    def test_piece_colour(self):
        self.assertEqual(piece_colour("Q"), "w")
        self.assertEqual(piece_colour("q"), "b")
        self.assertIsNone(piece_colour("."))

    def test_board_text_has_labels(self):
        text = board_to_text(create_board(), use_unicode=False)
        self.assertIn("a b c d e f g h", text)
        self.assertIn("8 | r n b q k b n r | 8", text)


class TestNotation(ChessTestCase):

    def test_parse_square(self):
        self.assertEqual(parse_square("a8"), (0, 0))
        self.assertEqual(parse_square("e2"), (6, 4))
        self.assertEqual(parse_square("h1"), (7, 7))
        self.assertEqual(parse_square("E2"), (6, 4))

    def test_parse_square_invalid(self):
        for text in ("e9", "i2", "e", "e22", "", "22"):
            self.assertIsNone(parse_square(text), text)

    def test_square_name_round_trip(self):
        for name in ("a1", "e4", "h8", "c6"):
            self.assertEqual(square_name(parse_square(name)), name)

    def test_parse_move_formats(self):
        expected = ((6, 4), (4, 4), None)
        self.assertEqual(parse_move("e2 e4"), expected)
        self.assertEqual(parse_move("e2e4"), expected)
        self.assertEqual(parse_move("  E2   E4 "), expected)
        self.assertEqual(parse_move("e7 e8 q"), ((1, 4), (0, 4), "Q"))
        self.assertEqual(parse_move("e7e8n"), ((1, 4), (0, 4), "N"))

    def test_parse_move_invalid(self):
        for text in ("", "hello", "e2", "e9 e4", "e2 e2", "e7 e8 k",
                     "e2 e4 e5 e6", "z1 a1"):
            self.assertIsNone(parse_move(text), text)


if __name__ == "__main__":
    unittest.main()
