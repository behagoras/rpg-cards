#!/usr/bin/env bash
set -euo pipefail

# Print a single JSON deck to a front-only PDF (US Letter) and strip the last page if present.
# Usage: scripts/print-one.sh /abs/path/to/deck.json

DECK="$1"
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
OUT_DIR="$ROOT_DIR/Cards/5e/output"
PORT="${PORT:-8099}"
CHROME_BIN="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

mkdir -p "$OUT_DIR"

json_rel="/${DECK#$ROOT_DIR/}"
deck_qs=$(python3 - "$json_rel" <<'PY'
import sys, urllib.parse
p = sys.argv[1]
print(urllib.parse.quote(p, safe='/'))
PY
)

rel_out="${DECK#$ROOT_DIR/}"
out_pdf="$OUT_DIR/${rel_out%.json}.front-only.letter.pdf"
mkdir -p "$(dirname "$out_pdf")"

(cd "$ROOT_DIR" && python3 -m http.server "$PORT" >/dev/null 2>&1 & echo $! > "$OUT_DIR/.http_pid")
sleep 1

"$CHROME_BIN" --headless --disable-gpu --no-sandbox \
  --virtual-time-budget=6000 --print-to-pdf-no-header \
  --print-to-pdf="$out_pdf" \
  "http://localhost:$PORT/generator/cli.html?deck=$deck_qs&pw=8.5in&ph=11in&arr=front_only&fill=0"

kill "$(cat "$OUT_DIR/.http_pid")" 2>/dev/null || true

# Strip last page
python3 - "$out_pdf" <<'PY'
import sys, os
try:
    from pypdf import PdfReader, PdfWriter
except Exception:
    try:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "--quiet", "pypdf"])
        from pypdf import PdfReader, PdfWriter
    except Exception:
        sys.exit(0)

pdf = sys.argv[1]
try:
    r = PdfReader(pdf)
except Exception:
    sys.exit(0)
n = len(r.pages)
if n <= 1:
    sys.exit(0)
w = PdfWriter()
for i in range(n - 1):
    w.add_page(r.pages[i])
tmp = pdf + '.tmp'
with open(tmp, 'wb') as f:
    w.write(f)
os.replace(tmp, pdf)
PY

echo "$out_pdf"


