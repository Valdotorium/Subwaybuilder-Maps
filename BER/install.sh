#!/bin/bash

echo "Starting installation with Node.js(mhmoeller installer)..."
echo

echo "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH!"
    echo "Please install Node.js first from: https://nodejs.org/"
    exit 1
fi

echo "Node.js found."
echo

echo "Installing required packages (adm-zip)..."
echo "(This may take a moment if it's the first time)..."
npm install adm-zip --no-progress --silent 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Warning: Could not install adm-zip automatically."
    echo "The installer will try alternative methods."
    echo
fi

echo "Running installer..."
node install.js
EXIT_CODE=$?

echo
if [ $EXIT_CODE -eq 0 ]; then
    echo "Installation completed successfully!"
else
    echo "An error occurred during installation."
fi

echo "Press Enter to close..."
read -r
exit $EXIT_CODE
