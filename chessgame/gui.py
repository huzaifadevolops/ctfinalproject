"""The pygame window: draws the game and reads the mouse and keyboard.

Status: built. This is the only module that draws on the screen or reads
input. What each click or command *means* is decided by interface.py;
this module just shows the results.

Players can click a piece and then its target square, or type moves and
commands (e2 e4, moves e2, undo, save ...) in the box under the panel.
"""

import pygame

from . import interface
from .board import find_king
from .constants import (
    BOARD_SIZE, COLOUR_NAMES, EMPTY, FILES, PROMOTION_CHOICES, RANKS,
    WHITE,
)
from .game import history_lines, new_game

# ---------------------------------------------------------------------
# Layout and colours
# ---------------------------------------------------------------------

SQUARE = 80
BOARD_X = 44
BOARD_Y = 40
BOARD_PX = SQUARE * BOARD_SIZE
PANEL_X = BOARD_X + BOARD_PX + 36
PANEL_W = 340
WIDTH = PANEL_X + PANEL_W + 24
HEIGHT = BOARD_Y + BOARD_PX + 44
FPS = 30
MAX_TEXT = 32

COLOURS = {
    "background": (14, 17, 22),
    "panel": (22, 27, 34),
    "line": (42, 49, 60),
    "light": (236, 217, 184),
    "dark": (169, 126, 87),
    "text": (232, 236, 241),
    "muted": (139, 150, 165),
    "blue": (106, 169, 255),
    "green": (76, 195, 138),
    "amber": (240, 180, 76),
    "red": (255, 107, 107),
    "selected": (246, 214, 92),
    "target": (40, 40, 40),
    "check": (230, 80, 80),
    "white_piece": (252, 252, 252),
    "black_piece": (24, 24, 24),
}

# Filled glyphs are drawn in the piece's colour, then the outline glyph on
# top gives every piece a dark edge.
FILLED = {"K": "♚", "Q": "♛", "R": "♜", "B": "♝",
          "N": "♞", "P": "♟"}
OUTLINE = {"K": "♔", "Q": "♕", "R": "♖", "B": "♗",
           "N": "♘", "P": "♙"}
SYMBOL_FONTS = ["segoeuisymbol", "dejavusans", "notosanssymbols2",
                "freeserif", "arialunicodems"]
BUTTONS = ["New", "Undo", "Save", "Load", "Help"]


# ---------------------------------------------------------------------
# Fonts
# ---------------------------------------------------------------------

def supports_chess_glyphs(font):
    """True if the font has the chess symbols we draw."""
    metrics = font.metrics("♔♚♟")
    return all(metric is not None for metric in metrics)


def find_piece_font(size):
    """A font that can draw chess symbols, or None (letters are used)."""
    for name in SYMBOL_FONTS:
        path = pygame.font.match_font(name)
        if path:
            font = pygame.font.Font(path, size)
            if supports_chess_glyphs(font):
                return font
    return None


def load_fonts():
    """All the fonts the window uses, in one dictionary."""
    return {
        "title": pygame.font.SysFont("segoeui,arial", 26, bold=True),
        "text": pygame.font.SysFont("segoeui,arial", 19),
        "bold": pygame.font.SysFont("segoeui,arial", 19, bold=True),
        "small": pygame.font.SysFont("segoeui,arial", 16),
        "mono": pygame.font.SysFont("consolas,couriernew", 18),
        "label": pygame.font.SysFont("consolas,couriernew", 18, bold=True),
        "letter": pygame.font.SysFont("segoeui,arial", 34, bold=True),
        "piece": find_piece_font(int(SQUARE * 0.78)),
        "piece_small": find_piece_font(26),
    }


# ---------------------------------------------------------------------
# Window state
# ---------------------------------------------------------------------

def new_ui():
    """Everything the window needs to remember between frames."""
    return {
        "state": new_game(),
        "selected": None,      # (row, col) of the chosen piece
        "targets": [],         # squares to mark as legal moves
        "promotion": None,     # (start, end) waiting for a piece choice
        "messages": ["Welcome! Click a piece, or type a move like e2 e4."],
        "text": "",            # what is typed in the command box
        "running": True,
    }


def add_messages(ui, lines):
    """Add lines to the message log, keeping only the newest ones."""
    ui["messages"].extend(lines)
    del ui["messages"][:-40]


