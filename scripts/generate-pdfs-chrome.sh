#!/usr/bin/env bash
set -euo pipefail

# Generate PDFs for every JSON deck under a root folder using local Chrome headless.
# Requires: Google Chrome (or Chromium) installed.
# Usage: scripts/generate-pdfs-chrome.sh [inputDir] [outputDir]
# Defaults: inputDir=./Cards/5e, outputDir=./Cards/5e/output

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
GEN_DIR="$ROOT_DIR/generator"
INPUT_ARG="${1:-$ROOT_DIR/Cards/5e}"
OUTPUT_DIR="${2:-$ROOT_DIR/Cards/5e/output}"

mkdir -p "$OUTPUT_DIR"

# Find Chrome
CHROME_CANDIDATES=(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta"
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  "google-chrome"
  "chromium"
  "chromium-browser"
)

CHROME_BIN=""
for c in "${CHROME_CANDIDATES[@]}"; do
  if command -v "$c" >/dev/null 2>&1; then CHROME_BIN=$(command -v "$c"); break; fi
  if [ -x "$c" ]; then CHROME_BIN="$c"; break; fi
done

if [ -z "$CHROME_BIN" ]; then
  echo "Error: Chrome/Chromium not found. Please install Google Chrome or Chromium." >&2
  exit 1
fi

# Start a simple local server for the generator directory
PORT=${PORT:-8080}
PID_FILE="$OUTPUT_DIR/.http_pid"

start_server() {
  if command -v python3 >/dev/null 2>&1; then
    (cd "$ROOT_DIR" && python3 -m http.server "$PORT" >/dev/null 2>&1 & echo $! > "$PID_FILE")
  elif command -v python >/dev/null 2>&1; then
    (cd "$ROOT_DIR" && python -m SimpleHTTPServer "$PORT" >/dev/null 2>&1 & echo $! > "$PID_FILE")
  else
    echo "Error: Python not found to serve static files." >&2
    exit 1
  fi
  # Wait a moment for server to start
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

BASE_URL="http://localhost:$PORT"

wait_url() {
  # wait_url <url> <timeout_seconds>
  local url="$1"; local timeout="${2:-10}"; local i=0
  while [ $i -lt $timeout ]; do
    if curl -s -I "$url" | head -n1 | grep -q "200"; then return 0; fi
    sleep 1; i=$((i+1))
  done
  return 1
}

# Collect JSON files (portable, works on old bash)
if [ -f "$INPUT_ARG" ]; then
  FILES="$INPUT_ARG"
  INPUT_DIR=$(dirname "$INPUT_ARG")
else
  INPUT_DIR="$INPUT_ARG"
  FILES=$(find "$INPUT_DIR" -type f -name '*.json' | sort)
fi

if [ -z "$FILES" ]; then
  echo "No JSON files found in $INPUT_DIR" >&2
  exit 1
fi

printf "%s\n" "$FILES" | while IFS= read -r json; do
  [ -z "$json" ] && continue
  rel_input="${json#$INPUT_DIR/}"
  # Path of JSON relative to repo root (server docroot)
  rel_from_root=$(python3 - "$json" "$ROOT_DIR" <<'PY'
import os, sys
json_path = sys.argv[1]
root_dir = sys.argv[2]
print(os.path.relpath(json_path, root_dir))
PY
)

  out_pdf="$OUTPUT_DIR/${rel_input%.json}.pdf"
  mkdir -p "$(dirname "$out_pdf")"

  # URL-encode deck path used in query string
  deck_qs=$(python3 - "$rel_from_root" <<'PY'
import sys, urllib.parse
p = sys.argv[1]
p = '/' + p.lstrip('/')
print(urllib.parse.quote(p, safe='/'))
PY
)

  # Preflight: ensure the JSON is reachable (retry)
  deck_url="$BASE_URL$deck_qs"
  if ! wait_url "$deck_url" 12; then
    echo "[SKIP] $rel_input (404 for $deck_url)" >&2
    continue
  fi

  url="$BASE_URL/generator/cli.html?deck=$deck_qs&pw=210mm&ph=297mm&arr=doublesided"

  echo "[GEN] $rel_input -> ${out_pdf#$ROOT_DIR/}"
  "$CHROME_BIN" \
    --headless \
    --disable-gpu \
    --no-sandbox \
    --virtual-time-budget=5000 \
    --print-to-pdf="$out_pdf" \
    "$url" >/dev/null 2>&1 || {
      echo "[FAIL] $rel_input" >&2
      continue
    }
done

echo "Done. PDFs in: $OUTPUT_DIR"


