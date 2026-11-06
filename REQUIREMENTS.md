# Project Requirements: Two-Player Terminal Chess

**Language:** Python 3, standard library plus pygame-ce for the window
**Platform:** Desktop window (pygame). The original proposal used the
terminal; the interface was changed to pygame on 2026-11-06 (Prompt 8 in
`PROMPTS.md`).
**Source:** Derived from the project proposal (in `CLAUDE.md`)

---

## 1. Purpose and Scope

A two-player chess game that runs in a pygame window. Two people share one
computer and take turns making moves, either by clicking a piece and its
target square or by typing coordinate notation (e.g. `e2 e4`) into a command
box. The program redraws the board after every move, rejects illegal moves, and
announces check, checkmate and stalemate.

The core of the project is the **rules engine**: working out which moves are
legal in a given position, including excluding moves that would leave the
moving player's own king in check.

**Out of scope:** AI/computer opponent, network play, clocks or timers, draw by repetition / 50-move rule (unless added later).

---

## 2. Requirement Priorities

| Priority | Meaning |
|----------|---------|
| **Must** | Required for the final demo |
| **Should** | Planned for the final demo |
| **Could** | Implemented only if time allows |

---

## 3. Functional Requirements

### 3.1 Board Setup and Display

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-01 | The program shall create the standard chess starting position. | Must | Interim |
| FR-02 | The board shall be drawn in the window with rank (1–8) and file (a–h) labels. | Must | Interim |
| FR-03 | The board shall be redrawn after every successful move. | Must | Interim |
| FR-04 | Pieces shall be drawn using chess symbols mapped from piece letters. | Must | Interim |
| FR-05 | The program shall show whose turn it is before each move. | Must | Interim |

### 3.2 Input and Turn Handling

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-06 | The program shall accept moves typed in the form `<from> <to>` (e.g. `e2 e4`) and moves made by clicking the from and to squares. | Must | Interim |
| FR-07 | Input squares shall be converted from algebraic notation to board coordinates. | Must | Interim |
| FR-08 | Players shall alternate turns, starting with White. | Must | Interim |
| FR-09 | A player shall only be allowed to move their own pieces. | Must | Interim |

### 3.3 Piece Movement

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-10 | Pawns shall move one square forward, two squares from their starting rank, and capture diagonally. | Must | Interim |
| FR-11 | Knights shall move in an L-shape and may jump over pieces. | Must | Interim |
| FR-12 | Bishops shall move any distance diagonally. | Must | Interim |
| FR-13 | Rooks shall move any distance horizontally or vertically. | Must | Interim |
| FR-14 | Queens shall move any distance diagonally, horizontally or vertically. | Must | Interim |
| FR-15 | Kings shall move one square in any direction. | Must | Interim |
| FR-16 | Sliding pieces (rook, bishop, queen) shall stop at the board edge or at the first piece in their path, capturing it only if it belongs to the opponent. | Must | Interim |
| FR-17 | No piece shall move off the board or capture a piece of its own colour. | Must | Interim |

### 3.4 Special Moves

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-18 | **Castling** (king-side and queen-side) shall be allowed only when the king and chosen rook have not moved, the squares between them are empty, and the king is not in check, does not pass through an attacked square, and does not land on one. | Must | Final |
| FR-19 | **En passant** shall be allowed only on the move immediately after an opposing pawn advances two squares past the capturing pawn. | Must | Final |
| FR-20 | **Pawn promotion** shall occur when a pawn reaches the last rank; the player shall choose a queen, rook, bishop or knight. | Must | Final |

### 3.5 Legal-Move Validation and Game State

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-21 | A move shall be rejected if it would leave the moving player's own king in check. | Must | Final |
| FR-22 | The program shall detect and announce when a player is in **check**. | Must | Final |
| FR-23 | The program shall detect and announce **checkmate** and end the game, naming the winner. | Must | Final |
| FR-24 | The program shall detect and announce **stalemate** and end the game as a draw. | Must | Final |
| FR-25 | Game state shall track the side to move, castling rights and the en passant target square. | Must | Final |

### 3.6 Commands and Extra Features

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-26 | A command shall display all legal moves for a chosen square. | Should | Final |
| FR-27 | The program shall keep a move history list and allow it to be displayed. | Should | Final |
| FR-28 | An **undo** command shall restore the position before the last move, including castling rights, en passant square and captured pieces. | Should | Final |
| FR-29 | The program shall keep a list of captured pieces. | Should | Final |
| FR-30 | The game shall be savable to a text file. | Could | Final |
| FR-31 | A saved game shall be loadable from a text file. | Could | Final |
| FR-32 | A help command shall list the available commands. | Should | Final |
| FR-33 | Closing the window or typing quit shall exit the game cleanly. | Must | Interim |

---

## 4. Error Handling Requirements

The program must never crash on bad input. Each case below must be rejected
with a clear message, and the same player is prompted again.