def safely(ui, function, *args):
    """Call an interface function; report unbuilt engine code politely."""
    try:
        return function(*args)
    except NotImplementedError as error:
        add_messages(ui, [interface.not_built_message(error)])
        return None


def quietly(function, *args):
    """Call a function for drawing; None if it is not built yet."""
    try:
        return function(*args)
    except NotImplementedError:
        return None


def clear_selection(ui):
    ui["selected"] = None
    ui["targets"] = []


def apply_result(ui, result):
    """Use a result dictionary from interface.py."""
    ui["state"] = result["state"]
    add_messages(ui, result["messages"])
    ui["promotion"] = result["promotion"]
    ui["targets"] = result["highlights"]
    if result["quit"]:
        ui["running"] = False


# ---------------------------------------------------------------------
# Mouse and keyboard
# ---------------------------------------------------------------------

def square_at(position):
    """The (row, col) under a mouse position, or None if off the board."""
    x, y = position
    col = (x - BOARD_X) // SQUARE
    row = (y - BOARD_Y) // SQUARE
    if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:
        return row, col
    return None


def same_side(piece, other):
    """True if two (non-empty) pieces belong to the same player."""
    return piece.isupper() == other.isupper()


def select(ui, square):
    """Choose a piece and mark where it can go."""
    ui["selected"] = square
    ui["targets"] = []
    found = safely(ui, interface.legal_targets, ui["state"], square)
    if found is not None:
        targets, message = found
        ui["targets"] = targets
        if message:
            add_messages(ui, [message])


def click_board(ui, square):
    """First click picks a piece; second click tries to move it."""
    board = ui["state"]["board"]
    piece = board[square[0]][square[1]]
    selected = ui["selected"]
    if selected is None:
        if piece != EMPTY:
            select(ui, square)
        return
    if square == selected:
        clear_selection(ui)
        return
    moving = board[selected[0]][selected[1]]
    if piece != EMPTY and same_side(piece, moving):
        select(ui, square)
        return
    clear_selection(ui)
    result = safely(ui, interface.try_move, ui["state"], selected, square)
    if result:
        apply_result(ui, result)


def run_command(ui, text):
    """Run a typed command or a button's command."""
    add_messages(ui, ["> " + text])
    clear_selection(ui)
    ui["promotion"] = None
    result = safely(ui, interface.handle_command, ui["state"], text)
    if result:
        apply_result(ui, result)


def choose_promotion(ui, letter):
    """Finish a promotion move with the chosen piece letter."""
    start, end = ui["promotion"]
    ui["promotion"] = None
    result = safely(ui, interface.try_move, ui["state"], start, end, letter)
    if result:
        apply_result(ui, result)


def handle_click(ui, position):
    if ui["promotion"]:
        for letter, rect in promotion_rects():
            if rect.collidepoint(position):
                choose_promotion(ui, letter)
                return
        return
    for name, rect in button_rects():
        if rect.collidepoint(position):
            run_command(ui, name.lower())
            return
    square = square_at(position)
    if square is not None:
        click_board(ui, square)


def handle_key(ui, event):
    if event.key == pygame.K_ESCAPE:
        ui["promotion"] = None
        clear_selection(ui)
        ui["text"] = ""
    elif event.key == pygame.K_BACKSPACE:
        ui["text"] = ui["text"][:-1]
    elif event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
        text = ui["text"].strip()
        ui["text"] = ""
        if text:
            run_command(ui, text)


def handle_event(ui, event):
    if event.type == pygame.QUIT:
        ui["running"] = False
    elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
        handle_click(ui, event.pos)
    elif event.type == pygame.KEYDOWN:
        handle_key(ui, event)
    elif event.type == pygame.TEXTINPUT and len(ui["text"]) < MAX_TEXT:
        ui["text"] += event.text


# ---------------------------------------------------------------------
# Drawing
# ---------------------------------------------------------------------

def square_rect(row, col):
    return pygame.Rect(BOARD_X + col * SQUARE, BOARD_Y + row * SQUARE,
                       SQUARE, SQUARE)


def button_rects():
    width = (PANEL_W - 4 * 8) // 5
    return [(name, pygame.Rect(PANEL_X + i * (width + 8), 250, width, 36))
            for i, name in enumerate(BUTTONS)]


