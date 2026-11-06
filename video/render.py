"""Render explainer.html to an MP4 with a generated ambient soundtrack.

Usage:
    python render.py                  full render -> outline_explainer.mp4
    python render.py --workers 3      render segments in parallel
    python render.py --check          load the page, list parts, show errors
    python render.py --still 12 40    save PNG stills (to stills/)

The video is rendered in 5-minute segments (parts/seg_XXX.mp4). A segment
that already exists is reused, so an interrupted render can be resumed by
running the same command again. Delete the parts/ folder to start fresh.

Needs: playwright (uses the installed Microsoft Edge), numpy, ffmpeg.
"""

import argparse
import math
import shutil
import subprocess
import sys
import time
import wave
from pathlib import Path

import numpy as np
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
HTML = HERE / "explainer.html"
OUT = HERE / "outline_explainer.mp4"
PARTS_DIR = HERE / "parts"
WAV = PARTS_DIR / "soundtrack.wav"
CHAPTERS = PARTS_DIR / "chapters.txt"
FPS = 30
RATE = 44100
SEGMENT = 300  # seconds per segment


def midi_hz(note):
    return 440.0 * 2 ** ((note - 69) / 12)


CHORDS = [
    [45, 57, 60, 64, 71], [41, 53, 57, 60, 67],   # Am, F
    [48, 55, 60, 64, 67], [43, 55, 59, 62, 69],   # C, G
    [50, 57, 62, 65, 69], [45, 57, 60, 64, 67],   # Dm, Am
    [41, 53, 60, 64, 69], [43, 55, 62, 67, 71],   # Fmaj7, G
]
CHORD_LEN = 8.0
FADE = 2.5


def pad_chunk(t):
    """Ambient pad for the sample times t (seconds). Returns (left, right)."""
    left = np.zeros(len(t))
    right = np.zeros(len(t))
    first = max(0, int((t[0] - FADE) // CHORD_LEN) - 1)
    last = int((t[-1] + FADE) // CHORD_LEN) + 1
    span = CHORD_LEN + 2 * FADE
    for index in range(first, last + 1):
        start = index * CHORD_LEN
        local = t - (start - FADE)
        inside = (local >= 0) & (local <= span)
        if not inside.any():
            continue
        seg = t[inside]
        loc = local[inside]
        env = np.clip(np.minimum(loc / (2 * FADE), (span - loc) / (2 * FADE)),
                      0, 1)
        env = 0.5 - 0.5 * np.cos(np.pi * env)
        for k, note in enumerate(CHORDS[index % len(CHORDS)]):
            f = midi_hz(note)
            amp = 0.5 if k == 0 else 0.3
            for side, detune in ((left, -0.18), (right, 0.18)):
                tone = (np.sin(2 * np.pi * (f + detune) * seg)
                        + 0.3 * np.sin(2 * np.pi * 2 * (f + detune) * seg)
                        + 0.1 * np.sin(2 * np.pi * 3 * f * seg))
                side[inside] += amp * env * tone
    return left, right


def chime_chunk(t, chimes):
    out = np.zeros(len(t))
    for s in chimes:
        inside = (t >= s) & (t < s + 3)
        if not inside.any():
            continue
        seg = t[inside] - s
        env = np.exp(-seg * 2.0) * np.clip(seg / 0.01, 0, 1)
        out[inside] += env * (np.sin(2 * np.pi * midi_hz(76) * seg)
                              + 0.5 * np.sin(2 * np.pi * midi_hz(83) * seg))
    return out


def make_soundtrack(total, chimes, path):
    """Write the soundtrack WAV in 10-second chunks (keeps memory small)."""
    n = int(total * RATE)
    probe = np.arange(int(6 * RATE), int(16 * RATE)) / RATE
    peak = max(np.max(np.abs(side)) for side in pad_chunk(probe)) + 0.6
    gain = 0.2 / peak
    chunk = 10 * RATE
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(RATE)
        for a in range(0, n, chunk):
            t = np.arange(a, min(n, a + chunk)) / RATE
            left, right = pad_chunk(t)
            bell = 0.5 * chime_chunk(t, chimes)
            master = np.clip(np.minimum(t / 2.0, (total - t) / 4.0), 0, 1)
            stereo = np.stack([left + bell, right + bell], axis=1)
            stereo *= (gain * master)[:, None]
            pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
            wav_file.writeframes(pcm.tobytes())


def open_page(playwright):
    browser = playwright.chromium.launch(channel="msedge")
    page = browser.new_page(viewport={"width": 1920, "height": 1080},
                            device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text)
            if m.type == "error" else None)
    page.goto(HTML.as_uri() + "?render=1")
    try:
        page.wait_for_function("window.READY === true", timeout=60000)
    except Exception:
        print("\n".join(errors) or "page did not become ready")
        raise
    return browser, page, errors


def timeline():
    with sync_playwright() as playwright:
        browser, page, errors = open_page(playwright)
        info = page.evaluate(
            "({total: window.TOTAL, parts: window.PARTS, scenes: window.SCENES})")
        browser.close()
    return info, errors


def fmt(seconds):
    return f"{int(seconds // 60)}:{int(seconds % 60):02d}"


def check():
    info, errors = timeline()
    print("total", fmt(info["total"]), f"({info['total']:.1f} s),",
          len(info["scenes"]), "scenes")
    for part in info["parts"]:
        print(f"  {fmt(part['start']):>6}  Part {part['no']}: {part['title']}")
    if errors:
        print("ERRORS:\n" + "\n".join(errors))


def stills(times, outdir):
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser, page, errors = open_page(playwright)
        for moment in times:
            page.evaluate(f"seek({moment})")
            out = outdir / f"still_{moment:07.1f}.png"
            page.screenshot(path=str(out))
            print(out)
        browser.close()
    if errors:
        print("ERRORS:\n" + "\n".join(errors))


def segment_path(index):
    return PARTS_DIR / f"seg_{index:03d}.mp4"


def render_segment(index, ffmpeg):
    """Render one segment of video (no audio) to parts/seg_XXX.mp4."""
    out = segment_path(index)
    if out.exists():
        return
    tmp = out.with_suffix(".tmp.mp4")
    with sync_playwright() as playwright:
        browser, page, _ = open_page(playwright)
        total = page.evaluate("window.TOTAL")
        frames = int(math.ceil(total * FPS))
        first = index * SEGMENT * FPS
        last = min(frames, (index + 1) * SEGMENT * FPS)
        command = [
            ffmpeg, "-y", "-loglevel", "error",
            "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
            "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(FPS), str(tmp),
        ]
        encoder = subprocess.Popen(command, stdin=subprocess.PIPE)
        began = time.time()
        for frame in range(first, last):
            page.evaluate(f"seek({frame / FPS})")
            encoder.stdin.write(page.screenshot(type="jpeg", quality=93))
            done = frame - first + 1
            if done % 900 == 0:
                rate = done / (time.time() - began)
                print(f"seg {index}: {done}/{last - first} frames "
                      f"{rate:.1f} fps", flush=True)
        encoder.stdin.close()
        encoder.wait()
        browser.close()
    tmp.replace(out)
    print(f"seg {index} done", flush=True)


def write_chapters(info, path):
    lines = [";FFMETADATA1", "title=Two-Player Chess: the outline explained"]
    starts = [0.0] + [p["start"] for p in info["parts"]]
    names = ["Introduction"] + [f"Part {p['no']}: {p['title']}"
                                for p in info["parts"]]
    ends = starts[1:] + [info["total"]]
    for start, end, name in zip(starts, ends, names):
        lines += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(start * 1000)}",
                  f"END={int(end * 1000)}", f"title={name}"]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    listing = HERE / "chapters.txt"
    listing.write_text("\n".join(f"{fmt(s)} {n}" for s, n in
                                 zip(starts, names)) + "\n", encoding="utf-8")


