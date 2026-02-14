# Subway Builder – Map Mods collection: Fukuoka, Vancouver, Singapore, Cape Town, Warsaw, Athens, Dublin

**These mods are modified Versions of mhmoellers Copenhagen City Mod.**
**You can find the original Copenhagen City Mod (published under the MIT license as far as i know) here: https://github.com/mhmoeller/SubwayBuilder-CPH**

## Cities and Data Quality

This pack includes Fukuoka (Japan), Vancouver (Canada), and Singapore (Whatever country this might be in...)

The Data has been generated with early commute and resident data generation scripts from Kronifers subwaybuilder patcher. (https://github.com/Kronifer/subwaybuilder-patcher) so **the commute and residents data is not based on real census data and the resolution is quite inconsistent, but it is mostly reasonable and playable.**

### Quality by city (best to worst)

As OpenStreetMap coverage varies country by country, and i dont know how the algorithms generating demand data work (i might change them at some point), the quality of cities varies (a lot)

Fukuoka: Good (Data Resolution: Very Good, Buildings: Good)
Warsaw: Good (Data Resolution: Very Good, Buildings: Good)
Singapore: OK (Data Resolution: OK, Buildings: Good)
Athens: OK (Data Resolution: OK, Buildings: OK)
Vancouver: Meh (Data Resolution: Bad, Buildings: Good)
Cape Town: Bad (Data Resolution: Terrible, Buildings: OK)
Dublin: Bad (Data Resolution: Terrible, Buildings: OK)

## Features

 Automated Installer: Includes a custom Node.js script that automatically places large data files in the correct game directories (cities/data/CPH) while keeping the mod manageable. Portable Map Server: Generates a serve.bat file that makes hosting the local map tiles (PMTiles) easy.

 **All of these scripts are from https://github.com/mhmoeller/SubwayBuilder-CPH, and i am very glad they can be adapted to other cities without many modifications.Thanks to mhmoeller and the Subwaybuilder modding community for making this possible!**

## Requirements
Subway Builder (the game)
Node.js (Required to run the installer script)
The files from this repository.

## Installation
The installation process is automated to ensure all data files end up in the correct folders.

1. Make sure all requirements are met

2. **Download the Code, unzip it and move the individual city mods (YVR, SIN, FUK) into your games mod folder.**

3. Run the Installer:

#### Windows:
Double-click install.bat inside the CPH folder.
#### macOS:

Method 1 (Recommended): Open Terminal, navigate to the CPH folder and run:
```
./install.sh
```
Method 2: Right-click install.sh, select "Open With" → "Terminal"

Method 3: In Finder, open the CPH folder, then open Terminal and drag install.sh into the Terminal window, press Enter

If you get a "permission denied" error, try the linux solution, it worked for me. The command for linux (chmod +x) gives the program permission to run.

#### Linux:

Open a terminal in the CPH folder and run:
```
chmod +x install.sh
./install.sh
```
Wait for the script to finish. It will:
Move the heavy data files (.gz) to the cities/data/(Whatever city you are adding) folder.
Generate a serve.bat or serve.sh file for you.

## How to Play
Start the Map Server:
Locate the serve.bat or serve.sh file (created by the installer in the mod folder).
Tip: You can move serve.bat to your Desktop for easy access.
Double-click it to start the local server.
If this does not work, start it the same way install.bat or install.sh was.
Keep this window open while playing.
Start the Game:
Open Subway Builder.
Go to Mods and enable the city (if listed).
Close the game entirely.
Restart the game.
Start a New Game and select CPH as your city.

### Notes
Data Files: The installer moves ocean_depth_index.json.gz, roads.geojson.gz, buildings_index.json.gz, etc., to the game's internal data structure.

Map Server: The pmtiles.exe utility is included to serve the map tiles locally. The serve.bat script launches this on port 8081 with CORS enabled, which is required for the game to display the background map.

Uninstalling: To remove a map, delete the corresponding folder from your mods directory and delete the city folder from %APPDATA%\metro-maker4\cities\data\, or on Mac: Library/Application Support/metro-maker4/cities/data
