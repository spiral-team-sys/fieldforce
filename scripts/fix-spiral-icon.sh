#!/bin/bash
set -e

echo "Running SpiralIcon codemod..."

npx jscodeshift \
    -t scripts/add-spiral-icon-import.js \
    src \
    --parser=tsx \
    --extensions=ts,tsx,js,jsx \
    -j "$(nproc 2>/dev/null || sysctl -n hw.ncpu)"

echo "Formatting..."

npx prettier --write "src/**/*.{ts,tsx,js,jsx}"

echo "Done."