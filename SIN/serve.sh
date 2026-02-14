#!/usr/bin/env sh

echo "Starting map server..."
echo "This window must remain open while playing."
echo

# Navigate to the script directory
cd "/Users/valentinliedtke/Library/Application Support/metro-maker4/mods/SIN/scripts"

# Run pmtiles (Linux/macOS binary assumed to be named 'pmtiles')
./pmtiles serve . --port 8081 --cors="*"
status=$?

if [ $status -ne 0 ]; then
    echo
    echo "Error: Could not start pmtiles"
    # macOS/Linux equivalent of 'pause'
    read -r -p "Press Enter to exit..."
fi
