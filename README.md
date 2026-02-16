# Subway Builder – Map Mods collection: Fukuoka, Berlin, Singapore, Bengaluru, Sapporo, Trondheim, Warsaw, Athens, Vancouver

**These mods are modified Versions of mhmoellers Copenhagen City Mod.**
You can find the original Copenhagen City Mod (published under the MIT license as far as i know) here: https://github.com/mhmoeller/SubwayBuilder-CPH

**Installation instructions are further down.**

## Cities and Data Quality

This pack includes Fukuoka (Japan), Berlin (Germany), Trondheim (Norway), Singapore (Whatever country this might be in...), and some more cities.

The Data has been generated with early commute and resident data generation scripts from Kronifers subwaybuilder patcher. (https://github.com/Kronifer/subwaybuilder-patcher) so **the commute and residents data is not based on real census data and the resolution is quite inconsistent, but it is mostly reasonable and playable.**

There are some - lets call it - unconventional people counts in some places, (like 27.000 people living and 200.000 people working at athens airport) - i have tried fixing some of them, but right not there is not very much i can do.

## Features

 Automated Installer: Includes a custom Node.js script that automatically places large data files in the correct game directories (cities/data/CPH) while keeping the mod manageable. Portable Map Server: Generates a serve.bat file that makes hosting the local map tiles (PMTiles) easy.

 **All of these scripts used in the mods and for data generation are from https://github.com/mhmoeller/SubwayBuilder-CPH and https://github.com/Kronifer/subwaybuilder-patcher, and i am very glad they can be adapted to other cities without many modifications.Thanks to mhmoeller, Kronifer and the Subwaybuilder modding community for making this possible!**

### Quality by city (best to worst)

As OpenStreetMap coverage varies country by country, and i dont know how the algorithms generating demand data work (i might change them at some point), the quality of cities varies (a lot)

Fukuoka: Good (Data Resolution: Very Good, Buildings: Good)

Singapore: Good (Data Resolution: Good, Buildings: Good)

Berlin: Good (Data Resolution: Good, Buildings: Good)

Trondheim: Good (Data Resolution: Good, Buildings: Good)

Bengaluru: OK (Data Resolution: Good, Buildings: OK)

Sapporo: OK (Data Resolution: Varies,  Buildings: Good)

Warsaw: OK (Data Resolution: OK, Buildings: Good)

Athens: OK (Data Resolution: OK, Buildings: OK)

Vancouver: Meh (Data Resolution: Bad, Buildings: Good)

**Removed:**

Cape Town: Bad (Data Resolution: Terrible, Buildings: OK)

Dublin: Bad (Data Resolution: Terrible, Buildings: OK)

Scale:

Data Resolution: How well spaced and reasonable the demand data is.
The more pops there are, the more playable / realistic it gets.
Good means the map is well playable, while Bad or Terrible mean that pops are often miles apart and very small / large

Buildings:
Good means most buildings do exist and they are 3d, while OK and worse mean that some buildings may be missing or the map is not available in 3d.

## Requirements
Subway Builder (the game)
Node.js (Required to run the installer script)
The files from this repository.

## Installation
The installation process is automated to ensure all data files end up in the correct folders. Read through all of the instructions *carefully*.

**Problems during installation?**

If you have problems during the installation (like node or pmtiles not being installed), you can probably read from here on in discord, where ive explained most things: https://discord.com/channels/1420846272545296470/1472331743154671709/1472927667706925157

**Instructions**

1. Make sure all requirements are met

2. **Download the Code, and unzip it.**

3. **Move all the city mods you want to play to the games mods folder**(not alltiles, as this folder is just required to host the tiles of the maps and is not a mod)

4. Run the Installer (double click install.sh /install.bat) in every city folder. See the following paragraphs for platform-specific instructions.

#### Windows:
Double-click install.bat inside the CPH folder.

If this does not work, open a terminal in the cities folder (You may have to look up how that works)
   and then just enter `node install.js` (if you have node already installed, if not, get it from https://nodejs.org/en or run `ìnstall.bat` in the terminal.
   
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

5. **Start the server** by executing pmtiles in your alltiles folder. First, try executing (double click) serve.sh in the alltiles folder.
If this does not work, try this: Open a terminal in the alltiles folder and use this command: `./pmtiles serve . --port 8081 --cors="*" `on mac or `pmtiles.exe serve . --port 8081 --cors="*" on windows` (at least i think thats what the command for windows would look like...)
Once you see lines like `Serving  . on port 8081 and interface 0.0.0.0 with Access-Control-Allow-Origin: *` it worked.


## How to Play
Start the Map Server.
This will host all tiles of all cities in the pack, even if not downloaded.
If this does not work, start it the same way install.bat or install.sh was.
Keep this window open while playing.
Start the Game:
Open Subway Builder.
Go to Mods and enable the city (if listed).
Close the game entirely.
Restart the game.
Start a New Game and select CPH as your city.

5. **Start the server** by executing pmtiles in your alltiles folder. First, try executing (double click) serve.sh in the alltiles folder.
If this does not work, try this: Open a terminal in the alltiles folder and use this command: `./pmtiles serve . --port 8081 --cors="*" `on mac or `pmtiles.exe serve . --port 8081 --cors="*" on windows` (at least i think thats what the command for windows would look like...)

### Notes
Data Files: The installer moves ocean_depth_index.json.gz, roads.geojson.gz, buildings_index.json.gz, etc., to the game's internal data structure.

Map Server: The pmtiles.exe utility is included to serve the map tiles locally. The serve.bat script launches this on port 8081 with CORS enabled, which is required for the game to display the background map.

Uninstalling: To remove a map, delete the corresponding folder from your mods directory and delete the city folder from %APPDATA%\metro-maker4\cities\data\, or on Mac: Library/Application Support/metro-maker4/cities/data
