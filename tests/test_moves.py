"""Tests for moves.py: movement patterns for each piece."""

import unittest

from helpers import ChessTestCase
from chessgame.board import board_from_strings, create_board
from chessgame.moves import get_piece_moves, ray_moves

EMPTY_ROWS = ["........"] * 8


def targets(board, square, en_passant=None):
    """Sorted destination squares of the piece on square."""
    moves = get_piece_moves(board, square[0], square[1], en_passant)
    return sorted(move["to"] for move in moves)


def board_with(piece, square, extra=None):
    """An empty board with one piece (plus optional extras)."""
    rows = [list(row) for row in EMPTY_ROWS]
    rows[square[0]][square[1]] = piece
    for (row, col), other in (extra or {}).items():
        rows[row][col] = other
    return board_from_strings(["".join(row) for row in rows])


class TestRayMoves(ChessTestCase):

    def test_ray_stops_at_edge(self):
        board = board_with("R", (7, 0))
        self.assertEqual(len(ray_moves(board, 7, 0, -1, 0, "w")), 7)
        self.assertEqual(ray_moves(board, 7, 0, 1, 0, "w"), [])

    def test_ray_captures_enemy_and_stops(self):
        board = board_with("R", (7, 0), {(4, 0): "p", (2, 0): "p"})
        self.assertEqual(ray_moves(board, 7, 0, -1, 0, "w"),
                         [(6, 0), (5, 0), (4, 0)])

    def test_ray_stops_before_own_piece(self):
        board = board_with("R", (7, 0), {(5, 0): "P"})
        self.assertEqual(ray_moves(board, 7, 0, -1, 0, "w"), [(6, 0)])


class TestPieceMoves(ChessTestCase):

    def test_rook_in_corner(self):
        self.assertEqual(len(targets(board_with("R", (7, 0)), (7, 0))), 14)

    def test_bishop_in_centre(self):
        self.assertEqual(len(targets(board_with("B", (4, 3)), (4, 3))), 13)

    def test_queen_in_centre(self):
        self.assertEqual(len(targets(board_with("Q", (4, 3)), (4, 3))), 27)

    def test_knight_jumps(self):
        board = create_board()
        self.assertEqual(targets(board, (7, 6)), [(5, 5), (5, 7)])

    def test_king_in_corner(self):
        self.assertEqual(len(targets(board_with("K", (7, 7)), (7, 7))), 3)

    def test_pieces_blocked_at_start(self):
        board = create_board()
        for square in ((7, 0), (7, 2), (7, 3), (7, 4)):
            self.assertEqual(targets(board, square), [], square)

    def test_pawn_single_and_double_push(self):
        board = create_board()
        self.assertEqual(targets(board, (6, 4)), [(4, 4), (5, 4)])

    def test_pawn_blocked(self):
        board = board_with("P", (6, 4), {(5, 4): "n"})
        self.assertEqual(targets(board, (6, 4)), [])

    def test_pawn_double_push_blocked(self):
        board = board_with("P", (6, 4), {(4, 4): "n"})
        self.assertEqual(targets(board, (6, 4)), [(5, 4)])

    def test_pawn_captures_diagonally(self):
        board = board_with("P", (4, 4), {(3, 3): "p", (3, 5): "P"})
        self.assertEqual(targets(board, (4, 4)), [(3, 3), (3, 4)])

    def test_black_pawn_moves_down(self):
        board = create_board()
        self.assertEqual(targets(board, (1, 4)), [(2, 4), (3, 4)])

    def test_en_passant_move(self):
        board = board_with("P", (3, 4), {(3, 3): "p"})
        moves = get_piece_moves(board, 3, 4, en_passant=(2, 3))
        special = [m for m in moves if m["special"] == "en_passant"]
        self.assertEqual(len(special), 1)
        self.assertEqual(special[0]["captured"], "p")

    def test_promotion_flag(self):
        board = board_with("P", (1, 0))
        moves = get_piece_moves(board, 1, 0)
        self.assertEqual(moves[0]["special"], "promotion")


if __name__ == "__main__":
    unittest.main()
