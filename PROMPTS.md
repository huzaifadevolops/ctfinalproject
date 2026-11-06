# Prompt Log

Every prompt given to Claude for this project, recorded word for word in
the order given.

---

## Prompt 1 — 2026-11-06

> create a project requirement file from the md file

**Outcome:** Created `REQUIREMENTS.md` from the project proposal, with
numbered functional, error-handling, technical, non-functional and testing
requirements, plus interim and final milestone checklists.

---

## Prompt 2 — 2026-11-06

> start builing the overall structure and the different modules of the
> program explain what every module does in a seperate md file and also
> record all the prompts in a .md file from now and also the previous 2 add
> this to project instructions

**Outcome:** Created the `chessgame` package (constants, board, notation,
moves, rules, game, storage, interface) with `main.py` as the entry point
and unit tests in `tests/`. Documented every module in `MODULES.md`. Started
this prompt log and added the logging rule to `CLAUDE.md`. (The engine was
first fully implemented, then reduced to outlines by Prompt 3.)

---

## Prompt 3 — 2026-11-06

> dont build the actual functions yet just the outline and the UI

**Outcome:** Replaced the engine function bodies in `board.py` (helpers),
`notation.py`, `moves.py`, `rules.py`, `game.py` and `storage.py` with
outlines: signature, docstring with a step-by-step plan, and
`raise NotImplementedError`. Kept the UI (`interface.py`, `main.py`, board
display, `create_board`, `new_game`) working; commands needing unbuilt
functions print "not built yet" instead of crashing. Tests now skip until
their functions exist. Wrote `MODULES.md`.

---

## Prompt 4 — 2026-11-06

> create a motion graphic video explainign ehat each part and file of the
> outline does. make it as long as you want it to be

**Outcome:** Made a ~4-minute 1080p motion-graphic video,
`video/outline_explainer.mp4`, with one chapter per part of the outline:
overview, layers, shared data formats, then each file (main, constants,
board, notation, moves, rules, game, storage, interface), the tests and
the build order. The animation source is `video/explainer.html` (opens in a
browser as a live preview) and `video/render.py` renders it to MP4 with a
generated ambient soundtrack.

---

## Prompt 5 — 2026-11-06

> I want a much longer video maybe like 30 minutes or something explaining
> everythiing in this project outline

**Outcome:** Rebuilt the video as a ~36-minute, 1080p explainer in 10 parts
(documents, architecture, data formats, then every function of every module,
the tests, and the requirements map and build order), replacing the short
version. `video/explainer.html` loads `video/js/engine.js` and one script per
part; `video/render.py` renders it in resumable 5-minute segments and adds
chapter markers (listed in `video/chapters.txt`).

---

## Prompt 6 — 2026-11-06

> push this to github

**Outcome:** Created the public GitHub repository `ctfinalproject` and pushed
the project. The 150 MB video is left out (GitHub's file limit is 100 MB) and
listed in `.gitignore`; it can be re-rendered with `video/render.py`.

---

## Prompt 7 — 2026-11-06

> also create a md file explaining every move

**Outcome:** Created `MOVES.md` (done together with Prompt 8): every piece's
movement, captures, the special moves, the legality rules, how each move is
entered and written in the history, and the functions, requirements and
tests behind each one.

---

## Prompt 8 — 2026-11-06

> also instead of printing to the terminal use pygame

**Outcome:** Replaced the terminal UI with a pygame window. `interface.py`
is now the command logic only (it returns messages instead of printing) and
the new `gui.py` draws the board and handles clicks and typing. Removed the
terminal-only `print_board` and `terminal_supports_unicode`. Updated
`REQUIREMENTS.md`, `CLAUDE.md` and `MODULES.md` for the new pygame
dependency, and added `requirements.txt` and `tests/test_interface.py`.

---

## Prompt 9 — 2026-11-06

> push it to github

**Outcome:** Committed the pygame interface, `MOVES.md` and the updated
documents, and pushed them to `main` on GitHub.
