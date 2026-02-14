# Subway Builder – Map Mods collection: Fukuoka, Vancouver, Singapore

**These mods are modified Versions of mhmoellers Copenhagen City Mod.**
**You can find the original Copenhagen City Mod (published under the MIT license as far as i know) here: https://github.com/mhmoeller/SubwayBuilder-CPH**

## Features

 Automated Installer: Includes a custom Node.js script that automatically places large data files in the correct game directories (cities/data/CPH) while keeping the mod manageable. Portable Map Server: Generates a serve.bat file that makes hosting the local map tiles (PMTiles) easy.

 **All of these scripts are from https://github.com/mhmoeller/SubwayBuilder-CPH, and i am very glad they can be adapted to other cities without many modifications.Thanks to mhmoeller and the Subwaybuilder modding community for making this possible!**

## Requirements
Subway Builder (the game)
Node.js (Required to run the installer script)
The files from this repository.

## Installation
The installation process is automated to ensure all data files end up in the correct folders.

1. 

3. [**Download the latest release (ZIP file)**](https://github.com/mhmoeller/SubwayBuilder-CPH/archive/refs/heads/main.zip)

4. Unzip the content into your game's Mods folder:

   Make sure it's not mods/cph/cph/(the files) but instead make it mods/cph/(the files)

5. Run the Installer:

#### Windows:
Double-click install.bat inside the CPH folder.
#### macOS:

Method 1 (Recommended): Open Terminal, navigate to the CPH folder and run:
```
./install.sh
```
Method 2: Right-click install.sh, select "Open With" → "Terminal"

Method 3: In Finder, open the CPH folder, then open Terminal and drag install.sh into the Terminal window, press Enter

#### Linux:

Open a terminal in the CPH folder and run:
```
chmod +x install.sh
./install.sh
```
Wait for the script to finish. It will:
Move the heavy data files (.gz) to the cities/data/CPH folder.
Generate a serve.bat file for you.

## How to Play
Start the Map Server:
Locate the serve.bat file (created by the installer in the mod folder).
Tip: You can move serve.bat to your Desktop for easy access.
Double-click it to start the local server. Keep this window open while playing.
Start the Game:
Open Subway Builder.
Go to Mods and enable CPH (if listed).
Close the game entirely.
Restart the game.
Start a New Game and select CPH as your city.

### Notes
Data Files: The installer moves ocean_depth_index.json.gz, roads.geojson.gz, buildings_index.json.gz, etc., to the game's internal data structure.

Map Server: The pmtiles.exe utility is included to serve the map tiles locally. The serve.bat script launches this on port 8081 with CORS enabled, which is required for the game to display the background map.

Uninstalling: To remove the map, delete the CPH folder from your mods directory and delete the CPH folder from %APPDATA%\metro-maker4\cities\data\.
