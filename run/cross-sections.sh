#!/bin/sh
# Cross-Sections on Linux. Run ./run/cross-sections.sh, or mark it executable and double-click it.
DIR=$(dirname "$0")
if command -v python3 >/dev/null 2>&1; then
  exec python3 "$DIR/cross-sections.py" "$@"
fi
echo "python3 was not found. Opening the portable dist/cross-sections.html directly."
exec xdg-open "$DIR/../dist/cross-sections.html"
