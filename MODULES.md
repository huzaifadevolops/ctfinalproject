# Program Modules

This file explains what every module in the project does. Update it
whenever a module is added, removed or changes its job (see `CLAUDE.md`).

**Current status:** the pygame window (`gui.py`) and its command logic
(`interface.py`) are built. The rules engine is an **outline**: every
function has its name, inputs, outputs and a step-by-step plan in its
docstring, but its body is just `raise NotImplementedError`. The game still
runs; any action that needs an unbuilt function shows *"Not built yet
(needs ...)"* in the window's message box.

---

## Folder Layout

```
ctfinalproject/
├── main.py                 Entry point: python main.py
├── requirements.txt        pygame-ce (the only non-standard library)
├── chessgame/              The game package
│   ├── __init__.py         Package description
│   ├── constants.py        Shared constants and lookup dictionaries
│   ├── board.py            Board creation, helpers and text form
│   ├── notation.py         Text <-> coordinates ("e2 e4" -> (6,4),(4,4))
│   ├── moves.py            Move patterns for each piece (recursion here)
│   ├── rules.py            Check, legal moves, castling, game end
│   ├── game.py             Game state, validating/making moves, undo
│   ├── storage.py          Save and load games to text files
│   ├── interface.py        What each click/command means (no drawing)
│   └── gui.py              The pygame window: drawing, mouse, keyboard
├── tests/                  Unit tests (one file per area)
├── video/                  ~36-minute motion-graphic explainer of this outline
│   ├── explainer.html      The animation (open in a browser to preview)
│   ├── js/                 engine.js + one script per part of the video
│   ├── render.py           Renders it to MP4 in segments (Edge + ffmpeg)
│   ├── chapters.txt        Chapter timestamps
│   └── outline_explainer.mp4
├── CLAUDE.md               Project instructions + original proposal
├── REQUIREMENTS.md         Numbered requirements (FR-, EH-, TR-, ...)
├── MOVES.md                Every chess move and how the code handles it
├── MODULES.md              This file
└── PROMPTS.md              Log of every prompt given to Claude
```

## How the Modules Depend on Each Other

Each module only imports from modules above it in this list, so there
are no circular imports:

```
constants      (no imports)
   ↓
board          uses constants
   ↓
notation       uses constants
moves          uses board, constants
   ↓
rules          uses moves, board, constants
   ↓
game           uses rules, moves, notation, board, constants
   ↓
storage        uses game, notation
   ↓
interface      uses game, rules, notation, storage (returns messages)
   ↓
gui            uses interface, board, game (the only module that draws or
               reads the mouse/keyboard, and the only one using pygame)
   ↓
main.py        calls gui.run()
```

---

## Shared Data Formats

**Board**: an 8x8 list of lists of single-character strings.
Upper case is White (`K Q R B N P`), lower case is Black (`k q r b n p`),
`.` is an empty square. Coordinates are `(row, col)`: row 0 is rank 8 and
col 0 is file a. So `a8 = (0, 0)`, `e2 = (6, 4)`, `h1 = (7, 7)`.

**Move**: a dictionary.
```python
{"from": (6, 4), "to": (4, 4), "piece": "P", "captured": ".",
 "special": "double_push"}   # or None, "en_passant", "promotion", "castle"
```

**Game state**: a dictionary.
```python
{"board": [...], "turn": "w",
 "castling": {"K": True, "Q": True, "k": True, "q": True},
 "en_passant": None,          # or the (row, col) a pawn can capture onto
 "history": [...],            # entries: {"text", "input", "snapshot"}
 "captured": []}              # captured piece letters
```

---

## Module by Module

### `main.py`: Entry Point  ✅ built
Starts the program by calling `gui.run()`, which opens the window. Kept tiny so
the game can also be started from tests or other scripts.

### `constants.py`: Shared Constants  ✅ built
Holds every fixed value so it is defined once. These are the
**dictionaries** required by the proposal:
- `DIRECTIONS`: movement directions for each piece type.
- `SYMBOLS`: piece letter → Unicode display symbol.
- `PIECE_NAMES`, `COLOUR_NAMES`: letters/colours → readable names.
- Pawn tables: `PAWN_DIRECTION`, `PAWN_START_ROW`, `PROMOTION_ROW`.
- Castling tables: `ROOK_CORNERS`, `CASTLING_KEYS`, `HOME_ROW`.

