"""Two-player chess game in a pygame window.

Modules:
    constants  - shared constants and lookup dictionaries
    board      - creating, copying and inspecting the board
    notation   - converting between text like "e2 e4" and coordinates
    moves      - move generation for each piece (no check filtering)
    rules      - attack detection, check, legal moves, game-end detection
    game       - game state, making moves, undo and move validation
    storage    - saving and loading games to text files
    interface  - what each click or command means (returns messages)
    gui        - the pygame window: drawing, mouse and keyboard
"""