def render(workers):
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        sys.exit("ffmpeg not found")
    PARTS_DIR.mkdir(exist_ok=True)
    info, errors = timeline()
    if errors:
        sys.exit("page errors:\n" + "\n".join(errors))
    total = info["total"]
    count = int(math.ceil(total / SEGMENT))
    print(f"{fmt(total)} in {count} segments, {workers} worker(s)", flush=True)
    pending = [i for i in range(count) if not segment_path(i).exists()]
    running = []
    while pending or running:
        while pending and len(running) < workers:
            i = pending.pop(0)
            running.append(subprocess.Popen(
                [sys.executable, str(Path(__file__)), "--segment", str(i)]))
        time.sleep(2)
        for proc in list(running):
            if proc.poll() is not None:
                running.remove(proc)
                if proc.returncode != 0:
                    sys.exit("a segment failed; run again to resume")
    chimes = [p["start"] for p in info["parts"]]
    make_soundtrack(total, chimes, WAV)
    write_chapters(info, CHAPTERS)
    listing = PARTS_DIR / "segments.txt"
    listing.write_text("".join(f"file '{segment_path(i).name}'\n"
                               for i in range(count)), encoding="utf-8")
    subprocess.run([
        ffmpeg, "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", str(listing),
        "-i", str(WAV), "-i", str(CHAPTERS),
        "-map", "0:v", "-map", "1:a", "-map_metadata", "2",
        "-map_chapters", "2", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
        "-shortest", "-movflags", "+faststart", str(OUT),
    ], check=True)
    print("done:", OUT)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--still", nargs="*", type=float)
    parser.add_argument("--outdir", default=str(HERE / "stills"))
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--segment", type=int)
    parser.add_argument("--workers", type=int, default=1)
    args = parser.parse_args()
    if args.check:
        check()
    elif args.still:
        stills(args.still, args.outdir)
    elif args.segment is not None:
        render_segment(args.segment, shutil.which("ffmpeg"))
    else:
        render(args.workers)
