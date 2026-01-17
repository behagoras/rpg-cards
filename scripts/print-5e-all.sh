#!/usr/bin/env bash
set -euo pipefail

# Batch-generate front-only PDFs for all JSON decks under Cards/5e
# Usage: scripts/print-5e-all.sh [inputDir] [outputDir] [port]
# Defaults: inputDir=./Cards/5e, outputDir=./Cards/5e/output, port=8091

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
INPUT_DIR="${1:-$ROOT_DIR/Cards/5e}"
OUTPUT_DIR="${2:-$INPUT_DIR/output}"
PORT="${3:-8091}"

mkdir -p "$OUTPUT_DIR"

# Find Chrome (macOS default first)
CHROME_BIN="${CHROME_BIN:-}"
if [ -z "${CHROME_BIN}" ]; then
  CANDS=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "google-chrome" "chromium" "chromium-browser"
  )
  for c in "${CANDS[@]}"; do
    if command -v "$c" >/dev/null 2>&1; then CHROME_BIN=$(command -v "$c"); break; fi
    if [ -x "$c" ]; then CHROME_BIN="$c"; break; fi
  done
fi
if [ -z "$CHROME_BIN" ]; then
  echo "Error: Chrome/Chromium not found. Set CHROME_BIN env var or install Chrome." >&2
  exit 1
fi

# Start static server from repo root
PID_FILE="$OUTPUT_DIR/.http_pid"
start_server() {
  (cd "$ROOT_DIR" && python3 -m http.server "$PORT" >/dev/null 2>&1 & echo $! > "$PID_FILE")
  sleep 1
}
stop_server() {
  if [ -f "$PID_FILE" ]; then
    kill "$(cat "$PID_FILE")" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
}
trap stop_server EXIT
start_server

# Prepare an isolated venv for PDF post-processing (PEP 668 safe)
VENV_DIR="$OUTPUT_DIR/.venv_pdf"
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR" >/dev/null 2>&1 || true
fi
PYBIN=""
if [ -x "$VENV_DIR/bin/python" ]; then
  PYBIN="$VENV_DIR/bin/python"
  "$PYBIN" -m pip -q install --upgrade pip >/dev/null 2>&1 || true
  "$PYBIN" -m pip -q install pypdf >/dev/null 2>&1 || true
fi

# Walk JSON files (exclude output dir) - POSIX-friendly
FILES=$(find "$INPUT_DIR" -type f -name '*.json' ! -path "$OUTPUT_DIR/*" | sort)
if [ -z "$FILES" ]; then
  echo "No JSON files found in $INPUT_DIR" >&2
  exit 1
fi

printf "%s\n" "$FILES" | while IFS= read -r json; do
  [ -z "$json" ] && continue
  rel_in="${json#$INPUT_DIR/}"
  rel_root="/${json#$ROOT_DIR/}"

  # URL-encode path but keep slashes
  deck_qs=$(python3 - "$rel_root" <<'PY'
import sys, urllib.parse
p = sys.argv[1]
print(urllib.parse.quote(p, safe='/'))
PY
)

  out_pdf="$OUTPUT_DIR/${rel_in%.json}.front-only.pdf"
  mkdir -p "$(dirname "$out_pdf")"

  # Use US Letter page size
  url="http://localhost:$PORT/generator/cli.html?deck=$deck_qs&pw=8.5in&ph=11in&arr=front_only&fill=0&wait=1500"
  echo "[GEN] $rel_in -> ${out_pdf#$ROOT_DIR/}"
  "$CHROME_BIN" \
    --headless --disable-gpu --no-sandbox \
    --virtual-time-budget=6000 \
    --print-to-pdf-no-header \
    --print-to-pdf="$out_pdf" \
    "$url" >/dev/null 2>&1 || echo "[FAIL] $rel_in" >&2

  # Strip the last page (some environments add an extra trailing sheet)
  if [ -n "$PYBIN" ]; then
  "$PYBIN" - "$out_pdf" <<'PY'
import sys, os
pdf_path = sys.argv[1]
tmp = pdf_path + ".tmp"

def try_libs():
    for name in ("pypdf", "PyPDF2"):
        try:
            if name == "pypdf":
                from pypdf import PdfReader, PdfWriter
            else:
                from PyPDF2 import PdfReader, PdfWriter
            return PdfReader, PdfWriter
        except Exception:
            pass
    return None, None

PdfReader, PdfWriter = try_libs()
if PdfReader is None:
    try:
        import subprocess, sys as _s
        subprocess.check_call([_s.executable, "-m", "pip", "install", "--user", "--quiet", "pypdf"])
        from pypdf import PdfReader, PdfWriter
    except Exception:
        sys.exit(0)

try:
    r = PdfReader(pdf_path)
except Exception:
    sys.exit(0)
n = len(r.pages)
if n <= 1:
    sys.exit(0)
w = PdfWriter()
for i in range(n - 1):
    w.add_page(r.pages[i])
with open(tmp, "wb") as f:
    w.write(f)
os.replace(tmp, pdf_path)
PY
  fi
done

echo "Done. Opening: $OUTPUT_DIR"
open "$OUTPUT_DIR" 2>/dev/null || true


