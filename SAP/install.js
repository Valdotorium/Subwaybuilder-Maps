const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

// --- DYNAMIC CONFIGURATION FROM MANIFEST ---
const GAME_FOLDER_NAME = "metro-maker4";
const MANIFEST_FILE = "manifest.json";

// Read and parse manifest.json to get the ID
let manifest;
try {
    const manifestPath = path.join(__dirname, MANIFEST_FILE);
    if (!fs.existsSync(manifestPath)) {
        throw new Error("File not found");
    }
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
    console.error(`Error: Could not read ${MANIFEST_FILE}. Make sure it is in the same folder as this script.`);
    console.error(`Details: ${err.message}`);
    process.exit(1);
}

// Parse the ID (e.g., "com.mhmoeller.CPH")
// Expected format: com.author.CityName
const idParts = manifest.id ? manifest.id.split('.') : [];
let author = "Unknown";
let cityName = "Mod";

if (idParts.length >= 3) {
    // Standard format: com.author.city
    author = idParts[1]; 
    cityName = idParts.slice(2).join('.');
} else if (manifest.id) {
    // Fallback if ID format is non-standard
    cityName = manifest.id;
}

// Variables for the installer
const DISPLAY_NAME = `${author}'s ${cityName}`;  // e.g. "mhmoeller's CPH"
const TARGET_FOLDER_NAME = cityName;             // e.g. "CPH" (The folder inside cities/data/)

// Files to move to cities/data/TARGET_FOLDER_NAME
const DATA_FILES = [
    "roads.geojson.gz",
    "buildings_index.json.gz",
    "demand_data.json.gz",
    "runways_taxiways.geojson.gz"
];

// --- HELPER: Handle Redirects ---
async function downloadFileWithRedirects(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const request = (currentUrl) => {
            https.get(currentUrl, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    if (response.headers.location) {
                        request(response.headers.location);
                        return;
                    } else {
                        reject(new Error("Redirect without location header"));
                        return;
                    }
                }
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        };
        request(url);
    });
}