### `board.py`: The Board  🟡 setup built, helpers outlined
Creates and inspects the board (**lists**, **nested iteration**,
**strings**). The board is drawn on screen by `gui.py`; `board_to_text`
gives a text form used by tests and for debugging.

| Function | Status | Job |
|----------|--------|-----|
| `create_board()` | ✅ | Starting position as an 8x8 list of lists |
| `symbol_for(piece)` | ✅ | Unicode symbol for a piece letter |
| `board_to_text(board, highlights)` | ✅ | Board as a labelled string; `*`/`x` mark legal moves |
| `board_from_strings(rows)` | ⬜ | Build a board from 8 strings (for tests) |
| `copy_board(board)` | ⬜ | Independent copy of the board |
| `on_board(row, col)` | ⬜ | Is the square inside the board? |
| `piece_colour(piece)` | ⬜ | `"w"`, `"b"` or `None` |
| `piece_type(piece)` | ⬜ | Upper-case letter, e.g. `n` → `N` |
| `find_king(board, colour)` | ⬜ | Locate a king with nested loops |

### `notation.py`: Text and Coordinates  ⬜ outline
Converts between what players type and board coordinates (**strings**).

| Function | Job |
|----------|-----|
| `parse_square("e4")` | → `(4, 4)` or `None` |
| `square_name((4, 4))` | → `"e4"` |
| `split_move_text(text)` | `"e2e4"`/`"e2 e4"`/`"e7 e8 q"` → list of parts |
| `parse_move(text)` | → `(start, end, promotion)` or `None` if malformed |
| `move_to_text(move)` | History text: `e2-e4`, `e4xd5`, `O-O`, `e7-e8=Q` |
| `move_to_input(move)` | Typed form for save files: `e2 e4`, `e7 e8 q` |

### `moves.py`: Piece Movement  ⬜ outline
Generates **pseudo-legal** moves: moves that follow each piece's pattern,
before checking whether they leave the king in check. Contains the
**recursive** function required by the proposal.

