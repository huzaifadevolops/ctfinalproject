"""Shared constants and lookup dictionaries used by every module.

Pieces are single letters: upper case for White, lower case for Black.
    K = king, Q = queen, R = rook, B = bishop, N = knight, P = pawn
An empty square is EMPTY.

Board coordinates are (row, col). Row 0 is rank 8 (Black's back rank)
and row 7 is rank 1 (White's back rank). Col 0 is file a.
"""

EMPTY = "."
WHITE = "w"
BLACK = "b"
BOARD_SIZE = 8

FILES = "abcdefgh"   # index = column
RANKS = "87654321"   # index = row

COLOUR_NAMES = {WHITE: "White", BLACK: "Black"}

PIECE_NAMES = {
    "K": "King",
    "Q": "Queen",
    "R": "Rook",
    "B": "Bishop",
    "N": "Knight",
    "P": "Pawn",
}

# White's back rank from file a to file h (Black's is the lower-case copy).
BACK_RANK = ["R", "N", "B", "Q", "K", "B", "N", "R"]

# Movement directions as (row change, column change) for each piece type.
STRAIGHT = [(-1, 0), (1, 0), (0, -1), (0, 1)]
DIAGONAL = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
DIRECTIONS = {
    "N": [(-2, -1), (-2, 1), (-1, -2), (-1, 2),
          (1, -2), (1, 2), (2, -1), (2, 1)],
    "B": DIAGONAL,
    "R": STRAIGHT,
    "Q": STRAIGHT + DIAGONAL,
    "K": STRAIGHT + DIAGONAL,
}

# Pieces that slide any distance (their moves use recursive ray_moves).
SLIDING_PIECES = "BRQ"

# Pawn movement depends on colour.
PAWN_DIRECTION = {WHITE: -1, BLACK: 1}
PAWN_START_ROW = {WHITE: 6, BLACK: 1}
PROMOTION_ROW = {WHITE: 0, BLACK: 7}
PROMOTION_CHOICES = "QRBN"

# Castling rights keys: K/Q = White king/queen side, k/q = Black.
# Each rook's starting square, used to remove rights when it moves
# or is captured.
ROOK_CORNERS = {(7, 7): "K", (7, 0): "Q", (0, 7): "k", (0, 0): "q"}
CASTLING_KEYS = {WHITE: ("K", "Q"), BLACK: ("k", "q")}
HOME_ROW = {WHITE: 7, BLACK: 0}

# Piece letter -> Unicode display symbol.
SYMBOLS = {
    "K": "♔", "Q": "♕", "R": "♖",
    "B": "♗", "N": "♘", "P": "♙",
    "k": "♚", "q": "♛", "r": "♜",
    "b": "♝", "n": "♞", "p": "♟",
    EMPTY: ".",
}

DEFAULT_SAVE_FILE = "savegame.txt"
