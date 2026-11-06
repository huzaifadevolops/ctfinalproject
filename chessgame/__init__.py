"""Two-player terminal chess game.

Modules:
    constants  - shared constants and lookup dictionaries
    board      - creating, copying and displaying the board
    notation   - converting between text like "e2 e4" and coordinates
    moves      - move generation for each piece (no check filtering)
    rules      - attack detection, check, legal moves, game-end detection
    game       - game state, making moves, undo and move validation
    storage    - saving and loading games to text files
    interface  - the interactive command loop shown to the players
"""