def promotion_rects():
    size = SQUARE + 20
    left = BOARD_X + (BOARD_PX - 4 * size - 3 * 12) // 2
    top = BOARD_Y + (BOARD_PX - size) // 2
    return [(letter, pygame.Rect(left + i * (size + 12), top, size, size))
            for i, letter in enumerate(PROMOTION_CHOICES)]


def draw_text(screen, font, text, colour, position, centre=False):
    image = font.render(text, True, COLOURS[colour])
    rect = image.get_rect()
    if centre:
        rect.center = position
    else:
        rect.topleft = position
    screen.blit(image, rect)
    return rect


def wrap_text(font, text, width):
    """Split text into lines that fit in width pixels."""
    lines, current = [], ""
    for word in text.split(" "):
        trial = word if not current else current + " " + word
        if font.size(trial)[0] <= width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_piece(screen, fonts, piece, centre, size="piece"):
    """Draw one piece centred on a point."""
    kind = piece.upper()
    fill = COLOURS["white_piece" if piece.isupper() else "black_piece"]
    font = fonts[size]
    if font is None:
        radius = SQUARE // 3 if size == "piece" else 13
        pygame.draw.circle(screen, fill, centre, radius)
        pygame.draw.circle(screen, (90, 90, 90), centre, radius, 2)
        letter_colour = "black_piece" if piece.isupper() else "white_piece"
        letter_font = fonts["letter"] if size == "piece" else fonts["small"]
        draw_text(screen, letter_font, kind, letter_colour, centre, True)
        return
    body = font.render(FILLED[kind], True, fill)
    edge = font.render(OUTLINE[kind], True, (20, 20, 20))
    for image in (body, edge):
        screen.blit(image, image.get_rect(center=centre))