| Function | Job |
|----------|-----|
| `create_move(...)` | Builds a move dictionary |
| `ray_moves(board, row, col, d_row, d_col, colour)` | **Recursive**: steps one square at a time along a direction until the edge or a piece |
| `step_moves(...)` | One-step moves for knight and king |
| `pawn_attack_squares(...)` | The two diagonals a pawn attacks |
| `get_attacked_squares(...)` | Squares a piece attacks (used for check) |
| `get_pawn_moves(...)` | Pushes, double push, captures, en passant, promotion |
| `get_piece_moves(...)` | Pseudo-legal moves for any piece |
| `apply_move(board, move)` | Returns a **new** board with the move played (handles en passant, promotion and castling's rook move) |

### `rules.py`: The Rules Engine  ⬜ outline
The core of the project. Decides which moves are actually legal and when
the game is over (**nested iteration** over the board).

| Function | Job |
|----------|-----|
| `opponent(colour)` | `"w"` ↔ `"b"` |
| `is_square_attacked(board, square, by)` | Does any enemy piece attack this square? |
| `is_in_check(board, colour)` | Is this side's king attacked? |
| `can_castle_side(...)` / `get_castling_moves(...)` | All castling conditions |
| `get_candidate_moves(state, row, col)` | Piece moves + castling |
| `get_legal_moves(state, row, col)` | Candidates that don't leave own king in check |
| `get_all_legal_moves(state, colour)` | Every legal move for a side |
| `has_legal_moves`, `is_checkmate`, `is_stalemate` | Game-end tests |
| `get_game_status(state)` | `"checkmate"`, `"stalemate"`, `"check"` or `"ongoing"` |

### `game.py`: Game State and Turns  🟡 `new_game` built, rest outlined
Owns the game-state **dictionary** and everything that changes it.

| Function | Status | Job |
|----------|--------|-----|
| `new_game()` | ✅ | Fresh state dictionary |
| `validate_move(state, start, end)` | ⬜ | Returns the move, or a specific error message (empty square, wrong colour, own piece, illegal pattern, leaves king in check) |
| `update_castling_rights(state, move)` | ⬜ | Clears rights when king/rook moves or a rook is captured |
| `update_en_passant(state, move)` | ⬜ | Sets the en passant square after a double push |
| `make_move(state, move, promotion)` | ⬜ | Plays the move, records history and captures, switches turn |
| `undo_move(state)` | ⬜ | Restores the previous position from a snapshot |
| `history_lines(state)` | ⬜ | Numbered history: `1. e2-e4 e7-e5` |

### `storage.py`: Save and Load  ⬜ outline
Saves a game as a text file of typed moves (one per line) and loads it by
replaying them, so every move is re-validated.

| Function | Job |
|----------|-----|
| `save_game(state, filename)` | Write moves; return `None` or an error message |
| `load_game(filename)` | Replay moves; return `(state, None)` or `(None, error)` |

### `interface.py`: Command Logic  ✅ built
Decides what each click or typed command means. It never draws or prints:
every function returns a **result dictionary** (`state`, `messages`,
`quit`, `promotion`, `highlights`, `played`), so it can be tested without a
window.

| Function | Job |
|----------|-----|
| `handle_command(state, text)` | Runs `help`, `moves`, `history`, `undo`, `new`, `save`, `load`, `quit`, or treats the text as a move |
| `try_move(state, start, end, promotion)` | Validate → (ask for a promotion piece) → make the move |
| `typed_move(state, text)` | Parse typed text like `e2 e4`, then `try_move` |
| `moves_command(state, square)` | The `moves e2` command: message + squares to highlight |
| `legal_targets(state, square)` | Where a clicked piece may go |
| `status_lines(state)` | "White to move.", check, checkmate (names the winner), stalemate |
| `captured_by(state, colour)` | Pieces each side has taken |
| `safe_game_status`, `not_built_message` | Let the UI run while engine functions are still outlines |

### `gui.py`: The pygame Window  ✅ built
The **only** module that imports pygame, draws, or reads the mouse and
keyboard. It turns events into calls to `interface.py` and draws the
result.

| Function | Job |
|----------|-----|
| `run()` | Opens the window; main loop: events → draw → repeat |
| `handle_event`, `handle_click`, `handle_key` | Mouse clicks, buttons, typing in the command box |
| `click_board(ui, square)` | First click selects a piece (legal targets marked), second click moves it |
| `choose_promotion(ui, letter)` | Finishes a promotion from the Q/R/B/N picker |
| `draw_board`, `draw_piece` | Squares, labels, selection, legal-move dots, check highlight, pieces |
| `draw_panel` | Turn, status, captured pieces, buttons, move list, messages, command box |
| `draw_promotion` | The promotion picker over the board |
| `safely`, `quietly` | Show "Not built yet" for unbuilt engine code instead of crashing |

**How players use the window:**
```
click a piece, then its target   move (a picker appears for promotion)
New / Undo / Save / Load / Help  buttons on the right
type in the box + Enter:
  e2 e4        move (also e2e4; promotion: e7 e8 q)
  moves e2     highlight the legal moves for a square
  history      list moves played
  undo         take back the last move
  save [file]  save game (default savegame.txt)
  load [file]  load game
  new / help / quit
Esc            cancel a selection or the promotion picker
```

---

## Tests (`tests/`)

| File | Covers |
|------|--------|
| `helpers.py` | `state_from_rows` (build a position from strings), `play` (play a list of moves), `ChessTestCase` |
| `test_board_notation.py` | Board setup/display, square and move parsing |
| `test_moves.py` | Recursive rays, every piece's movement, en passant, promotion flag |
| `test_rules.py` | Check, pins, checkmate (Fool's Mate), stalemate, castling, en passant, promotion |
| `test_game_storage.py` | Error messages, turn order, undo, history, save/load |
| `test_interface.py` | Commands, status lines, captures, playing and promoting via the command logic (no window needed) |

The tests are already written as the **specification**. Tests for outline
functions are reported as *skipped (not built yet)* and start running
automatically once the function is implemented.

```
python -m unittest discover -s tests
```

## Suggested Build Order

1. `board.py` helpers → 2. `notation.py` → 3. `moves.py` (interim demo
   target: all piece movement) → 4. `rules.py` → 5. `game.py` →
   6. `storage.py`.

After each step, run the tests: skipped tests for that module should turn
into passes.
