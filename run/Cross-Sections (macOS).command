#!/bin/sh
# Cross-Sections on macOS: double-click to open. macOS may ask you to allow it the first time.
DIR=$(cd "$(dirname "$0")" && pwd)
if command -v python3 >/dev/null 2>&1; then
  exec python3 "$DIR/cross-sections.py"
fi
echo "python3 was not found. Opening the portable dist/cross-sections.html directly."
open "$DIR/../dist/cross-sections.html"