| ID | Invalid input / situation | Expected behaviour |
|----|---------------------------|--------------------|
| EH-01 | Malformed input (e.g. `e9 e4`, `hello`, empty line) | "Invalid move format" message |
| EH-02 | Starting square is empty | "No piece on that square" message |
| EH-03 | Attempt to move the opponent's piece | "That is not your piece" message |
| EH-04 | Attempt to capture one's own piece | "Illegal move" message |
| EH-05 | Move not allowed for that piece type, or blocked by another piece | "Illegal move" message |
| EH-06 | Move that leaves or puts own king in check | "Your king would be in check" message |
| EH-07 | Invalid promotion choice | Only queen, rook, bishop and knight are offered; a typed letter must be q, r, b or n |
| EH-08 | Undo with no moves in history | "Nothing to undo" message |
| EH-09 | Missing or corrupt save file when loading | Error message; current game continues |

---

## 5. Technical Requirements (Required Python Features)

| ID | Feature | Required usage |
|----|---------|----------------|
| TR-01 | **Lists** | Board as an 8×8 list of lists; move history, legal moves and captured pieces stored in lists. |
| TR-02 | **Dictionaries** | Movement directions per piece type; piece letter → display symbol map; game-state dictionary (turn, castling rights, en passant square). |
| TR-03 | **Strings** | Parsing input such as `"e2 e4"` into coordinates; formatting the board display; storing moves in chess notation; save-file contents. |
| TR-04 | **Nested iteration** | Nested loops over rows and columns to locate pieces, generate all moves for a side, and check whether a king is attacked. |
| TR-05 | **Recursion** | `ray_moves` generates rook, bishop and queen moves recursively, one square at a time, until it hits the board edge or a piece. |

---

## 6. Program Structure

The code shall be split into short, reusable functions. Planned functions:

| Function | Responsibility |
|----------|----------------|
| `create_board()` | Return the starting 8×8 board. |
| `draw_board(...)` (gui.py) | Draw the board with labels in the window. |
| `parse_move(text)` | Convert input like `"e2 e4"` to coordinates, or report invalid input. |
| `get_piece_moves(board, row, col, state)` | Pseudo-legal moves for one piece. |
| `ray_moves(board, row, col, d_row, d_col, colour)` | **Recursive** sliding-piece move generation. |
| `is_in_check(board, colour)` | Whether the given side's king is attacked. |
| `get_legal_moves(board, row, col, state)` | Pseudo-legal moves filtered to exclude self-check. |
| `make_move(board, move, state)` | Apply a move, including special moves, and update state. |
| `is_checkmate(board, colour, state)` | In check with no legal moves. |
| `main()` / `gui.run()` | Game loop: draw, read clicks and typing, validate, switch turns. |

Additional helper functions (e.g. `is_stalemate`, `undo_move`, `save_game`,
`load_game`) may be added as development progresses.

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Uses only the Python standard library, plus pygame-ce for the window (`pip install -r requirements.txt`). |
| NFR-02 | Modular design using small, single-purpose functions. |
| NFR-03 | Meaningful variable and function names. |
| NFR-04 | Consistent indentation and formatting. |
| NFR-05 | Appropriate comments and docstrings. |
| NFR-06 | Lines kept within 80 characters wherever possible. |
| NFR-07 | Program never crashes on user input (see Section 4). |

---

## 8. Testing Requirements

Each major function shall be tested on its own before integration.

| ID | Test area |
|----|-----------|
| TS-01 | Valid and invalid moves for every piece type. |
| TS-02 | Moves through other pieces and off the board are rejected. |
| TS-03 | Moves that expose the player's own king to check are rejected (including pinned pieces). |
| TS-04 | Castling: allowed and disallowed cases (moved king/rook, blocked path, through/into/out of check). |
| TS-05 | En passant: valid immediately after a double pawn push, invalid one move later. |
| TS-06 | Pawn promotion to each allowed piece. |
| TS-07 | Check, checkmate (e.g. Fool's Mate) and stalemate detection. |
| TS-08 | Incorrect user inputs and unusual game situations (Section 4). |
| TS-09 | Undo restores the exact previous position and game state. |
| TS-10 | Save then load reproduces the same position (if implemented). |

---

## 9. Milestones

### Interim Demo (~50% complete)
- [ ] Board setup and display (FR-01 – FR-05)
- [ ] Input parsing and coordinate conversion (FR-06, FR-07)
- [ ] Basic movement for all six piece types (FR-10 – FR-15)
- [ ] Turn handling and player validation (FR-08, FR-09)
- [ ] Board boundary and obstruction checks (FR-16, FR-17)
- [ ] Demo existing functionality, explain the code, list remaining work

### Final Demo
- [ ] Full legal-move validation (FR-21)
- [ ] Check, checkmate and stalemate detection (FR-22 – FR-24)
- [ ] Castling, en passant and promotion (FR-18 – FR-20)
- [ ] Move history and undo (FR-27, FR-28)
- [ ] Show legal moves for a square (FR-26)
- [ ] Input error handling and edge-case testing (Section 4, Section 8)
- [ ] Save and load games, if time allows (FR-30, FR-31)

---

## 10. Team Responsibilities

All team members collaborate on testing, debugging, reviewing one another's
code and integrating individual components into the final program.
