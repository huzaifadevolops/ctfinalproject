# Project Instructions

## Working Rules (for Claude and all team members)

1. **Prompt log:** Record every prompt given to Claude in `PROMPTS.md`,
   word for word, as a new numbered entry with the date and a short note on
   what was done. Add the entry in the same session the prompt is given.
2. **Module documentation:** Whenever a module is added, removed or changes
   what it does, update `MODULES.md` to match.
3. **Requirements:** `REQUIREMENTS.md` is the requirements specification.
   Reference requirement IDs (e.g. FR-18) when implementing or testing.
4. **Code style:** Python 3 standard library, plus pygame-ce for the window
   (only `gui.py` imports pygame). Short, single-purpose functions,
   meaningful names, docstrings, lines within 80 characters.
5. **Tests:** Add or update tests in `tests/` for every rule implemented.
   Run them with `python -m unittest discover -s tests`.

---

## Project Proposal: Two-Player Chess

> Note: the proposal below describes a terminal game. On 2026-11-06 the
> interface was changed to a pygame window (see `PROMPTS.md`, Prompt 8 and
> `REQUIREMENTS.md`). The rules engine and features are unchanged.

### Project Description
We will build a two-player chess game in Python that runs in the terminal.
Two people share one computer and take turns entering moves such as e2 e4.
The program draws the board after every move, rejects illegal moves, and
announces check, checkmate and stalemate. The main focus of the project is
the rules engine: determining which moves are legal in a given position,
including moves that would leave a player's own king in check.

### Planned Features
- Standard chess setup and all piece movements, including castling,
  en passant and pawn promotion.
- Legal-move validation, ensuring players cannot move into or remain in check.
- Detection of check, checkmate and stalemate.
- A command to display the legal moves available for a chosen square.
- A move history list and an undo command.
- Saving and loading a game from a text file (if time allows).

### How the Required Python Features Will Be Used
- **Lists:** The chessboard will be represented as an 8x8 list of lists. The
  move history, legal moves and captured pieces will also be stored in lists.
- **Dictionaries:** One dictionary will store movement directions for each
  piece type, another will map piece letters to display symbols, and a
  game-state dictionary will track whose turn it is, castling rights and the
  en passant square.
- **Strings:** User input, such as "e2 e4", will be parsed into board
  coordinates. Strings will also be used to format the board for display,
  store moves in chess notation and manage saved games.
- **Nested Iteration:** Nested loops will iterate through the rows and columns
  of the chessboard to locate pieces, generate possible moves for each side
  and check whether opposing pieces attack a king.
- **Recursion:** Rook, bishop and queen moves will be generated using a
  recursive function that moves one square at a time along a direction. The
  function will call itself until it reaches the board boundary or encounters
  another piece.

### Program Structure
The code will be divided into short, reusable functions to maintain
modularity and make the program easier to understand and debug.

Some planned functions include: create_board and print_board, parse_move,
get_piece_moves, ray_moves (recursive), is_in_check, get_legal_moves,
make_move, is_checkmate, main. Additional functions may be introduced as
development progresses.

The program will also handle incorrect inputs and invalid moves
appropriately. For example, malformed moves, empty starting squares, attempts
to move the opponent's pieces, capturing one's own pieces and moves that leave
the player's king in check will be rejected with an appropriate message
instead of causing the program to crash.

### Testing and Validation
The program will be tested using different board positions and game
situations to ensure that all piece movements and chess rules work correctly.
Testing will include:
- Valid and invalid moves for every piece.
- Attempts to move through other pieces or outside the board.
- Moves that expose the player's own king to check.
- Special moves such as castling, en passant and pawn promotion.
- Check, checkmate and stalemate detection.
- Incorrect user inputs and unusual game situations.

Each major function will be tested individually before being integrated into
the complete game.

### Plan and Division of Work

**Interim Demo (approximately 50% complete).** By the interim demo, we aim to
have implemented:
- Chessboard setup and display.
- User input parsing and coordinate conversion.
- Basic movement for all six piece types.
- Turn handling and player validation.
- Basic movement validation, including board boundaries and piece obstruction.

We will demonstrate the existing functionality, explain the code implemented
so far and identify the features remaining to be developed.

**Final Demo.** The final version will include:
- Complete legal-move validation.
- Check, checkmate and stalemate detection.
- Special moves: castling, en passant and pawn promotion.
- Move history and undo functionality.
- Input error handling and additional edge-case testing.
- Saving and loading games, if time allows.

All team members will collaborate on testing, debugging, reviewing one
another's code and integrating the individual components into the final
program.

### Code Quality
The program will follow good programming practices, including modular
functions, meaningful variable names, consistent indentation, appropriate
comments and clear formatting. Individual lines of code will be kept within
the 80-character limit wherever possible.

### Project Significance
This project explores how computational thinking can be used to translate a
complex set of real-world rules into a structured computer program. Chess
provides an opportunity to apply algorithms, recursion, nested iteration,
data structures and logical decision-making within one integrated
application. It also demonstrates how multiple smaller functions can work
together to create a complete and interactive program.
