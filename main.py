"""Entry point for the two-player chess game.

Run with:  python main.py
Needs pygame-ce:  pip install -r requirements.txt
"""

from chessgame.gui import run


def main():
    """Open the game window."""
    run()


if __name__ == "__main__":
    main()