// --- HELPER: Get latest pmtiles version ---
function getLatestPmtilesVersion() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: '/repos/protomaps/go-pmtiles/releases/latest',
            method: 'GET',
            headers: { 'User-Agent': 'Node.js Script' }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const version = json.tag_name.replace(/^v/, '');
                        resolve(version);
                    } catch (e) {
                        reject(new Error("Couldn't parse JSON from GitHub"));
                    }
                } else {
                    reject(new Error(`GitHub API failed with status: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

// Dynamisk URL bygning baseret på system og version
function getPmtilesUrl(version) {
    const platform = os.platform();
    const arch = os.arch();
    console.log(`Detected System: ${platform} (${arch})`);

    let filename = "";
    if (platform === 'win32') {
        if (arch === 'x64') filename = `go-pmtiles_${version}_Windows_x86_64.zip`;
        else if (arch === 'arm64') filename = `go-pmtiles_${version}_Windows_arm64.zip`;
    } else if (platform === 'darwin') {
        if (arch === 'x64') filename = `go-pmtiles-${version}_Darwin_x86_64.zip`;
        else if (arch === 'arm64') filename = `go-pmtiles-${version}_Darwin_arm64.zip`;
    } else if (platform === 'linux') {
        if (arch === 'x64') filename = `go-pmtiles_${version}_Linux_x86_64.tar.gz`;
        else if (arch === 'arm64') filename = `go-pmtiles_${version}_Linux_arm64.tar.gz`;
    }

    if (!filename) {
        console.error("ERROR: Unsupported platform/arch for pmtiles.");
        process.exit(1);
    }

    const baseUrl = `https://github.com/protomaps/go-pmtiles/releases/download/v${version}/`;
    return { 
        url: baseUrl + filename, 
        filename: filename, 
        isZip: filename.endsWith('.zip'),
        isTarGz: filename.endsWith('.tar.gz')
    };
}

// --- Install PMTILES TOOL ---
async function installPmtiles() {
    const scriptsDir = path.join(__dirname, 'scripts');
    
    // Ensure scripts directory exists
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    const finalExeName = os.platform() === 'win32' ? 'pmtiles.exe' : 'pmtiles';
    const finalExePath = path.join(scriptsDir, finalExeName);

    // Check if already installed
    if (fs.existsSync(finalExePath)) {
        console.log(`[OK] ${finalExeName} is already installed.`);
        return scriptsDir;
    }

    console.log("Checking for latest pmtiles version...");
    let version;
    try {
        version = await getLatestPmtilesVersion();
        console.log(`Latest version is: ${version}`);
    } catch (e) {
        console.error("Failed to check latest version:", e.message);
        process.exit(1);
    }

    const targetInfo = getPmtilesUrl(version);
    const downloadPath = path.join(scriptsDir, targetInfo.filename);

    console.log(`Downloading ${targetInfo.filename}...`);
    await downloadFileWithRedirects(targetInfo.url, downloadPath);
    console.log("Extracting pmtiles...");

    try {
        // Try to load adm-zip
        let AdmZip;
        try {
            AdmZip = require('adm-zip');
        } catch (e) {
            console.log("adm-zip not found, trying to install it...");
            try {
                execSync('npm install adm-zip', { 
                    cwd: __dirname,
                    stdio: 'inherit',
                    windowsHide: true 
                });
                AdmZip = require('adm-zip');
            } catch (installError) {
                console.error("Failed to install adm-zip:", installError.message);
                console.log("Trying alternative extraction method...");
                
                // Fallback extraction method
                await extractWithNativeTools(downloadPath, scriptsDir, finalExeName, targetInfo);
                if (fs.existsSync(finalExePath)) {
                    console.log(`[OK] pmtiles installed using native tools`);
                    return scriptsDir;
                }
                throw new Error("Could not extract pmtiles");
            }
        }

        if (targetInfo.isZip) {
            const zip = new AdmZip(downloadPath);
            zip.extractAllTo(scriptsDir, true);
            
            // Find and rename to standard name
            const files = fs.readdirSync(scriptsDir);
            for (const file of files) {
                const filePath = path.join(scriptsDir, file);
                const stat = fs.statSync(filePath);
                
                if (!stat.isDirectory()) {
                    // Look for pmtiles executable
                    if ((os.platform() === 'win32' && file === 'pmtiles.exe') || 
                        (os.platform() !== 'win32' && file === 'pmtiles') ||
                        file.startsWith('pmtiles') && !file.endsWith('.zip') && !file.endsWith('.tar.gz')) {
                        
                        if (file !== finalExeName) {
                            fs.renameSync(filePath, finalExePath);
                        }
                        break;
                    }
                }
            }
        } else if (targetInfo.isTarGz) {
            // For tar.gz files on Unix systems
            execSync(`tar -xzf "${downloadPath}" -C "${scriptsDir}"`, { stdio: 'pipe' });
            
            // Find and rename
            const files = fs.readdirSync(scriptsDir);
            for (const file of files) {
                const filePath = path.join(scriptsDir, file);
                const stat = fs.statSync(filePath);
                
                if (!stat.isDirectory() && 
                    (file === 'pmtiles' || file.startsWith('pmtiles')) &&
                    !file.endsWith('.tar.gz')) {
                    
                    if (file !== finalExeName) {
                        fs.renameSync(filePath, finalExePath);
                    }
                    break;
                }
            }
        }
        
        // Cleanup
        try { 
            fs.unlinkSync(downloadPath); 
            console.log("Cleaned up downloaded archive");
        } catch(e) {}
        
        // Remove unnecessary files
        const cleanupFiles = ['LICENSE', 'README.md', 'CHANGELOG.md'];
        cleanupFiles.forEach(file => {
            const filePath = path.join(scriptsDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        
        // Make executable on Unix systems
        if (os.platform() !== 'win32') {
            fs.chmodSync(finalExePath, '755');
        }
        
        console.log(`[OK] pmtiles installed to ${scriptsDir}`);
        return scriptsDir;
        
    } catch (err) {
        console.error("Error installing pmtiles:", err.message);
        
        // Ultimate fallback: Provide instructions
        console.log("\n--- MANUAL INSTALLATION REQUIRED ---");
        console.log("Please download pmtiles manually from:");
        console.log("https://github.com/protomaps/go-pmtiles/releases");
        console.log(`For your system (${os.platform()} ${os.arch()}), download the appropriate file.`);
        console.log(`Extract it and place the 'pmtiles${os.platform() === 'win32' ? '.exe' : ''}' file in:`);
        console.log(scriptsDir);
        console.log("Then run this installer again.\n");
        process.exit(1);
    }
}

// Native tools fallback extraction
async function extractWithNativeTools(downloadPath, destDir, finalExeName, targetInfo) {
    const platform = os.platform();
    
    if (platform === 'win32' && targetInfo.isZip) {
        // Use PowerShell on Windows
        try {
            execSync(`powershell -Command "Expand-Archive -Path '${downloadPath}' -DestinationPath '${destDir}' -Force"`, {
                stdio: 'pipe',
                windowsHide: true
            });
            return true;
        } catch (error) {
            console.log("PowerShell extraction failed");
            return false;
        }
    } else if (targetInfo.isTarGz) {
        // Use tar on Unix
        try {
            execSync(`tar -xzf "${downloadPath}" -C "${destDir}"`, { stdio: 'pipe' });
            return true;
        } catch (error) {
            console.log("tar extraction failed");
            return false;
        }
    }
    return false;
}

// 1. Find path to cities/data
function getGameDataPath() {
    const platform = os.platform();
    let appDataPath;

    if (platform === 'win32') {
        // Windows: %APPDATA%/metro-maker4
        appDataPath = process.env.APPDATA;
    } else if (platform === 'darwin') {
        // Mac: ~/Library/Application Support/metro-maker4
        appDataPath = path.join(os.homedir(), 'Library', 'Application Support');
    } else {
        // Linux (Fallback): ~/.config/metro-maker4
        appDataPath = path.join(os.homedir(), '.config');
    }

    if (!appDataPath) {
        console.error("ERROR: Couldn't find AppData/Home directory.");
        process.exit(1);
    }

    return path.join(appDataPath, GAME_FOLDER_NAME);
}

// 2. Find source folder ( where the.gz files are now?)
function findSourceDataFolder(startDir) {
    // Check directly in 'data' folder first
    const directPath = path.join(startDir, 'data');
    if (fs.existsSync(directPath) && fs.lstatSync(directPath).isDirectory()) {
        return directPath;
    }

    // If user have unzipped CITY.zip to a CITY folder (CITY/CITY/data)
    const subdirs = fs.readdirSync(startDir).filter(file => {
        return fs.lstatSync(path.join(startDir, file)).isDirectory();
    });

    for (const subdir of subdirs) {
        const nestedPath = path.join(startDir, subdir, 'data');
        if (fs.existsSync(nestedPath) && fs.lstatSync(nestedPath).isDirectory()) {
            console.log(`Found data in folder: ${subdir}/data`);
            return nestedPath;
        }
    }

    return null;
}

// Function to create a portable serve.bat
function createServeBatch(baseDir) {
    const scriptsDir = path.join(baseDir, 'scripts');
    let batContent;
    let fext;
    // We create a batch file that hardcodes the path to the scripts folder.
    // This allows the user to move the .bat file anywhere (Desktop, etc.)
    if (os.platform() === 'win32') {
        // Windows: powershell
        fext = '.bat';
        batContent = `@echo off
title PMTiles Server (${DISPLAY_NAME})
echo Starting map server...
echo This window must remain open while playing.
echo.
cd /d "${scriptsDir}"
.\\pmtiles.exe serve . --port 8081 --cors=*
if %errorlevel% neq 0 (
    echo.
    echo Error: Could not start pmtiles.exe
    pause
)
`;
    } else {
        // Unix: shell script
        fext = '.sh';
        batContent = `#!/usr/bin/env sh

echo "Starting map server..."
echo "This window must remain open while playing."
echo

# Navigate to the script directory
cd "${scriptsDir}"

# Run pmtiles (Linux/macOS binary assumed to be named 'pmtiles')
./pmtiles serve . --port 8081 --cors="*"
status=$?

if [ $status -ne 0 ]; then
    echo
    echo "Error: Could not start pmtiles"
    # macOS/Linux equivalent of 'pause'
    read -r -p "Press Enter to exit..."
fi
`;
    }
    const batPath = path.join(baseDir, `serve${fext}`);
    try {
        fs.writeFileSync(batPath, batContent);
        console.log(` [OK] Created portable serve${fext}`);
        console.log(`      (You can move this file to your Desktop if you want)`);
    } catch (err) {
        console.error(`Error: Could not create serve${fext}: ${err.message}`);
    }
}

async function install() {
    console.log(`--- Installing ${DISPLAY_NAME} Map Pack (Node.js) ---`);

    const gameDir = getGameDataPath();
    const currentDir = __dirname;
    const destDir = path.join(gameDir, 'cities', 'data', TARGET_FOLDER_NAME);

    // Find source
    const sourceDir = findSourceDataFolder(currentDir);
    
    if (!sourceDir) {
        console.error("ERROR: Couldn't find folder 'data' with the files.");
        console.error("Make sure you have all the files needed: roads.geojson.gz,");
		console.error("runways_taxiways.geojson.gz, ocean_depth_index.json.gz,");
		console.error("buildings_index.json.gz and demand_data.json.gz");
        process.exit(1);
    }

    // check if destination needs to be created
    if (!fs.existsSync(destDir)) {
        console.log(`Creating folder: ${destDir}`);
        fs.mkdirSync(destDir, { recursive: true });
    } else {
        console.log(`folder already exists: ${destDir}`);
    }

    console.log("\nCopying files...");
    let filesMoved = 0;

    for (const file of DATA_FILES) {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);

        if (fs.existsSync(srcPath)) {
            try {
                // copyFileSync overwrites files if they already exist
                fs.copyFileSync(srcPath, destPath);
                console.log(` [OK] ${file}`);
                filesMoved++;
            } catch (err) {
                console.error(`Error: Couldn't copy ${file}: ${err.message}`);
            }
        } else {
            console.warn(`Warning: Couldn't find ${file} in source folder.`);
        }
    }

    if (filesMoved === DATA_FILES.length) {
        console.log(`\nSUCCESS! All ${filesMoved} files got installed correctly.`);
    } else {
        console.log(`\nWARNING: Only ${filesMoved} of ${DATA_FILES.length} files got installed.`);
    }
    
	if (filesMoved === DATA_FILES.length) {
        console.log(`\nSUCCESS! All ${filesMoved} files were installed correctly.`);
    } else {
        console.log(`\nWARNING: Only ${filesMoved} of ${DATA_FILES.length} files were installed.`);
    }


    // --- Install PMTiles ---
    console.log("\nInstalling pmtiles...");
    const scriptsDir = await installPmtiles();
    
    // --- Create serve file ---
    console.log("\nCreating server script...");
    createServeBatch(currentDir, scriptsDir);
    // ----------------------------
    let fext;
    if (os.platform() === 'win32') {
        fext = '.bat'
    } else {
        fext = '.sh'
    }
    console.log(`\nYou can now start the 'serve${fext}' file (feel free to move it to your Desktop).`);
    console.log("Then start the game.");
}

try {
    install();
} catch (error) {
    console.error("An unexpected error occurred:", error);
}

// Keep the console open for 5 minutes so that the user has time to read the message (important for Windows)
// (Or until they kill the process)
setTimeout(() => {}, 300000);