def draw_board(screen, fonts, ui):
    state = ui["state"]
    board = state["board"]
    king_square = None
    if interface.safe_game_status(state) in ("check", "checkmate"):
        king_square = quietly(find_king, board, state["turn"])
    for row in range(BOARD_SIZE):
        for col in range(BOARD_SIZE):
            rect = square_rect(row, col)
            colour = "light" if (row + col) % 2 == 0 else "dark"
            pygame.draw.rect(screen, COLOURS[colour], rect)
            if (row, col) == king_square:
                pygame.draw.rect(screen, COLOURS["check"], rect)
            if (row, col) == ui["selected"]:
                pygame.draw.rect(screen, COLOURS["selected"], rect)
    for row, col in ui["targets"]:
        centre = square_rect(row, col).center
        if board[row][col] == EMPTY:
            pygame.draw.circle(screen, COLOURS["target"], centre, 12)
        else:
            pygame.draw.circle(screen, COLOURS["target"], centre,
                               SQUARE // 2 - 3, 6)
    for row in range(BOARD_SIZE):
        for col in range(BOARD_SIZE):
            piece = board[row][col]
            if piece != EMPTY:
                draw_piece(screen, fonts, piece, square_rect(row, col).center)
    for i in range(BOARD_SIZE):
        draw_text(screen, fonts["label"], FILES[i], "muted",
                  (BOARD_X + i * SQUARE + SQUARE // 2,
                   BOARD_Y + BOARD_PX + 16), True)
        draw_text(screen, fonts["label"], RANKS[i], "muted",
                  (BOARD_X - 20, BOARD_Y + i * SQUARE + SQUARE // 2), True)


def draw_captured(screen, fonts, state, colour, y):
    draw_text(screen, fonts["small"], "Captured by " + COLOUR_NAMES[colour],
              "muted", (PANEL_X, y))
    pieces = interface.captured_by(state, colour)
    if not pieces:
        draw_text(screen, fonts["small"], "-", "muted", (PANEL_X + 150, y))
    for i, piece in enumerate(pieces[:12]):
        draw_piece(screen, fonts, piece, (PANEL_X + 160 + i * 15, y + 10),
                   "piece_small")


def draw_panel_box(screen, fonts, title, lines, top, height, colour="text"):
    """A titled box of text lines, showing the newest lines that fit."""
    draw_text(screen, fonts["bold"], title, "amber", (PANEL_X, top))
    box = pygame.Rect(PANEL_X, top + 26, PANEL_W, height)
    pygame.draw.rect(screen, COLOURS["panel"], box, border_radius=8)
    pygame.draw.rect(screen, COLOURS["line"], box, 1, border_radius=8)
    wrapped = []
    for line in lines:
        wrapped.extend(wrap_text(fonts["small"], line, PANEL_W - 20))
    visible = (height - 12) // 21
    for i, line in enumerate(wrapped[-visible:]):
        draw_text(screen, fonts["small"], line, colour,
                  (PANEL_X + 10, top + 33 + i * 21))


def draw_panel(screen, fonts, ui):
    state = ui["state"]
    draw_text(screen, fonts["title"], "Two-Player Chess", "text",
              (PANEL_X, BOARD_Y - 4))
    turn_colour = "white_piece" if state["turn"] == WHITE else "black_piece"
    pygame.draw.circle(screen, COLOURS[turn_colour], (PANEL_X + 10, 98), 9)
    pygame.draw.circle(screen, COLOURS["muted"], (PANEL_X + 10, 98), 9, 1)
    for i, line in enumerate(interface.status_lines(state)):
        colour = "red" if "!" in line else "text"
        draw_text(screen, fonts["bold" if i == 0 else "text"], line, colour,
                  (PANEL_X + 28 if i == 0 else PANEL_X, 86 + i * 26))
    draw_captured(screen, fonts, state, WHITE, 160)
    draw_captured(screen, fonts, state, "b", 194)
    for name, rect in button_rects():
        pygame.draw.rect(screen, COLOURS["panel"], rect, border_radius=8)
        pygame.draw.rect(screen, COLOURS["blue"], rect, 1, border_radius=8)
        draw_text(screen, fonts["small"], name, "blue", rect.center, True)
    history = quietly(history_lines, state)
    if history is None:
        history = ["(history is not built yet)"]
    draw_panel_box(screen, fonts, "Moves", history or ["No moves yet."],
                   302, 130)
    draw_panel_box(screen, fonts, "Messages", ui["messages"], 470, 150,
                   "muted")
    draw_command_box(screen, fonts, ui)


def draw_command_box(screen, fonts, ui):
    box = pygame.Rect(PANEL_X, HEIGHT - 76, PANEL_W, 40)
    pygame.draw.rect(screen, COLOURS["panel"], box, border_radius=8)
    pygame.draw.rect(screen, COLOURS["blue"], box, 1, border_radius=8)
    if ui["text"]:
        cursor = "_" if pygame.time.get_ticks() // 500 % 2 else " "
        draw_text(screen, fonts["mono"], ui["text"] + cursor, "text",
                  (box.x + 12, box.y + 9))
    else:
        draw_text(screen, fonts["small"], "Type a move or command...",
                  "muted", (box.x + 12, box.y + 10))


def draw_promotion(screen, fonts, ui):
    shade = pygame.Surface((BOARD_PX, BOARD_PX), pygame.SRCALPHA)
    shade.fill((0, 0, 0, 160))
    screen.blit(shade, (BOARD_X, BOARD_Y))
    draw_text(screen, fonts["title"], "Promote to:", "text",
              (BOARD_X + BOARD_PX // 2, BOARD_Y + BOARD_PX // 2 - 90), True)
    white = ui["state"]["turn"] == WHITE
    for letter, rect in promotion_rects():
        pygame.draw.rect(screen, COLOURS["light"], rect, border_radius=12)
        pygame.draw.rect(screen, COLOURS["amber"], rect, 3, border_radius=12)
        piece = letter if white else letter.lower()
        draw_piece(screen, fonts, piece, rect.center)


def draw(screen, fonts, ui):
    screen.fill(COLOURS["background"])
    draw_board(screen, fonts, ui)
    draw_panel(screen, fonts, ui)
    if ui["promotion"]:
        draw_promotion(screen, fonts, ui)


# ---------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------

def run():
    """Open the window and run the game until it is closed. FR-33"""
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Two-Player Chess")
    pygame.key.start_text_input()
    fonts = load_fonts()
    clock = pygame.time.Clock()
    ui = new_ui()
    while ui["running"]:
        for event in pygame.event.get():
            handle_event(ui, event)
        draw(screen, fonts, ui)
        pygame.display.flip()
        clock.tick(FPS)
    pygame.quit()
