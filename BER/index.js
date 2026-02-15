// ============================================================================
// DRAGGABLE DEBUG PANEL
// ============================================================================
/*(function() {
    const debugBox = document.createElement('div');
    debugBox.style.position = 'fixed';
    debugBox.style.top = '10px';
    debugBox.style.right = '10px';
    debugBox.style.width = '400px';
    debugBox.style.height = '600px';
    debugBox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    debugBox.style.color = '#00ff00';
    debugBox.style.fontFamily = 'monospace';
    debugBox.style.fontSize = '12px';
    debugBox.style.padding = '10px';
    debugBox.style.overflowY = 'auto';
    debugBox.style.zIndex = '99999';
    debugBox.style.border = '2px solid #00ff00';
    debugBox.style.cursor = 'move';
    debugBox.style.resize = 'both';
    
    const header = document.createElement('div');
    header.style.padding = '5px';
    header.style.backgroundColor = '#222';
    header.style.borderBottom = '1px solid #00ff00';
    header.style.cursor = 'move';
    header.innerText = 'CPH Mod Debugger';
    
    const content = document.createElement('div');
    content.style.height = 'calc(100% - 30px)';
    content.style.overflowY = 'auto';
    
    debugBox.appendChild(header);
    debugBox.appendChild(content);
    document.body.appendChild(debugBox);

    let isDragging = false;
    let initialX, initialY;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - debugBox.offsetLeft;
        initialY = e.clientY - debugBox.offsetTop;
        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            const currentX = e.clientX - initialX;
            const currentY = e.clientY - initialY;
            
            debugBox.style.left = currentX + 'px';
            debugBox.style.top = currentY + 'px';
            debugBox.style.right = 'auto';
        }
    }

    function dragEnd() { isDragging = false; }

    const originalLog = console.log;
    const originalError = console.error;

    function logToScreen(msg, type = 'INFO') {
        const line = document.createElement('div');
        const time = new Date().toLocaleTimeString();
        line.innerText = `[${time}] [${type}] ${msg}`;
        if (type === 'ERROR') line.style.color = '#ff4444';
        content.appendChild(line);
        content.scrollTop = content.scrollHeight;
    }
    
    console.log = function(...args) { logToScreen(args.join(' '), 'LOG'); originalLog.apply(console, args); };
    console.error = function(...args) { logToScreen(args.join(' '), 'ERROR'); originalError.apply(console, args); };
})();
*/
// ============================================================================
// MOD INITIALIZATION
// ============================================================================

function waitForAPI() {
    return new Promise((resolve) => {
        function check() {
            if (window.SubwayBuilderAPI) resolve(window.SubwayBuilderAPI);
            else setTimeout(check, 500);
        }
        check();
    });
}

async function initMod() {
    try {
        console.log("Starting BER mod initialization...");
        const api = await waitForAPI();
        // 1. REGISTER CITIES
        api.registerCity({
            name: "Berlin",
            code: "BER",
            description: "Germanys Capital. You can basically locate it from everywhere in Germany as its TV Tower is so tall.",
            population: 3700000,
            initialViewState: {
                zoom: 13.5,
                latitude: 52.52,
                longitude: 13.405,
                bearing: 0
            },
            minZoom: 8,
            maxZoom: 17
        });


        // 2. CONFIGURE THE MAP (HYBRID)
        // Remember pmtiles.exe NEEDS to run on port 8081
        const mapServerUrl = 'http://127.0.0.1:8081'; 
        
        if (api.map.setTileURLOverride) {

            api.map.setTileURLOverride({
                cityCode: 'BER',
                
                // VISUAL Local PMTiles
                tilesUrl: `${mapServerUrl}/BER/{z}/{x}/{y}.mvt`,
                tileType: 'vector', 
                
                // FUNDAMENTAL: CartoDB (Doesn't block the game)
                foundationTilesUrl: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                
                maxZoom: 17,
                minZoom: 8
            });
            console.log("Map config: PMTiles (Local) + CartoDB (Foundation)");
        }

        // 3. LAYER VISIBILITY
        if (api.hooks && api.hooks.onCityLoad) {
            api.hooks.onCityLoad((cityCode) => {

                if (cityCode === 'BER') {
                    if (api.map.setDefaultLayerVisibility) {
                        api.map.setDefaultLayerVisibility('BER', {
                            buildingFoundations: false,
                            oceanFoundations: false, 
                            trackElevations: true
                        });
                    }
                    api.ui.showNotification('Berlin loaded successfully!', 'success');
                }
            });
        }

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
    }
}

console.log("BER mod loading...");
setTimeout(() => { initMod(); }, 100);
