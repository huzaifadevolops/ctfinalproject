"""Tests for rules.py: check, legal moves, special moves, game end."""

import unittest

from helpers import ChessTestCase, play, state_from_rows
from chessgame.game import new_game, validate_move
from chessgame.rules import (
    get_all_legal_moves, get_game_status, get_legal_moves, is_checkmate,
    is_in_check, is_stalemate,
)


def legal_targets(state, square):
    moves = get_legal_moves(state, square[0], square[1])
    return sorted(move["to"] for move in moves)


class TestCheck(ChessTestCase):

    def test_twenty_opening_moves(self):
        self.assertEqual(len(get_all_legal_moves(new_game(), "w")), 20)

    def test_rook_gives_check(self):
        state = state_from_rows([
            "....k...",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "....R..K",
        ])
        self.assertTrue(is_in_check(state["board"], "b"))
        self.assertFalse(is_in_check(state["board"], "w"))

    def test_pinned_piece_cannot_move(self):
        state = state_from_rows([
            "....r..k",
            "........",
            "........",
            "........",
            "........",
            "........",
            "....N...",
            "....K...",
        ])
        self.assertEqual(legal_targets(state, (6, 4)), [])
        move, error = validate_move(state, (6, 4), (4, 5))
        self.assertIsNone(move)
        self.assertIn("check", error)

    def test_king_cannot_move_into_check(self):
        state = state_from_rows([
            ".......k",
            "........",
            "........",
            "........",
            "........",
            "........",
            "...r....",
            "....K...",
        ])
        # d1, e2 and f2 are attacked; capturing the loose rook on d2
        # and stepping to f1 are the only legal king moves.
        self.assertEqual(legal_targets(state, (7, 4)), [(6, 3), (7, 5)])

    def test_must_escape_check(self):
        state = play(new_game(), "e2 e4", "f7 f6", "d1 h5")
        self.assertEqual(get_game_status(state), "check")
        move, error = validate_move(state, (1, 0), (2, 0))
        self.assertIsNone(move)


class TestGameEnd(ChessTestCase):

    def test_fools_mate(self):
        state = play(new_game(), "f2 f3", "e7 e5", "g2 g4", "d8 h4")
        self.assertTrue(is_checkmate(state, "w"))
        self.assertEqual(get_game_status(state), "checkmate")

    def test_stalemate(self):
        state = state_from_rows([
            "k.......",
            "........",
            ".Q......",
            "........",
            "........",
            "........",
            "........",
            ".......K",
        ], turn="b")
        self.assertTrue(is_stalemate(state, "b"))
        self.assertEqual(get_game_status(state), "stalemate")


class TestCastling(ChessTestCase):

    ROWS = [
        "r...k..r",
        "........",
        "........",
        "........",
        "........",
        "........",
        "........",
        "R...K..R",
    ]

    def test_both_sides_allowed(self):
        state = state_from_rows(self.ROWS, castling=True)
        self.assertIn((7, 6), legal_targets(state, (7, 4)))
        self.assertIn((7, 2), legal_targets(state, (7, 4)))

    def test_castling_moves_rook(self):
        state = state_from_rows(self.ROWS, castling=True)
        play(state, "e1 g1")
        self.assertEqual("".join(state["board"][7]), "R....RK.")
        self.assertFalse(state["castling"]["K"])
        self.assertFalse(state["castling"]["Q"])

    def test_no_castling_without_rights(self):
        state = state_from_rows(self.ROWS, castling=False)
        self.assertNotIn((7, 6), legal_targets(state, (7, 4)))

    def test_no_castling_through_attacked_square(self):
        rows = list(self.ROWS)
        rows[0] = "r...kr.."  # black rook attacks f1
        state = state_from_rows(rows, castling=True)
        self.assertNotIn((7, 6), legal_targets(state, (7, 4)))
        self.assertIn((7, 2), legal_targets(state, (7, 4)))

    def test_no_castling_out_of_check(self):
        rows = list(self.ROWS)
        rows[0] = "r...r..k"  # black rook checks e1
        state = state_from_rows(rows, castling=True)
        self.assertNotIn((7, 6), legal_targets(state, (7, 4)))
        self.assertNotIn((7, 2), legal_targets(state, (7, 4)))

    def test_no_castling_when_blocked(self):
        rows = list(self.ROWS)
        rows[7] = "RN..K..R"
        state = state_from_rows(rows, castling=True)
        self.assertNotIn((7, 2), legal_targets(state, (7, 4)))

    def test_rights_lost_after_rook_moves(self):
        state = state_from_rows(self.ROWS, castling=True)
        play(state, "h1 h2", "a8 a7", "h2 h1", "a7 a8")
        self.assertNotIn((7, 6), legal_targets(state, (7, 4)))
        self.assertIn((7, 2), legal_targets(state, (7, 4)))


class TestEnPassant(ChessTestCase):

    def test_en_passant_capture(self):
        state = play(new_game(), "e2 e4", "a7 a6", "e4 e5", "d7 d5")
        play(state, "e5 d6")
        self.assertEqual(state["board"][3][3], ".")  # d5 pawn removed
        self.assertEqual(state["board"][2][3], "P")
        self.assertEqual(state["captured"], ["p"])

    def test_en_passant_expires(self):
        state = play(new_game(), "e2 e4", "a7 a6", "e4 e5", "d7 d5",
                     "h2 h3", "h7 h6")
        move, error = validate_move(state, (3, 4), (2, 3))
        self.assertIsNone(move)


class TestPromotion(ChessTestCase):

    def test_promote_to_knight(self):
        state = state_from_rows([
            "....k...",
            "P.......",
            "........",
            "........",
            "........",
            "........",
            "........",
            "....K...",
        ])
        play(state, "a7 a8 n")
        self.assertEqual(state["board"][0][0], "N")

    def test_default_promotion_is_queen(self):
        state = state_from_rows([
            "....k...",
            "........",
            "........",
            "........",
            "........",
            "........",
            "p.......",
            "....K...",
        ], turn="b")
        play(state, "a2 a1")
        self.assertEqual(state["board"][7][0], "q")


if __name__ == "__main__":
    unittest.main()
