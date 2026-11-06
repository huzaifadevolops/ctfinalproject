# Every Move in the Game

This file explains every kind of move in chess, how a player makes it in
our program, and which code handles it. For what each module does in
general, see `MODULES.md`; for the numbered requirements, see
`REQUIREMENTS.md`.

> **Status:** the move rules described here are the plan. The functions
> that implement them (`moves.py`, `rules.py`, `game.py`) are still
> outlines, and the tests named below are skipped until each function is
> written. The window (`gui.py`) and its command logic (`interface.py`)
> are built.

---

## Contents

1. [Reading this file](#1-reading-this-file)
2. [Making a move in the window](#2-making-a-move-in-the-window)
3. [What a move looks like inside the program](#3-what-a-move-looks-like-inside-the-program)
4. [How each piece moves](#4-how-each-piece-moves)
   - [Pawn](#pawn) · [Knight](#knight) · [Bishop](#bishop) ·
     [Rook](#rook) · [Queen](#queen) · [King](#king)
5. [Captures](#5-captures)
6. [Special moves](#6-special-moves)
   - [Double pawn push](#double-pawn-push) ·
     [En passant](#en-passant) · [Promotion](#promotion) ·
     [Castling](#castling)
7. [Legal moves: never leave your king in check](#7-legal-moves-never-leave-your-king-in-check)
8. [Check, checkmate and stalemate](#8-check-checkmate-and-stalemate)
9. [Rejected moves and their messages](#9-rejected-moves-and-their-messages)
10. [Summary table](#10-summary-table)

---

## 1. Reading this file

**Squares** are named by file (a–h, left to right from White's side) and
rank (1–8, bottom to top). Inside the program a square is `(row, col)`:
row 0 is rank 8 and col 0 is file a, so `e2` is `(6, 4)`.

**Pieces** are letters: upper case is White, lower case is Black.
`K` king, `Q` queen, `R` rook, `B` bishop, `N` knight, `P` pawn, `.` empty.

**Diagrams** use the same layout as `board.board_to_text`:

```
* = a square the piece can move to
x = a square the piece can capture on (an enemy piece is there)
```

---

## 2. Making a move in the window

There are two ways to move, and both go through exactly the same checks.

**Click:** click one of your pieces. It is highlighted and its legal
moves are marked (a dot for an empty square, a ring for a capture). Then
click the square to move to. Clicking another of your own pieces switches
the selection; clicking the same piece again, or pressing **Esc**, cancels
it.

**Type:** type the move in the box under the panel and press **Enter**.

| You type | Meaning |
|----------|---------|
| `e2 e4` | move from e2 to e4 |
| `e2e4` | the same, without a space |
| `E2  E4` | capitals and extra spaces are fine |
| `e7 e8 q` | promotion: move to e8 and become a queen (`q`, `r`, `b` or `n`) |
| `e7e8n` | promotion to a knight, without spaces |
| `e1 g1` | castling is typed as the king's move |

If a promotion move is clicked, or typed without a letter, a **picker**
appears over the board with a queen, rook, bishop and knight to choose
from.

After a move, the message box shows e.g. *"White played e2-e4"*, the move
appears in the **Moves** list, and the board is redrawn with the other
player to move.

Code: `gui.click_board`, `interface.try_move`, `interface.typed_move`,
`notation.parse_move`. Requirements FR-03, FR-06–FR-09.

---

## 3. What a move looks like inside the program

Every move is a dictionary, built by `moves.create_move`:

```python
{"from": (6, 4), "to": (4, 4), "piece": "P",
 "captured": ".",            # the piece taken, or "." for none
 "special": "double_push"}   # None, "double_push", "en_passant",
                             # "promotion" or "castle"
```

`special` tells `moves.apply_move` that a move needs extra work. Only four
kinds of move need it; every other move or capture has `special: None`.

Every move is also written two ways:

| Form | Made by | Used for | Examples |
|------|---------|----------|----------|
| History text | `notation.move_to_text` | the Moves list | `e2-e4`, `e4xd5`, `O-O`, `e7-e8=Q`, `e5xd6 e.p.` |
| Typed input | `notation.move_to_input` | save files | `e2 e4`, `e1 g1`, `e7 e8 q` |

`game.make_move` adds `+` to the history text when the move gives check
and `#` when it is checkmate, e.g. `d8-h4#`.

---

## 4. How each piece moves

Movement is worked out in two stages:

1. **`moves.py`** finds the *pseudo-legal* moves: the right shape for the
   piece, on the board, and not onto one of your own pieces.
2. **`rules.py`** throws away any of those that would leave your own king
   in check (section 7) and adds castling.

The directions for every piece are data in `constants.DIRECTIONS`, as
`(row change, column change)` pairs.

### Pawn

**Rule:** a pawn moves straight forward one square, onto an empty square.
From its starting rank it may move two squares if both are empty. It
captures one square diagonally forward. It never moves backwards. White
pawns move up the board (towards rank 8); Black pawns move down.

```
    a b c d e f g h
  +-----------------+
8 | . . . . . . . . | 8
7 | . . . . . . . . | 7
6 | . . . . . . . . | 6
5 | . . . . . . . . | 5
4 | . . . . * . . . | 4      White pawn on e2, black knight on d3:
3 | . . . x * . . . | 3      e3 and e4 forward, capture on d3
2 | . . . . P . . . | 2
1 | . . . . . . . . | 1
  +-----------------+
    a b c d e f g h
```

- **Blocked:** a piece directly in front (of either colour) stops the
  pawn completely. A piece on the second square only stops the double
  push.
- **Captures only diagonally:** a pawn cannot capture straight ahead, and
  it cannot move diagonally onto an empty square (except en passant).
- **Attacks vs moves:** a pawn *attacks* its two diagonal squares even
  when they are empty. That matters for check: a king may not step onto a
  square a pawn attacks.

**Code:** `moves.get_pawn_moves` (pushes, captures, double push, en
passant, promotion) and `moves.pawn_attack_squares` (the diagonals). The
colour-dependent values are in `constants.py`: `PAWN_DIRECTION`
(`w: -1`, `b: +1`), `PAWN_START_ROW` (`w: 6`, `b: 1`) and
`PROMOTION_ROW` (`w: 0`, `b: 7`).

**Requirements:** FR-10. **Tests:** `test_pawn_single_and_double_push`,
`test_pawn_blocked`, `test_pawn_double_push_blocked`,
`test_pawn_captures_diagonally`, `test_black_pawn_moves_down`.

### Knight

**Rule:** a knight moves in an "L": two squares in one direction and one
square sideways. It is the only piece that **jumps** over other pieces.

```
    a b c d e f g h
  +-----------------+
8 | . . . . . . . . | 8
7 | . . . . . . . . | 7
6 | . . * . * . . . | 6
5 | . * . . . * . . | 5      Knight on d4: 8 squares
4 | . . . N . . . . | 4
3 | . * . . . * . . | 3
2 | . . * . * . . . | 2
1 | . . . . . . . . | 1
  +-----------------+
    a b c d e f g h
```

- Near an edge some of the eight jumps land off the board and are dropped.
- At the start, each knight has two moves (g1 to f3 or h3), even though
  it is surrounded by pawns.

**Code:** `moves.step_moves` with `DIRECTIONS["N"]` (eight fixed jumps);
each target is kept if it is on the board (`board.on_board`) and not one
of your own pieces. **Requirements:** FR-11, FR-17. **Test:**
`test_knight_jumps`.

### Bishop

**Rule:** a bishop moves any number of squares diagonally. It cannot jump:
it stops at the board edge or at the first piece in its way, which it may
capture if it is an enemy. A bishop stays on squares of one colour all
game.

```
    a b c d e f g h
  +-----------------+
8 | . . . . . . . * | 8
7 | * . . . . . * . | 7
6 | . * . . . * . . | 6
5 | . . * . * . . . | 5      Bishop on d4, empty board: 13 squares
4 | . . . B . . . . | 4
3 | . . * . * . . . | 3
2 | . * . . . * . . | 2
1 | * . . . . . * . | 1
  +-----------------+
    a b c d e f g h
```

**Code:** `moves.ray_moves`, called once for each of the four diagonal
directions in `DIRECTIONS["B"]`. **Requirements:** FR-12, FR-16.
**Test:** `test_bishop_in_centre` (13 moves).

### Rook

**Rule:** a rook moves any number of squares along a rank or file, and
stops in the same way as a bishop.

```
    a b c d e f g h
  +-----------------+
8 | . . . . . . . . | 8
7 | . . . . . . . . | 7
6 | . . . . . . . . | 6
5 | . . . . . . . . | 5      Rook on a1, own pawn on a4,
4 | P . . . . . . . | 4      enemy knight on e1:
3 | * . . . . . . . | 3      up to a3 (stops before its own pawn),
2 | * . . . . . . . | 2      right to e1 (captures, then stops)
1 | R * * * x . . . | 1
  +-----------------+
    a b c d e f g h
```

On an empty board a rook in a corner has 14 moves.

**Code:** `moves.ray_moves` for each of the four straight directions in
`DIRECTIONS["R"]`. **Requirements:** FR-13, FR-16, FR-17. **Tests:**
`test_rook_in_corner` (14), and the three `test_ray_*` tests.

#### How sliding works: recursion

Bishops, rooks and queens all use one **recursive** function,
`ray_moves(board, row, col, d_row, d_col, colour)` (requirement TR-05). It
steps one square in the direction, then:

| The next square is... | `ray_moves` returns |
|-----------------------|---------------------|
| off the board | `[]` (the base case) |
| one of your own pieces | `[]` (blocked) |
| an enemy piece | `[that square]` (a capture, then stop) |
| empty | `[that square] + ray_moves(from that square)` |

For the rook above, going up: a2 is empty, a3 is empty, a4 is our own
pawn, so the calls return `[a2] + [a3] + []` = `[a2, a3]`.

### Queen

**Rule:** a queen moves like a rook *or* a bishop: any distance in any of
the eight directions, stopping at pieces as they do.

```
    a b c d e f g h
  +-----------------+
8 | . . . * . . . * | 8
7 | * . . * . . * . | 7
6 | . * . * . * . . | 6
5 | . . * * * . . . | 5      Queen on d4, empty board: 27 squares
4 | * * * Q * * * * | 4      (14 rook moves + 13 bishop moves)
3 | . . * * * . . . | 3
2 | . * . * . * . . | 2
1 | * . . * . . * . | 1
  +-----------------+
    a b c d e f g h
```

**Code:** `moves.ray_moves` for all eight directions in
`DIRECTIONS["Q"]` (`STRAIGHT + DIAGONAL`). **Requirements:** FR-14, FR-16.
**Test:** `test_queen_in_centre` (27).

### King

**Rule:** a king moves one square in any direction. It may never move onto
a square attacked by the opponent (section 7). It also has one special
move, castling (section 6).

```
    a b c d e f g h
  +-----------------+
8 | . . . . . . . . | 8
7 | . . . . . . . . | 7
6 | . . . . . . . . | 6
5 | . . . * * * . . | 5      King on e4, empty board: 8 squares
4 | . . . * K * . . | 4
3 | . . . * * * . . | 3
2 | . . . . . . . . | 2
1 | . . . . . . . . | 1
  +-----------------+
    a b c d e f g h
```

In a corner the king has only 3 squares.

**Code:** `moves.step_moves` with `DIRECTIONS["K"]`; castling is added by
`rules.get_castling_moves`; unsafe squares are removed by
`rules.get_legal_moves`. **Requirements:** FR-15, FR-21. **Tests:**
`test_king_in_corner` (3), `test_king_cannot_move_into_check`.

---

## 5. Captures

A capture is a normal move onto a square holding an **enemy** piece; the
enemy piece is removed from the board. Every piece except the pawn
captures the same way it moves. The pawn captures diagonally.

- You can never capture your own piece (EH-04).
- The captured letter is stored in the move as `"captured"` and appended
  to `state["captured"]` by `game.make_move`. The panel shows each side's
  captures (FR-29), using `interface.captured_by`.
- The history text uses `x` instead of `-`: `e4xd5`.
- Kings are never captured: because no move may leave a king in check,
  the game ends with checkmate before a king could ever be taken.

---

## 6. Special moves

### Double pawn push

**Rule:** a pawn that has not moved yet (still on its starting rank) may
move **two** squares forward, if both squares are empty.

- The move gets `special: "double_push"`.
- Afterwards `game.update_en_passant` records the square the pawn skipped
  over (e2–e4 records e3). That square is the en passant target for the
  opponent's **next** move only.

**Code:** `moves.get_pawn_moves` (step 2 of its plan),
`game.update_en_passant`. **Requirements:** FR-10, FR-19, FR-25.

### En passant

**Rule:** if a pawn moves two squares and lands right beside an enemy pawn,
the enemy pawn may capture it *as if it had moved only one square*. The
capture is only allowed on the very next move.

```
    a b c d e f g h
  +-----------------+       After 1. e2-e4 a7-a6  2. e4-e5 d7-d5:
8 | r n b q k b n r | 8
7 | . p p . p p p p | 7     Black's d-pawn has just jumped past
6 | p . . * * . . . | 6     White's pawn on e5.
5 | . . . p P . . . | 5
4 | . . . . . . . . | 4     d6 = en passant capture (e5xd6 e.p.)
3 | . . . . . . . . | 3     e6 = ordinary push
2 | P P P P . P P P | 2
1 | R N B Q K B N R | 1
  +-----------------+
    a b c d e f g h
```

- The capturing pawn moves **diagonally onto the empty square** the enemy
  pawn skipped (d6). The pawn that is taken is **beside** it (d5), not on
  the target square. That makes en passant the only capture where the
  captured piece is not on the square moved to.
- The move gets `special: "en_passant"`, and `captured` is set to the
  enemy pawn's letter (`"p"`) by the caller, because the target square
  itself is empty.
- `moves.apply_move` removes the pawn beside it (same row as the moving
  pawn started on, same column as the target).
- If the player makes any other move first, the chance is gone:
  `game.update_en_passant` resets the square to `None` after every move
  that is not a double push.
- History text: `e5xd6 e.p.`. Typed: `e5 d6`.

**Code:** `moves.get_pawn_moves` (step 4), `moves.apply_move` (step 2),
`game.update_en_passant`. **Requirement:** FR-19. **Tests:**
`test_en_passant_move`, `test_en_passant_capture`,
`test_en_passant_expires`.

### Promotion

**Rule:** a pawn that reaches the far rank (rank 8 for White, rank 1 for
Black) is immediately replaced by a **queen, rook, bishop or knight** of
the same colour, chosen by the player. It can never become a king, or stay
a pawn. This can happen with a straight move or with a capture.

- `moves.get_pawn_moves` marks any pawn move that reaches `PROMOTION_ROW`
  with `special: "promotion"`.
- **In the window:** if no piece was chosen yet, `interface.try_move`
  returns `promotion: (start, end)` and the window shows the picker.
  Choosing a piece calls `try_move` again with that letter (EH-07: only
  those four are offered).
- **Typed:** `a7 a8 n` chooses a knight straight away. A letter other than
  q, r, b or n makes `parse_move` reject the input (`e7 e8 k` is
  invalid).
- `moves.apply_move` replaces the pawn with the chosen piece, upper case
  for White and lower case for Black. If no choice is given (e.g. when
  tests or saved games replay a move) the default is a queen.
- History text: `e7-e8=Q`, or `b7xa8=N` for a capture. Typed form for
  saving: `e7 e8 q`.

**Code:** `moves.get_pawn_moves` (step 5), `moves.apply_move` (step 3),
`interface.try_move`, `gui.draw_promotion`, `gui.choose_promotion`.
**Requirement:** FR-20. **Tests:** `test_promotion_flag`,
`test_promote_to_knight`, `test_default_promotion_is_queen`,
`test_promotion_asks_for_piece`.

### Castling

**Rule:** once per game, a player may move the king **two squares**
towards one of its rooks, and that rook jumps to the square the king
passed over. It is the only move where two pieces move at once.

```
Before:        1 | R . . . K . . R | 1

King side      1 | R . . . . R K . | 1     e1-g1, rook h1-f1   "O-O"
(O-O):

Queen side     1 | . . K R . . . R | 1     e1-c1, rook a1-d1   "O-O-O"
(O-O-O):
```

Black castles the same way on rank 8 (e8–g8 with h8–f8, or e8–c8 with
a8–d8).

**Castling is allowed only if all of these are true** (FR-18):

| Condition | King side | Queen side |
|-----------|-----------|------------|
| The king has never moved | ✓ | ✓ |
| That rook has never moved (and was not captured) | ✓ | ✓ |
| The rook is on its home corner | h-file | a-file |
| Every square between them is empty | f, g | b, c, d |
| The king is **not in check** right now | ✓ | ✓ |
| The king does not pass through an attacked square | f | d |
| The king does not land on an attacked square | g | c |

On the queen side, b1 (or b8) must be empty, but it may be attacked,
because the king never crosses it.

**How the program tracks "has never moved":** the game state keeps four
rights, `state["castling"] = {"K", "Q", "k", "q"}` (White king side, White
queen side, Black king side, Black queen side), all `True` at the start.
`game.update_castling_rights` clears them for good:

- any king move clears both of that side's rights (`CASTLING_KEYS`);
- any move **from** a rook's corner clears that corner's right
  (`ROOK_CORNERS`), even if the rook later moves back;
- any move **to** a rook's corner also clears it, because that rook has
  just been captured.

**How it is made:**

- In the window, click the king and then g1 (or c1). Typed: `e1 g1` or
  `e1 c1`.
- `rules.get_castling_moves` checks the conditions with
  `rules.can_castle_side` and offers the king's two-square move with
  `special: "castle"`.
- `moves.apply_move` moves the rook too (h→f or a→d).
- History text: `O-O` (king side) or `O-O-O` (queen side).

**Code:** `rules.can_castle_side`, `rules.get_castling_moves`,
`rules.get_candidate_moves`, `moves.apply_move` (step 4),
`game.update_castling_rights`. **Requirement:** FR-18. **Tests:**
`test_both_sides_allowed`, `test_castling_moves_rook`,
`test_no_castling_without_rights`,
`test_no_castling_through_attacked_square`,
`test_no_castling_out_of_check`, `test_no_castling_when_blocked`,
`test_rights_lost_after_rook_moves`.

---

## 7. Legal moves: never leave your king in check

**The rule that matters most:** a move is only legal if, after it is
played, **your own king is not attacked**. This one rule covers several
situations that are often listed separately:

| Situation | What it means |
|-----------|---------------|
| **Moving into check** | The king may not step onto an attacked square. |
| **Pins** | A piece shielding its king from an attacker may not move off that line. |
| **Escaping check** | When in check, the only legal moves are ones that end the check. |
| **Discovered attacks on yourself** | Moving a piece may not open a line to your own king. |

**How the program checks it** (`rules.get_legal_moves`, FR-21): for each
candidate move, play it on a **copy** of the board with `moves.apply_move`,
then ask `rules.is_in_check(copy, your_colour)`. If the answer is yes, the
move is dropped. Because the real board is never touched, any move can be
tried safely.

**A pinned piece:** the white knight on e2 shields its king from the black
rook. Every knight move would expose the king, so the knight has **no**
legal moves (`test_pinned_piece_cannot_move`).

```
8 | . . . . r . . k | 8
7 | . . . . . . . . | 7
...
2 | . . . . N . . . | 2      knight on e2 is pinned to the king on e1
1 | . . . . K . . . | 1
```

**Moving into check:** with a black rook on d2, the king on e1 may take
the rook (d2) or step to f1. e2 and f2 are attacked along rank 2 and d1
along the d-file (`test_king_cannot_move_into_check`).

**Escaping check:** there are three ways out of check, and the "try it on
a copy" method finds all of them automatically:

1. move the king to a safe square;
2. capture the checking piece;
3. block the line between the checking piece and the king (not possible
   against a knight or pawn check).

Any other move is rejected with *"That move would leave your king in
check."* (`test_must_escape_check`).

**How attacks are found:** `rules.is_square_attacked` loops over every
square (nested iteration, TR-04), and for each enemy piece asks
`moves.get_attacked_squares` whether it attacks the square.
`rules.is_in_check` uses `board.find_king` and then
`is_square_attacked`.

---

## 8. Check, checkmate and stalemate

After every move, `rules.get_game_status` describes the player whose turn
it now is:

| | Has a legal move | Has no legal move |
|---|---|---|
| **In check** | `"check"`: *"White is in check!"* | `"checkmate"`: *"Checkmate! Black wins."* |
| **Not in check** | `"ongoing"`: *"White to move."* | `"stalemate"`: *"Stalemate! The game is a draw."* |

- **Check** (FR-22): the king is attacked. The player must get out of it
  (section 7). The window colours the king's square red, and the history
  text gets a `+`.
- **Checkmate** (FR-23): in check with no legal move. The game is over and
  the other player wins. The history text gets a `#`. The quickest
  possible example, Fool's Mate, is a test (`test_fools_mate`):
  `1. f2-f3 e7-e5  2. g2-g4 d8-h4#`.
- **Stalemate** (FR-24): not in check, but no legal move. The game is a
  **draw**. Example (`test_stalemate`): Black king a8, White queen b6,
  White king h1, Black to move. The king is not attacked, but a7, b7 and
  b8 all are.
- After checkmate or stalemate, moves are refused with *"The game is over.
  Press New or Undo."*

Other draw rules (threefold repetition, the 50-move rule, insufficient
material) are out of scope for this project (`REQUIREMENTS.md`,
section 1).

**Code:** `rules.has_legal_moves`, `rules.is_checkmate`,
`rules.is_stalemate`, `rules.get_game_status`, `interface.status_lines`.

---

## 9. Rejected moves and their messages

The program never crashes on a bad move (NFR-07). `game.validate_move`
runs these checks **in order** and stops at the first one that fails, so
the player always gets the most useful message:

| # | Check | Message if it fails | Req. |
|---|-------|---------------------|------|
| – | Is the text a valid move? (`parse_move`, typed moves only) | *"Invalid input. Type a move like e2 e4, or 'help'."* | EH-01 |
| 1 | Is there a piece on the start square? | *"There is no piece on e4."* | EH-02 |
| 2 | Is it your own piece? | *"That is not your piece."* | EH-03 |
| 3 | Is the target free of your own pieces? | *"You cannot capture your own piece."* | EH-04 |
| 4 | Is it a legal move? | (the move is played) | – |
| 5 | Is it at least the right shape (a candidate)? | *"That move would leave your king in check."* | EH-06 |
| 6 | Otherwise | *"A knight cannot move from g1 to g3."* | EH-05 |

Check 5 versus check 6 is how the program tells a pin or check apart from
a move the piece simply cannot make: `rules.get_candidate_moves` (right
shape) is compared with `rules.get_legal_moves` (also safe for the king).

The exact wording may still change when `validate_move` is written; the
tests only check key words such as "no piece", "not your piece",
"own piece" and "check".

---

## 10. Summary table

| Move | Example | `special` | History text | Typed | Main functions | Req. |
|------|---------|-----------|--------------|-------|----------------|------|
| Pawn push | e2→e3 | `None` | `e2-e3` | `e2 e3` | `get_pawn_moves` | FR-10 |
| Double push | e2→e4 | `"double_push"` | `e2-e4` | `e2 e4` | `get_pawn_moves`, `update_en_passant` | FR-10 |
| Pawn capture | e4×d5 | `None` | `e4xd5` | `e4 d5` | `get_pawn_moves` | FR-10 |
| En passant | e5×d6 | `"en_passant"` | `e5xd6 e.p.` | `e5 d6` | `get_pawn_moves`, `apply_move` | FR-19 |
| Promotion | e7→e8 | `"promotion"` | `e7-e8=Q` | `e7 e8 q` | `get_pawn_moves`, `apply_move`, `try_move` | FR-20 |
| Knight | g1→f3 | `None` | `g1-f3` | `g1 f3` | `step_moves` | FR-11 |
| Bishop | f1→c4 | `None` | `f1-c4` | `f1 c4` | `ray_moves` | FR-12 |
| Rook | a1→a4 | `None` | `a1-a4` | `a1 a4` | `ray_moves` | FR-13 |
| Queen | d1→h5 | `None` | `d1-h5` | `d1 h5` | `ray_moves` | FR-14 |
| King | e1→e2 | `None` | `e1-e2` | `e1 e2` | `step_moves` | FR-15 |
| Castle king side | e1→g1 | `"castle"` | `O-O` | `e1 g1` | `get_castling_moves`, `apply_move` | FR-18 |
| Castle queen side | e1→c1 | `"castle"` | `O-O-O` | `e1 c1` | `get_castling_moves`, `apply_move` | FR-18 |
| Any move giving check | | | adds `+` | | `make_move`, `get_game_status` | FR-22 |
| Checkmating move | d8→h4 | | adds `#` | | `make_move`, `get_game_status` | FR-23 |

Every move, of any kind, then goes through the same steps in
`game.make_move`: save a snapshot for undo, apply it, record any capture,
update castling rights and the en passant square, switch the turn, and
add it to the history (FR-25, FR-27, FR-28).
