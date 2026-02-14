@echo off
title Install Map Pack
echo Starting installation with Node.js(mhmoeller installer)...
echo.

echo Step 1: Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found.

echo.
echo Step 2: Checking/installing required npm packages...
echo Installing adm-zip...
call npm install adm-zip
if %errorlevel% neq 0 (
    echo ERROR: Failed to install adm-zip!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo Step 3: Running installer...
node install.js
set EXIT_CODE=%errorlevel%

echo.
if %EXIT_CODE% neq 0 (
    echo An error occurred during installation.
) else (
    echo Installation completed successfully!
)

echo Press any key to close...
pause >nul
exit /b %EXIT_CODE%
