pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const i18n = {
        en: {
            help: "",
            btnScale: "Scale", btnSetScale: "Confirm", btnMeasure: "Draw Cables",
            btnNewCable: "New Cable", btnConnect: "Connect", btnDelete: "Delete", selectPort: "Select Port", statConnect: "Click Device A, then Device B to link ports", btnUndo: "Undo", btnClear: "Clear All", btnExport: "Export PDF", btnExportPlan: "Save .plan",
            sideTitle: "Devices",
            statLoad: "Load a PDF or Image floorplan!",
            statLoaded: "Loaded. Click 'Scale' to begin!",
            statScale: "Click both ends of a known wall! (Draggable)",
            statSetScale: "Adjust points, then click 'Confirm'!",
            statScaleSaved: "Scale saved! Click 'Draw Cables' or drag devices.",
            statScaleInvalid: "Invalid value. Try again!",
            statMeasure: "Click along the path! Use 'New Cable' for a new line.",
            statEditCable: "Editing Cable #{0}...",
            statScaleChanged: "Scale changed! You must click 'Confirm' again.",
            promptMeter: "How many meters is this line in reality? (e.g. 12.34)",
            confirmClear: "Are you sure you want to clear all data (cables & devices)?",
            textActive: "Active (#{0})", textTotal: "Total",
            statPlaceDevice: "Click/Tap on the map to place the device: {0}",
            ctxRename: "Rename", ctxDelete: "Delete Device", ctxDeletePoint: "Delete Point",
            promptRename: "Enter a new name for this device:"
        },
        hu: {
            help: "",
            btnScale: "Méretarány", btnSetScale: "Véglegesítés", btnMeasure: "Kábelezés",
            btnNewCable: "Új kábel", btnConnect: "Összekötés", btnDelete: "Törlés", selectPort: "Válassz Portot", statConnect: "Kattints az A eszközre, majd a B eszközre", btnUndo: "Vissza", btnClear: "Minden törlése", btnExport: "PDF Export", btnExportPlan: "Mentés .plan",
            sideTitle: "Eszközök",
            statLoad: "Tölts be egy PDF-et vagy képet!",
            statLoaded: "Betöltve. Kattints a 'Méretarány' gombra!",
            statScale: "Kattints a fal két végére! (A pontok húzhatók)",
            statSetScale: "Igazítsd a helyére, majd kattints a 'Véglegesítés' gombra!",
            statScaleSaved: "Méretarány mentve! Kattints a 'Kábelezés' gombra vagy húzz be eszközöket.",
            statScaleInvalid: "Érvénytelen érték. Próbáld újra!",
            statMeasure: "Kattints a kábel útján! Új kábelhez: 'Új kábel'.",
            statEditCable: "Kábel #{0} szerkesztése...",
            statScaleChanged: "Megváltoztattad a méretarányt! Kattints újra a 'Véglegesítés' gombra.",
            promptMeter: "Hány méter ez a szakasz a valóságban? (Pl. 12.34)",
            confirmClear: "Biztosan törölsz minden kábelt és eszközt?",
            textActive: "Aktuális (#{0})", textTotal: "Összesen",
            statPlaceDevice: "Kattints/Koppints a térképre az eszköz elhelyezéséhez: {0}",
            ctxRename: "Átnevezés", ctxDelete: "Eszköz Törlése", ctxDeletePoint: "Pont Törlése",
            promptRename: "Add meg az eszköz új nevét:"
        }
    };

    let lang = 'en';
    let theme = 'light';
    function t(key, arg1 = "") { return i18n[lang][key].replace("{0}", arg1); }

    const btnScale = document.getElementById('btn-scale'), btnSetScale = document.getElementById('btn-set-scale');
    const btnMeasure = document.getElementById('btn-measure'), btnNewCable = document.getElementById('btn-new-cable'), btnConnect = document.getElementById('btn-connect'), btnDelete = document.getElementById('btn-delete'), selectCableType = document.getElementById('cable-type-select');
    const CABLE_TYPES = { 'default': { color: '#f5bde6', name: 'Default' }, 'cat5e': { color: '#8aadf4', name: 'Cat5e' }, 'cat6': { color: '#a6da95', name: 'Cat6' }, 'cat6a': { color: '#c6a0f6', name: 'Cat6a' }, 'fiber': { color: '#f5a97f', name: 'Fiber' }, 'power': { color: '#ed8796', name: 'Power' } };
    const btnUndo = document.getElementById('btn-undo'), btnClear = document.getElementById('btn-clear');
    const btnExport = document.getElementById('btn-export'), btnExportPlan = document.getElementById('btn-export-plan'), status = document.getElementById('status');
    const measurements = document.getElementById('measurements'), canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
    const contextMenu = document.getElementById('context-menu');

    const cableColors = ['#ed8796', '#8aadf4', '#a6da95', '#eed49f', '#c6a0f6', '#8bd5ca', '#f5bde6'];
    const deviceColors = { router: '#c6a0f6', switch: '#8bd5ca', patch: '#f5bde6', ap: '#eed49f', pc: '#8caaee', rack: '#7c7f93' };
    const deviceShortnames = { router: 'RT', switch: 'SW', patch: 'PP', ap: 'AP', pc: 'PC', rack: 'RACK' };

    let img = new Image();
    let mode = 'none', connectState = { devA: null, portA: null }, scalePoints = [], cables = [{ type: 'cat6', points: [] }], devices = [], actionHistory = [], redoHistory = [], isUndoingOrRedoing = false; 
    let activeCableIndex = 0, pixelsPerMeter = null;
    let showLayers = true, snapToGrid = false;
    let gridOffsetX = 0, gridOffsetY = 0;

    let cameraX = 0, cameraY = 0, zoom = 1, isPanning = false, panStartX = 0, panStartY = 0;
    let isPanningGrid = false, gridPanStartX = 0, gridPanStartY = 0;
    let draggedPoint = null, activePlaceDevice = null, activeContextMenuTarget = null, hasDragged = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let lastPinchDistance = null;
    let lastPinchCenter = null;
    
    // ponytail: Removed custom crosshair variables

    // --- TÉMA ÉS NYELV ---
    document.getElementById('btn-theme').addEventListener('click', () => {
        theme = theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        document.getElementById('theme-text').innerText = theme === 'light' ? 'Dark' : 'Light';
        redraw();
    });

    function updateLanguageUI() {
        document.getElementById('help-text').innerText = t('help');
        document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = t(el.getAttribute('data-i18n')));
        if (!img.src) // status.innerText = t('statLoad');
        redraw();
    }
    document.getElementById('lang-select').addEventListener('change', e => { lang = e.target.value; updateLanguageUI(); });

    // ponytail: Removed drag-and-drop code, using click-to-place exclusively
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            if(!img.src) return;
            if (activePlaceDevice === item.dataset.type) {
                activePlaceDevice = null; item.classList.remove('active-place'); // status.innerText = t('statScaleSaved');
            } else {
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active-place'));
                activePlaceDevice = item.dataset.type; item.classList.add('active-place'); mode = 'none';
                btnScale.classList.remove('active'); btnMeasure.classList.remove('active'); btnConnect.classList.remove('active'); btnNewCable.classList.remove('active'); btnDelete.classList.remove('active'); document.getElementById('canvas-container').classList.remove('delete-mode');
                // status.innerText = t('statPlaceDevice', item.dataset.type.toUpperCase());
            }
        });
    });

    // --- FÁJL BETÖLTÉS ÉS GOMBOK ---
    function resizeCanvas() { canvas.width = canvasContainer.clientWidth; canvas.height = canvasContainer.clientHeight; redraw(); }
    window.addEventListener('resize', resizeCanvas);

    function restoreState(data, resetCamera) {
        scalePoints = data.scalePoints || [];
        let loadedCables = data.cables || [{ type: 'cat6', points: [] }];
        cables = loadedCables.map(c => Array.isArray(c) ? { type: 'default', points: c } : c);
        devices = data.devices || [];
        devices.forEach(d => { if (!d.id) d.id = Math.random().toString(36).substr(2, 9); });
        pixelsPerMeter = data.pixelsPerMeter || null;
        gridOffsetX = data.gridOffsetX || 0;
        gridOffsetY = data.gridOffsetY || 0;
        activeCableIndex = cables.length - 1;
        btnScale.disabled = false; btnExport.disabled = false; btnExportPlan.disabled = false; btnUndo.disabled = false;
        btnMeasure.disabled = btnNewCable.disabled = btnConnect.disabled = btnDelete.disabled = btnClear.disabled = selectCableType.disabled = (pixelsPerMeter === null);
        if (resetCamera) {
            zoom = data.zoom || Math.min(canvas.width/img.width, canvas.height/img.height) * 0.95;
            cameraX = (data.cameraX !== undefined) ? data.cameraX : (canvas.width - img.width * zoom) / 2;
            cameraY = (data.cameraY !== undefined) ? data.cameraY : (canvas.height - img.height * zoom) / 2;
        }
        // status.innerText = t('statLoaded');
        redraw();
        const uploadGrp = document.getElementById('upload-group');
        if (uploadGrp) uploadGrp.style.display = 'none';
    }

    document.getElementById('upload').addEventListener('change', e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        if (file.name.endsWith('.json') || file.name.endsWith('.plan')) {
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.imgSrc) { img.onload = () => { resizeCanvas(); restoreState(data, true); }; img.src = data.imgSrc; }
                } catch (err) { alert('Error loading JSON data'); }
            };
            reader.readAsText(file);
        } else if (file.type === 'application/pdf') {
            reader.onload = event => {
                pdfjsLib.getDocument(new Uint8Array(event.target.result)).promise.then(pdf => pdf.getPage(1)).then(page => {
                    const vp = page.getViewport({scale: 2.0}), tc = document.createElement('canvas'), tctx = tc.getContext('2d');
                    tc.width = vp.width; tc.height = vp.height;
                    page.render({canvasContext: tctx, viewport: vp}).promise.then(() => loadImageData(tc.toDataURL('image/png')));
                });
            }; reader.readAsArrayBuffer(file);
        } else {
            reader.onload = ev => loadImageData(ev.target.result); reader.readAsDataURL(file);
        }
    });

    function loadImageData(src) {
        img.onload = () => {
            resizeCanvas();
            scalePoints = []; cables = [{ type: selectCableType.value || 'cat6', points: [] }]; devices = []; actionHistory = []; redoHistory = []; activeCableIndex = 0; pixelsPerMeter = null; mode = 'none';
            zoom = Math.min(canvas.width/img.width, canvas.height/img.height) * 0.95;
            cameraX = (canvas.width - img.width * zoom) / 2; cameraY = (canvas.height - img.height * zoom) / 2;
            btnScale.disabled = false; btnExport.disabled = false; btnExportPlan.disabled = false; btnUndo.disabled = false;
            // status.innerText = t('statLoaded'); redraw();
            const uploadGrp = document.getElementById('upload-group');
            if (uploadGrp) uploadGrp.style.display = 'none';
        }; img.src = src;
    }

    // --- ZOOM ÉS EGÉR KOORDINÁTÁK ---
    canvasContainer.addEventListener('wheel', e => {
        if (!img.src) return;
        e.preventDefault();
        const zFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        const wx = (mx - cameraX) / zoom, wy = (my - cameraY) / zoom;
        zoom = Math.max(0.05, Math.min(zoom * zFactor, 15));
        cameraX = mx - wx * zoom; cameraY = my - wy * zoom; 
        redraw();
    }, {passive: false});

    function getWorldPos(e) {
        const r = canvas.getBoundingClientRect(), cx = e.clientX || (e.touches && e.touches[0].clientX) || 0, cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        return { x: ((cx - r.left) - cameraX) / zoom, y: ((cy - r.top) - cameraY) / zoom };
    }

    function getDeviceDrawPos(index) {
        const d = devices[index];
        if (!d) return { x: 0, y: 0 };
        
        let stackedRack = null;
        if (d.type !== 'rack') {
            for (let i = 0; i < devices.length; i++) {
                if (devices[i].type === 'rack' && Math.abs(devices[i].x - d.x) < 1 && Math.abs(devices[i].y - d.y) < 1) {
                    stackedRack = devices[i];
                    break;
                }
            }
        }

        if (d.type === 'rack') {
            return { x: d.x, y: d.y };
        }

        let stackIndex = 0;
        for (let i = 0; i < index; i++) {
            if (devices[i].type !== 'rack' && Math.abs(devices[i].x - d.x) < 1 && Math.abs(devices[i].y - d.y) < 1) {
                stackIndex++;
            }
        }

        if (stackedRack) {
            const rh = stackedRack.height || 110;
            return { x: d.x, y: d.y - rh/2 + 15 + (stackIndex * 16) };
        } else {
            return { x: d.x, y: d.y + (stackIndex * 20) / zoom };
        }
    }

    function findHoveredPoint(wPos) {
        const hit = 18 / zoom;
        for (let i = devices.length - 1; i >= 0; i--) {
            const pos = getDeviceDrawPos(i);
            const d = devices[i];
            
            if (d.type === 'rack') {
                const rw = d.width || 50;
                const rh = d.height || 110;
                if (wPos.x >= pos.x - rw/2 && wPos.x <= pos.x + rw/2 && wPos.y >= pos.y - rh/2 && wPos.y <= pos.y + rh/2) {
                    return { array: devices, index: i, type: 'device' };
                }
            } else {
                let stackedRack = null;
                for (let j = 0; j < devices.length; j++) {
                    if (devices[j].type === 'rack' && Math.abs(devices[j].x - d.x) < 1 && Math.abs(devices[j].y - d.y) < 1) {
                        stackedRack = devices[j];
                        break;
                    }
                }
                if (stackedRack) {
                    const rw = stackedRack.width || 50;
                    const uw = rw - 10;
                    const uh = 14;
                    if (wPos.x >= pos.x - uw/2 && wPos.x <= pos.x + uw/2 && wPos.y >= pos.y - uh/2 && wPos.y <= pos.y + uh/2) {
                        return { array: devices, index: i, type: 'device' };
                    }
                }
            }
            if (Math.hypot(pos.x - wPos.x, pos.y - wPos.y) < hit) return { array: devices, index: i, type: 'device' };
        }
        for (let i = 0; i < scalePoints.length; i++) if (Math.hypot(scalePoints[i].x - wPos.x, scalePoints[i].y - wPos.y) < hit) return { array: scalePoints, index: i, type: 'scale' };
        for (let c = cables.length - 1; c >= 0; c--) for (let i = 0; i < cables[c].points.length; i++) if (Math.hypot(cables[c].points[i].x - wPos.x, cables[c].points[i].y - wPos.y) < hit) return { array: cables[c].points, index: i, type: 'cable', cableIndex: c };
        return null;
    }

    // --- CONTEXT MENU (JOBB KLIKK) ---
    window.addEventListener('contextmenu', e => {
        e.preventDefault(); 
        contextMenu.style.display = 'none';
        if (!img.src || !e.target.closest('#canvas-container') || hasDragged) return;

        const hov = findHoveredPoint(getWorldPos(e));
        activeContextMenuTarget = hov;

        document.getElementById('ctx-rename').style.display = 'none';
        document.getElementById('ctx-delete-device').style.display = 'none';
        document.getElementById('ctx-delete-point').style.display = 'none';

        if (hov && hov.type === 'device') {
            document.getElementById('ctx-rename').style.display = 'flex';
            document.getElementById('ctx-delete-device').style.display = 'flex';
        } else if (hov && (hov.type === 'cable' || hov.type === 'scale')) {
            document.getElementById('ctx-delete-point').style.display = 'flex';
        }
        
        contextMenu.style.display = 'flex';
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';
    });

    window.addEventListener('click', e => {
        if (!e.target.closest('#context-menu')) contextMenu.style.display = 'none';
    });

    document.getElementById('ctx-rename').addEventListener('click', () => {
        contextMenu.style.display = 'none';
        if (activeContextMenuTarget && activeContextMenuTarget.type === 'device') {
            const d = devices[activeContextMenuTarget.index];
            const newName = prompt(t('promptRename'), d.name || deviceShortnames[d.type]);
            if (newName !== null) { d.name = newName.trim() === "" ? null : newName; redraw(); autoSave(); }
        }
    });

    document.getElementById('ctx-delete-device').addEventListener('click', () => {
        contextMenu.style.display = 'none';
        if (activeContextMenuTarget && activeContextMenuTarget.type === 'device') { 
            devices.splice(activeContextMenuTarget.index, 1); 
            redraw(); 
            autoSave();
        }
    });

    document.getElementById('ctx-delete-point').addEventListener('click', () => {
        contextMenu.style.display = 'none';
        if (activeContextMenuTarget) {
            if (activeContextMenuTarget.type === 'cable') {
                cables[activeContextMenuTarget.cableIndex].points.splice(activeContextMenuTarget.index, 1);
            } else if (activeContextMenuTarget.type === 'scale') {
                scalePoints.splice(activeContextMenuTarget.index, 1);
                pixelsPerMeter = null; btnSetScale.disabled = true; btnScale.classList.add('active'); mode = 'scale';
            }
            redraw();
            autoSave();
        }
    });

    document.getElementById('ctx-undo').addEventListener('click', () => {
        contextMenu.style.display = 'none';
        if (!btnUndo.disabled) btnUndo.dispatchEvent(new MouseEvent('click'));
    });

    // --- KEYBOARD SHORTCUTS ---
    window.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) {
            return;
        }
        if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            if (!btnUndo.disabled) btnUndo.click();
        } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            performRedo();
        } else if (e.key === 'Delete') {
            e.preventDefault();
            if (!btnDelete.disabled) btnDelete.click();
        } else if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            mode = 'none';
            btnScale.classList.remove('active');
            btnMeasure.classList.remove('active');
            btnConnect.classList.remove('active');
            btnNewCable.classList.remove('active');
            btnDelete.classList.remove('active');
            document.getElementById('canvas-container').classList.remove('delete-mode');
            hidePortPopup();
            redraw();
        }
    });

    // --- SWITCH PANEL LOGIC ---
    let switchModalDevice = null;
    let swSelectedPort = null;

    function getDefaultPortCount(type) {
        if (type === 'switch' || type === 'patch' || type === 'patchpanel') return 24;
        if (type === 'router') return 4;
        return 1;
    }

    function openSwitchModal(device) {
        switchModalDevice = device;
        if (!device.ports) device.ports = {};
        if (!device.portCount) device.portCount = getDefaultPortCount(device.type);
        swSelectedPort = null;
        
        let titleType = device.type.charAt(0).toUpperCase() + device.type.slice(1);
        if (device.type === 'patch') titleType = 'Patch Panel';
        if (device.type === 'patchpanel') titleType = 'Patch Panel';
        if (device.type === 'rack') titleType = 'Rack Cabinet';
        
        const sideIcon = document.querySelector(`.sidebar-item[data-type="${device.type === 'patchpanel' ? 'patch' : device.type}"] svg`);
        if (sideIcon) {
            document.getElementById('sw-modal-icon').outerHTML = sideIcon.outerHTML.replace('width:24px; height:24px;', 'width:20px;height:20px').replace('class="icon"', 'id="sw-modal-icon" class="icon"');
        }
        
        if (device.type === 'rack') {
            document.getElementById('sw-modal-title').textContent = device.name || titleType;
            document.getElementById('sw-f-port-count').parentElement.style.display = 'none';
            document.getElementById('sw-faceplate').style.display = 'none';
            document.getElementById('sw-editor-placeholder').style.display = 'none';
            document.getElementById('sw-port-editor').style.display = 'none';
            const rackInfo = document.getElementById('sw-rack-info');
            
            rackInfo.innerHTML = (lang === 'hu' ? 'Ez egy rack szekrény. Állítsd be a méretét, és helyezz el eszközöket azonos pozícióban a térképen.' : 'This is a rack cabinet. Set its size below and stack other devices inside.') + 
                '<div style="margin-top: 20px; display: flex; gap: 15px; justify-content: center; align-items: center;">' +
                '<label style="font-weight:bold; color:var(--text);">Width:</label><input type="number" id="rack-width" value="' + (device.width || 50) + '" style="width:70px; padding:6px; border-radius:4px; border:1px solid var(--border); background:var(--panel); color:var(--text);">' +
                '<label style="font-weight:bold; color:var(--text);">Height:</label><input type="number" id="rack-height" value="' + (device.height || 110) + '" style="width:70px; padding:6px; border-radius:4px; border:1px solid var(--border); background:var(--panel); color:var(--text);">' +
                '</div>';
                
            rackInfo.style.display = 'block';
            document.getElementById('sw-btn-clear-port').style.display = 'none';
            document.getElementById('switch-modal-overlay').classList.add('open');
            
            document.getElementById('rack-width').addEventListener('change', e => { 
                switchModalDevice.width = parseFloat(e.target.value) || 50; 
                redraw(); autoSave(); 
            });
            document.getElementById('rack-height').addEventListener('change', e => { 
                switchModalDevice.height = parseFloat(e.target.value) || 110; 
                redraw(); autoSave(); 
            });
            return;
        } else {
            document.getElementById('sw-f-port-count').parentElement.style.display = 'flex';
            document.getElementById('sw-faceplate').style.display = 'block';
            document.getElementById('sw-rack-info').style.display = 'none';
            document.getElementById('sw-btn-clear-port').style.display = 'inline-flex';
        }

        document.getElementById('sw-modal-title').textContent = device.name || titleType;
        document.getElementById('sw-f-port-count').value = device.portCount;
        
        buildSwitchFaceplate(device);
        showSwEditor(null);
        document.getElementById('switch-modal-overlay').classList.add('open');
    }

    function buildSwitchFaceplate(device) {
        const portCount = device.portCount;
        const ledRow = document.getElementById('sw-port-leds');
        ledRow.innerHTML = '';
        for (let p = 1; p <= portCount; p++) {
            const led = document.createElement('div');
            led.className = 'sw-port-led';
            led.textContent = p;
            led.dataset.port = p;
            const cfg = device.ports[p];
            if (cfg && (cfg.label || cfg.vlan || cfg.conn || cfg.mode !== 'access')) led.classList.add('has-config');
            led.addEventListener('click', () => selectSwPort(p, device));
            ledRow.appendChild(led);
        }
    }

    function selectSwPort(portNum, device) {
        swSelectedPort = portNum;
        document.querySelectorAll('.sw-port-led').forEach(el => el.classList.toggle('selected', +el.dataset.port === portNum));
        showSwEditor(portNum, device);
    }

    // [id, stateKey, defaultVal]
    const SW_FIELDS = [
        ['sw-f-label', 'label', ''],
        ['sw-f-vlan',  'vlan',  ''],
        ['sw-f-mode',  'mode',  'access'],
        ['sw-f-conn',  'conn',  ''],
        ['sw-f-notes', 'notes', '']
    ];

    function showSwEditor(portNum, device) {
        const ph = document.getElementById('sw-editor-placeholder');
        const ed = document.getElementById('sw-port-editor');
        if (portNum === null) { ph.style.display = ''; ed.style.display = 'none'; return; }
        ph.style.display = 'none'; ed.style.display = 'block';
        const cfg = (device || switchModalDevice).ports[portNum] || {};
        document.getElementById('sw-port-editor-title').textContent = `Port ${portNum}`;
        SW_FIELDS.forEach(([id, key, def]) => { document.getElementById(id).value = cfg[key] ?? def; });
    }

    function saveCurrentPortFields() {
        if (swSelectedPort === null || !switchModalDevice) return;
        const cfg = {};
        SW_FIELDS.forEach(([id, key]) => { cfg[key] = document.getElementById(id).value; });
        cfg.vlan = parseInt(cfg.vlan) || null;
        if (typeof cfg.label === 'string') cfg.label = cfg.label.trim();
        if (typeof cfg.conn  === 'string') cfg.conn  = cfg.conn.trim();
        if (typeof cfg.notes === 'string') cfg.notes = cfg.notes.trim();
        const isConfigured = !!(cfg.label || cfg.vlan || cfg.conn || cfg.notes || cfg.mode !== 'access');
        if (isConfigured) { switchModalDevice.ports[swSelectedPort] = cfg; }
        else { delete switchModalDevice.ports[swSelectedPort]; }
        const ledEl = document.querySelector(`.sw-port-led[data-port="${swSelectedPort}"]`);
        if (ledEl) ledEl.classList.toggle('has-config', isConfigured);
    }

    function closeSwModal() {
        saveCurrentPortFields();
        document.getElementById('switch-modal-overlay').classList.remove('open');
        autoSave(); redraw();
    }
    document.getElementById('switch-modal-close').addEventListener('click', closeSwModal);
    document.getElementById('sw-btn-save').addEventListener('click', closeSwModal);
    document.getElementById('sw-f-port-count').addEventListener('change', e => {
        if (!switchModalDevice) return;
        let count = parseInt(e.target.value);
        if (isNaN(count) || count < 1) count = 1;
        switchModalDevice.portCount = count;
        buildSwitchFaceplate(switchModalDevice);
        if (swSelectedPort > count) showSwEditor(null);
    });

    document.getElementById('sw-btn-clear-port').addEventListener('click', () => {
        if (swSelectedPort === null || !switchModalDevice) return;
        delete switchModalDevice.ports[swSelectedPort];
        showSwEditor(swSelectedPort, switchModalDevice);
        buildSwitchFaceplate(switchModalDevice);
    });

    SW_FIELDS.forEach(([id]) => {
        const el = document.getElementById(id);
        const save = () => { if (swSelectedPort !== null) saveCurrentPortFields(); };
        el.addEventListener('input', save);
        el.addEventListener('change', save);
    });

    // Close on overlay backdrop click
    document.getElementById('switch-modal-overlay').addEventListener('click', e => {
        if (e.target === document.getElementById('switch-modal-overlay')) {
            saveCurrentPortFields();
            document.getElementById('switch-modal-overlay').classList.remove('open');
            autoSave(); redraw();
        }
    });

    // --- EGÉR ÉS ÉRINTŐ ESEMÉNYEK ---
    function handleStart(e, isTouch) {
        if (!img.src || contextMenu.style.display === 'flex') return;
        const wPos = getWorldPos(e), hov = findHoveredPoint(wPos), btn = isTouch ? 0 : e.button;
        hasDragged = false;

        if (e.shiftKey && img.src) {
            isPanningGrid = true;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            gridPanStartX = clientX - gridOffsetX * zoom;
            gridPanStartY = clientY - gridOffsetY * zoom;
            return;
        }

        if (mode === 'connect') {
            if (hov && hov.type === 'device') {
                showPortPopup(hov.index, wPos.x, wPos.y);
            } else {
                hidePortPopup();
            }
            return;
        }

        if (mode === 'delete') {
            if (hov) {
                if (hov.type === 'device') {
                    const devId = devices[hov.index].id;
                    cables = cables.filter(c => c.fromDev !== devId && c.toDev !== devId);
                    devices.splice(hov.index, 1);
                } else if (hov.type === 'cable') {
                    cables[hov.cableIndex].points.splice(hov.index, 1);
                    if (cables[hov.cableIndex].points.length === 0 && !('fromDev' in cables[hov.cableIndex])) {
                        cables.splice(hov.cableIndex, 1);
                        if (cables.length === 0) cables.push({ type: selectCableType.value || 'cat6', points: [] });
                        activeCableIndex = cables.length - 1;
                    }
                } else if (hov.type === 'scale') {
                    scalePoints.splice(hov.index, 1);
                    pixelsPerMeter = null;
                    btnSetScale.disabled = true;
                    btnScale.classList.add('active');
                    mode = 'scale';
                    document.getElementById('canvas-container').classList.remove('delete-mode');
                    btnDelete.classList.remove('active');
                }
                redraw();
                autoSave();
            } else {
                for (let c = cables.length - 1; c >= 0; c--) {
                    let cableObj = cables[c];
                    let points = cableObj.points;
                    let fullCable = points;
                    if ('fromDev' in cableObj) {
                        let d1 = devices.find(d => d.id === cableObj.fromDev);
                        let d2 = devices.find(d => d.id === cableObj.toDev);
                        if (d1 && d2) fullCable = [{x: d1.x, y: d1.y}, ...points, {x: d2.x, y: d2.y}];
                    }
                    for (let i = 1; i < fullCable.length; i++) {
                        const p1 = fullCable[i-1], p2 = fullCable[i];
                        if (distToSegment(wPos, p1, p2) < 10 / zoom) {
                            cables.splice(c, 1);
                            if (cables.length === 0) cables.push({ type: selectCableType.value || 'cat6', points: [] });
                            activeCableIndex = cables.length - 1;
                            redraw();
                            autoSave();
                            return;
                        }
                    }
                }
            }
            return;
        }

        if (btn === 2 || btn === 1 || (btn === 0 && e.ctrlKey) || (!hov && mode === 'none' && !activePlaceDevice)) {
            isPanning = true; panStartX = (isTouch ? e.touches[0].clientX : e.clientX) - cameraX; panStartY = (isTouch ? e.touches[0].clientY : e.clientY) - cameraY;
            return;
        }

        // In measure/scale mode, don't intercept device clicks — let them add points normally.
        // Only grab devices as draggedPoints in 'none' mode (so they can be moved).
        if (hov) {
            if ((hov.type === 'device' && mode !== 'none') || activePlaceDevice) {
                // fall through to measure/scale point-adding or device placement logic below
            } else {
                draggedPoint = hov;
                const hovPos = hov.type === 'device' ? getDeviceDrawPos(hov.index) : hov.array[hov.index];
                dragOffsetX = hovPos.x - wPos.x;
                dragOffsetY = hovPos.y - wPos.y;
                if (hov.type === 'cable') { 
                    activeCableIndex = hov.cableIndex; 
                    // status.innerText = t('statEditCable', activeCableIndex + 1); 
                }
                redraw();
                return;
            }
        } else if (mode === 'none') {
            for (let c = cables.length - 1; c >= 0; c--) {
                let cableObj = cables[c];
                let points = cableObj.points;
                let fullCable = points;
                if ('fromDev' in cableObj) {
                    let d1 = devices.find(d => d.id === cableObj.fromDev);
                    let d2 = devices.find(d => d.id === cableObj.toDev);
                    if (d1 && d2) fullCable = [{x: d1.x, y: d1.y}, ...points, {x: d2.x, y: d2.y}];
                }
                for (let i = 1; i < fullCable.length; i++) {
                    const p1 = fullCable[i-1], p2 = fullCable[i];
                    if (distToSegment(wPos, p1, p2) < 10 / zoom) {
                        const insertIdx = ('fromDev' in cableObj) ? i - 1 : i;
                        cableObj.points.splice(insertIdx, 0, {x: wPos.x, y: wPos.y});
                        draggedPoint = { array: cableObj.points, index: insertIdx, type: 'cable', cableIndex: c };
                        activeCableIndex = c;
                        autoSave();
                        return;
                    }
                }
            }
        }

        if (activePlaceDevice && btn === 0) { 
            let p = applyGridSnap(wPos);
            devices.push({ type: activePlaceDevice, x: p.x, y: p.y, name: null }); 
            actionHistory.push({ type: 'device' });
            redraw(); 
            return; 
        }
        
        if (mode === 'scale' && scalePoints.length < 2) { 
            scalePoints.push(applyGridSnap(wPos)); 
            actionHistory.push({ type: 'scale' });
            if (scalePoints.length === 2) btnSetScale.disabled = false; 
            redraw(); 
        } 
        else if (mode === 'measure') { 
            cables[activeCableIndex].points.push(applyGridSnap(wPos)); 
            actionHistory.push({ type: 'cable', cableIndex: activeCableIndex });
            btnNewCable.classList.remove('active');
            redraw(); 
        }
    }

    // ponytail: Removed custom crosshair tracking and simplified touch events
    function handleMove(e, isTouch) {
        if (!img.src) return;

        if (isPanningGrid) {
            hasDragged = true;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            gridOffsetX = (clientX - gridPanStartX) / zoom;
            gridOffsetY = (clientY - gridPanStartY) / zoom;
            redraw();
            return;
        }

        if (isPanning) { 
            hasDragged = true;
            cameraX = (isTouch ? e.touches[0].clientX : e.clientX) - panStartX; cameraY = (isTouch ? e.touches[0].clientY : e.clientY) - panStartY; redraw(); return; 
        }
        
        if (draggedPoint) {
            hasDragged = true;
            let rawPos = getWorldPos(e);
            
            // Offset point above finger on touch devices to improve visibility
            if (isTouch) {
                rawPos.y -= 40 / zoom;
            }
            
            rawPos.x += dragOffsetX;
            rawPos.y += dragOffsetY;
            
            let pos = applyGridSnap(rawPos);
            
            if (draggedPoint.type === 'cable') {
                pos = getSnappedPos(pos);
            }
            draggedPoint.array[draggedPoint.index].x = pos.x; 
            draggedPoint.array[draggedPoint.index].y = pos.y;
            if (draggedPoint.type === 'scale' && pixelsPerMeter) { pixelsPerMeter = null; mode = 'scale'; btnScale.classList.add('active'); btnSetScale.disabled = false; }
        }
        redraw();
    }

    function handleEnd() {
        isPanning = false;
        isPanningGrid = false;
        // Single click (no drag) on a device → open device modal
        if (draggedPoint && !hasDragged && draggedPoint.type === 'device' && !activePlaceDevice && mode === 'none') {
            const dev = devices[draggedPoint.index];
            draggedPoint = null;
            redraw();
            openSwitchModal(dev);
            return;
        }
        if (draggedPoint || hasDragged) autoSave();
        draggedPoint = null;
        redraw();
    }

    canvasContainer.addEventListener('mousedown', e => handleStart(e, false));
    canvasContainer.addEventListener('mousemove', e => handleMove(e, false));
    window.addEventListener('mouseup', handleEnd);

    // Single-click on a switch device opens the switch panel modal (handled in handleEnd)

    canvasContainer.addEventListener('touchstart', e => { 
        if(e.touches.length === 1) {
            e.preventDefault(); 
            handleStart(e, true); 
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastPinchDistance = Math.hypot(dx, dy);
            lastPinchCenter = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2
            };
            isPanning = false; 
        }
    }, {passive: false});

    canvasContainer.addEventListener('touchmove', e => { 
        if(e.touches.length === 1) {
            e.preventDefault(); 
            handleMove(e, true); 
        } else if (e.touches.length === 2 && lastPinchDistance) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const zFactor = dist / lastPinchDistance;
            
            const r = canvas.getBoundingClientRect();
            const currentCenter = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2
            };

            const mxPrev = lastPinchCenter.x - r.left;
            const myPrev = lastPinchCenter.y - r.top;
            
            const wx = (mxPrev - cameraX) / zoom;
            const wy = (myPrev - cameraY) / zoom;
            
            const newZoom = Math.max(0.05, Math.min(zoom * zFactor, 15));
            
            const mxCurr = currentCenter.x - r.left;
            const myCurr = currentCenter.y - r.top;

            cameraX = mxCurr - wx * newZoom;
            cameraY = myCurr - wy * newZoom;
            zoom = newZoom;

            lastPinchDistance = dist;
            lastPinchCenter = currentCenter;
            
            redraw();
        }
    }, {passive: false});

    window.addEventListener('touchend', e => { 
        if (e.touches.length < 2) {
            lastPinchDistance = null;
            lastPinchCenter = null;
        }
        if (e.touches.length === 0) {
            handleEnd(); 
        }
    });

    function applyGridSnap(pos) {
        if (!snapToGrid) return pos;
        const gridSize = 20;
        return {
            x: Math.round((pos.x - gridOffsetX) / gridSize) * gridSize + gridOffsetX,
            y: Math.round((pos.y - gridOffsetY) / gridSize) * gridSize + gridOffsetY
        };
    }

    // Snapping helper
    function getSnappedPos(pos) {
        const snapDist = 15 / zoom;
        for (let i = devices.length - 1; i >= 0; i--) {
            const dPos = getDeviceDrawPos(i);
            if (Math.hypot(dPos.x - pos.x, dPos.y - pos.y) < snapDist) return { x: dPos.x, y: dPos.y };
        }
        for (let s of scalePoints) {
            if (Math.hypot(s.x - pos.x, s.y - pos.y) < snapDist) return { x: s.x, y: s.y };
        }
        return pos;
    }

    // Auto-save logic
    function autoSave() {
        if (!isUndoingOrRedoing) {
            redoHistory = [];
        }
        if (!img.src) return;
        const data = { scalePoints, cables, devices, pixelsPerMeter, zoom, cameraX, cameraY, gridOffsetX, gridOffsetY };
        if (img.src.length < 1500000) data.imgSrc = img.src;
        localStorage.setItem('measurer_workspace', JSON.stringify(data));
    }

    // Gombok logika & UNDO
    // ponytail: Replaced custom scale prompt modal with native window.prompt()
    btnSetScale.addEventListener('click', () => {
        if (scalePoints.length !== 2) return;
        const val = prompt(t('promptMeter'));
        if (val) {
            const parsed = parseFloat(val.replace(',', '.'));
            if (!isNaN(parsed) && parsed > 0) {
                pixelsPerMeter = Math.hypot(scalePoints[1].x - scalePoints[0].x, scalePoints[1].y - scalePoints[0].y) / parsed;
                btnSetScale.disabled = true;
                btnScale.classList.remove('active');
                mode = 'none';
                btnMeasure.disabled = btnNewCable.disabled = btnConnect.disabled = btnDelete.disabled = btnUndo.disabled = btnClear.disabled = selectCableType.disabled = false;
                redraw();
                autoSave();
            } else {
                alert(t('statScaleInvalid'));
            }
        }
    });

    // EZEKET MEGTARTOTTUK (maradtak a helyükön):
    btnScale.addEventListener('click', () => { mode = 'scale'; scalePoints = []; pixelsPerMeter = null; btnScale.classList.add('active'); btnMeasure.classList.remove('active'); btnConnect.classList.remove('active'); btnNewCable.classList.remove('active'); btnDelete.classList.remove('active'); document.getElementById('canvas-container').classList.remove('delete-mode'); btnSetScale.disabled = true; redraw(); });
    btnMeasure.addEventListener('click', () => { mode = 'measure'; btnScale.classList.remove('active'); btnMeasure.classList.add('active'); btnConnect.classList.remove('active'); btnNewCable.classList.remove('active'); btnDelete.classList.remove('active'); document.getElementById('canvas-container').classList.remove('delete-mode'); redraw(); });
    btnNewCable.addEventListener('click', () => { if (cables[activeCableIndex].points.length > 0) { cables.push({ type: selectCableType.value || 'cat6', points: [] }); activeCableIndex = cables.length - 1; btnNewCable.classList.add('active'); btnDelete.classList.remove('active'); document.getElementById('canvas-container').classList.remove('delete-mode'); redraw(); autoSave(); } });
    btnConnect.addEventListener('click', () => { mode = 'connect'; connectState = { devA: null, portA: null }; btnScale.classList.remove('active'); btnMeasure.classList.remove('active'); btnConnect.classList.add('active'); btnNewCable.classList.remove('active'); btnDelete.classList.remove('active'); document.getElementById('canvas-container').classList.remove('delete-mode'); redraw(); });
    btnDelete.addEventListener('click', () => { mode = 'delete'; btnScale.classList.remove('active'); btnMeasure.classList.remove('active'); btnConnect.classList.remove('active'); btnNewCable.classList.remove('active'); btnDelete.classList.add('active'); document.getElementById('canvas-container').classList.add('delete-mode'); redraw(); });
    
    // Globális Undo
    btnUndo.addEventListener('click', () => { 
        isUndoingOrRedoing = true;
        try {
            const lastAction = actionHistory.pop();
            if (lastAction) {
                if (lastAction.type === 'device' && devices.length > 0) {
                    const popped = devices.pop();
                    redoHistory.push({ type: 'device', device: popped });
                } else if (lastAction.type === 'scale' && scalePoints.length > 0) {
                    const popped = scalePoints.pop();
                    const oldPixelsPerMeter = pixelsPerMeter;
                    const oldMode = mode;
                    redoHistory.push({ type: 'scale', point: popped, pixelsPerMeter: oldPixelsPerMeter, mode: oldMode });
                    pixelsPerMeter = null; btnSetScale.disabled = true; btnScale.classList.add('active'); mode = 'scale';
                } else if (lastAction.type === 'cable') {
                    if (cables[lastAction.cableIndex] && cables[lastAction.cableIndex].points.length > 0) {
                        const popped = cables[lastAction.cableIndex].points.pop();
                        redoHistory.push({ type: 'cablePoint', cableIndex: lastAction.cableIndex, point: popped });
                    } else if (lastAction.cableIndex > 0) {
                        const poppedCable = cables.pop();
                        const oldActiveCableIndex = activeCableIndex;
                        redoHistory.push({ type: 'cableObject', cableIndex: lastAction.cableIndex, cable: poppedCable, oldActiveCableIndex: oldActiveCableIndex });
                        activeCableIndex--;
                    }
                }
                redraw(); 
                autoSave();
            }
        } finally {
            isUndoingOrRedoing = false;
        }
    });

    // Globális Redo
    function performRedo() {
        isUndoingOrRedoing = true;
        try {
            const nextAction = redoHistory.pop();
            if (nextAction) {
                if (nextAction.type === 'device') {
                    devices.push(nextAction.device);
                    actionHistory.push({ type: 'device' });
                } else if (nextAction.type === 'scale') {
                    scalePoints.push(nextAction.point);
                    actionHistory.push({ type: 'scale' });
                    if (scalePoints.length === 2) {
                        btnSetScale.disabled = false;
                        if (nextAction.pixelsPerMeter !== null) {
                            pixelsPerMeter = nextAction.pixelsPerMeter;
                            btnSetScale.disabled = true;
                            btnScale.classList.remove('active');
                            mode = nextAction.mode || 'none';
                        }
                    }
                } else if (nextAction.type === 'cablePoint') {
                    if (cables[nextAction.cableIndex]) {
                        cables[nextAction.cableIndex].points.push(nextAction.point);
                        actionHistory.push({ type: 'cable', cableIndex: nextAction.cableIndex });
                    }
                } else if (nextAction.type === 'cableObject') {
                    cables.push(nextAction.cable);
                    activeCableIndex = nextAction.cableIndex;
                    actionHistory.push({ type: 'cable', cableIndex: nextAction.cableIndex });
                }
                redraw();
                autoSave();
            }
        } finally {
            isUndoingOrRedoing = false;
        }
    }

    btnClear.addEventListener('click', () => { if(confirm(t('confirmClear'))) { scalePoints=[]; cables=[{ type: selectCableType.value || 'cat6', points: [] }]; devices=[]; actionHistory=[]; redoHistory=[]; activeCableIndex=0; pixelsPerMeter=null; gridOffsetX=0; gridOffsetY=0; redraw(); autoSave(); } });

    btnExportPlan.addEventListener('click', () => {
        if (!img.src) return;
        const data = { scalePoints, cables, devices, pixelsPerMeter, zoom, cameraX, cameraY, gridOffsetX, gridOffsetY };
        if (img.src.length < 1500000) data.imgSrc = img.src;
        const jsonStr = JSON.stringify(data);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workspace.plan";
        a.click();
        URL.revokeObjectURL(url);
    });

    btnExport.addEventListener('click', () => {
        if (!img.src) return;
        const prevMode = mode;
        mode = 'export';
        redraw();
        
        try {
            const { jsPDF } = window.jspdf;
            const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save('floorplan_measured.pdf');
        } catch (e) {
            console.error("PDF export failed, falling back to PNG", e);
            const link = document.createElement('a');
            link.download = 'floorplan_measured.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        mode = prevMode;
        redraw();
    });

    document.getElementById('btn-toggle-layers').addEventListener('click', () => {
        showLayers = !showLayers;
        redraw();
    });

    document.getElementById('btn-snap-grid').addEventListener('click', (e) => {
        snapToGrid = !snapToGrid;
        e.target.classList.toggle('active', snapToGrid);
        redraw();
    });

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        if (!img.src) return;
        zoom = Math.min(zoom * 1.2, 15);
        redraw();
        autoSave();
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        if (!img.src) return;
        zoom = Math.max(zoom * 0.8, 0.05);
        redraw();
        autoSave();
    });

    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
        if (!img.src) return;
        zoom = Math.min(canvas.width/img.width, canvas.height/img.height) * 0.95;
        cameraX = (canvas.width - img.width * zoom) / 2;
        cameraY = (canvas.height - img.height * zoom) / 2;
        redraw();
        autoSave();
    });

    // --- RAJZOLÓ MOTOR ---
    function redraw() {
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const canvasBgColor = getComputedStyle(document.body).getPropertyValue('--canvas-bg').trim();
        ctx.fillStyle = canvasBgColor || '#ccd0da';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Alaprajz (kép) kirajzolása
        if (img.src) {
            ctx.save();
            ctx.translate(cameraX, cameraY);
            ctx.scale(zoom, zoom);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        }

        const isExport = (mode === 'export');


        // ponytail: Removed custom crosshair rendering, relying on native CSS cursor

        // 2. LÉPÉS: Kamera transzformáció megnyitása a térbeli objektumoknak (vonalak, pontok)
        ctx.save(); 
        ctx.translate(cameraX, cameraY); 
        ctx.scale(zoom, zoom);

        if (snapToGrid && !isExport && img.src) {
            ctx.save();
            ctx.strokeStyle = 'rgba(120, 120, 120, 0.4)';
            ctx.lineWidth = 1 / zoom;
            const gridSize = 20;
            ctx.beginPath();
            const dx = ((gridOffsetX % gridSize) + gridSize) % gridSize;
            const dy = ((gridOffsetY % gridSize) + gridSize) % gridSize;
            for (let x = dx; x <= img.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, img.height); }
            for (let y = dy; y <= img.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(img.width, y); }
            ctx.stroke();
            ctx.restore();
        }

        // Méretarány vonalak rajzolása
        if (scalePoints.length > 0) {
            ctx.strokeStyle = '#1e66f5'; ctx.lineWidth = 4 / zoom; ctx.fillStyle = 'white';
            if (scalePoints.length === 2) { ctx.beginPath(); ctx.moveTo(scalePoints[0].x, scalePoints[0].y); ctx.lineTo(scalePoints[1].x, scalePoints[1].y); ctx.stroke(); }
            scalePoints.forEach((p, i) => { ctx.globalAlpha = draggedPoint && draggedPoint.type === 'scale' && draggedPoint.index === i && !isExport ? 0.4 : 1.0; ctx.beginPath(); ctx.arc(p.x, p.y, 8 / zoom, 0, 2*Math.PI); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1.0; });
        }

        // ponytail: Added showLayers toggle check to support layer visibility
        if (showLayers) {
            // Kábelek és pontok rajzolása

            cables.forEach((cableObj, cIndex) => {
                let cable = cableObj.points;
                let isSmart = ('fromDev' in cableObj);
                let pStart = null, pEnd = null;
                
                if (isSmart) {
                    let d1 = devices.find(d => d.id === cableObj.fromDev);
                    let d2 = devices.find(d => d.id === cableObj.toDev);
                    if (d1 && d2) {
                        pStart = {x: d1.x, y: d1.y};
                        pEnd = {x: d2.x, y: d2.y};
                        cable = [pStart, ...cableObj.points, pEnd];
                    } else { return; } // broken link
                }
                
                if (cable.length === 0) return;
                const typeColor = CABLE_TYPES[cableObj.type] ? CABLE_TYPES[cableObj.type].color : '#f5bde6';
                ctx.strokeStyle = typeColor; ctx.lineWidth = (cIndex === activeCableIndex ? 5 : 3) / zoom; ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.moveTo(cable[0].x, cable[0].y);
                for (let i = 1; i < cable.length; i++) ctx.lineTo(cable[i].x, cable[i].y); ctx.stroke();
                
                if (!isSmart) {
                    cable.forEach((p, i) => { ctx.globalAlpha = draggedPoint && draggedPoint.type === 'cable' && draggedPoint.cableIndex === cIndex && draggedPoint.index === i && !isExport ? 0.4 : 1.0; ctx.beginPath(); ctx.arc(p.x, p.y, (cIndex === activeCableIndex ? 6 : 4) / zoom, 0, 2*Math.PI); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1.0; });
                } else {
                    // Only draw bend points (not the endpoints which are anchored to devices)
                    cableObj.points.forEach((p, i) => { ctx.globalAlpha = draggedPoint && draggedPoint.type === 'cable' && draggedPoint.cableIndex === cIndex && draggedPoint.index === i && !isExport ? 0.4 : 1.0; ctx.beginPath(); ctx.arc(p.x, p.y, (cIndex === activeCableIndex ? 6 : 4) / zoom, 0, 2*Math.PI); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1.0; });
                }
            });


            // Eszközök rajzolása
            devices.forEach((d, i) => {
                const pos = getDeviceDrawPos(i);
                ctx.save(); ctx.translate(pos.x, pos.y);
                let color = deviceColors[d.type] || '#8aadf4';
                const shortLabel = d.name || deviceShortnames[d.type] || 'DEV';
                const radius = 15 / zoom;

                ctx.globalAlpha = draggedPoint && draggedPoint.type === 'device' && draggedPoint.index === i && !isExport ? 0.4 : 1.0;
                
                let stackedRack = null;
                if (d.type !== 'rack') {
                    for (let j = 0; j < devices.length; j++) {
                        if (devices[j].type === 'rack' && Math.abs(devices[j].x - d.x) < 1 && Math.abs(devices[j].y - d.y) < 1) {
                            stackedRack = devices[j];
                            break;
                        }
                    }
                }

                if (d.type === 'rack') {
                    const rw = d.width || 50;
                    const rh = d.height || 110;
                    ctx.fillStyle = theme === 'light' ? '#e6e9ef' : '#1e2030';
                    ctx.strokeStyle = '#494d64';
                    ctx.lineWidth = 3 / zoom;
                    ctx.beginPath();
                    ctx.roundRect(-rw/2, -rh/2, rw, rh, 4 / zoom);
                    ctx.fill();
                    ctx.stroke();

                    ctx.strokeStyle = '#bcc0cc';
                    ctx.lineWidth = 1.5 / zoom;
                    ctx.beginPath();
                    ctx.moveTo(-rw/2 + 4/zoom, -rh/2); ctx.lineTo(-rw/2 + 4/zoom, rh/2);
                    ctx.moveTo(rw/2 - 4/zoom, -rh/2); ctx.lineTo(rw/2 - 4/zoom, rh/2);
                    ctx.stroke();

                    ctx.fillStyle = theme === 'light' ? '#4c4f69' : '#cad3f5';
                    ctx.font = `bold ${10 / zoom}px 'Segoe UI', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(shortLabel, 0, -rh/2 - 2/zoom);
                } else if (stackedRack) {
                    const rw = stackedRack.width || 50;
                    const uw = rw - 10;
                    const uh = 14;
                    ctx.fillStyle = color;
                    ctx.strokeStyle = theme === 'light' ? '#4c4f69' : '#11111b';
                    ctx.lineWidth = 1.5 / zoom;

                    ctx.beginPath();
                    ctx.roundRect(-uw/2, -uh/2, uw, uh, 2 / zoom);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#bcc0cc';
                    ctx.beginPath();
                    ctx.arc(-uw/2 - 2/zoom, 0, 1/zoom, 0, 2*Math.PI);
                    ctx.arc(uw/2 + 2/zoom, 0, 1/zoom, 0, 2*Math.PI);
                    ctx.fill();

                    ctx.fillStyle = '#11111b';
                    ctx.font = `bold ${9 / zoom}px 'Segoe UI', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(shortLabel, 0, 0.5 / zoom);
                } else {
                    ctx.fillStyle = color;
                    ctx.strokeStyle = theme === 'light' ? '#ffffff' : '#11111b';
                    ctx.lineWidth = 2.5 / zoom;
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
                    ctx.fill(); 
                    ctx.stroke();

                    ctx.fillStyle = '#11111b'; 
                    ctx.font = `bold ${11 / zoom}px 'Segoe UI', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(shortLabel, 0, 0.5 / zoom);
                }

                ctx.restore();
            });
        }

        // Close camera transform
        ctx.restore();

        // Calculate cable lengths in a single pass
        if (pixelsPerMeter) {
            let totalMeters = 0, activeLen = 0;
            let typeLengths = {};

            cables.forEach((cableObj, cIndex) => {
                let cable = cableObj.points;
                if ('fromDev' in cableObj) {
                    let d1 = devices.find(d => d.id === cableObj.fromDev);
                    let d2 = devices.find(d => d.id === cableObj.toDev);
                    if (d1 && d2) cable = [{x: d1.x, y: d1.y}, ...cableObj.points, {x: d2.x, y: d2.y}];
                }
                
                let cType = cableObj.type || 'default';
                if (!typeLengths[cType]) typeLengths[cType] = 0;
                for (let i = 1; i < cable.length; i++) {
                    const seg = Math.hypot(cable[i].x - cable[i-1].x, cable[i].y - cable[i-1].y) / pixelsPerMeter;
                    totalMeters += seg;
                    typeLengths[cType] += seg;
                    if (cIndex === activeCableIndex) activeLen += seg;
                }
            });

            let typeHtml = Object.keys(typeLengths).filter(t => typeLengths[t] > 0).map(t => `<span style="color:${CABLE_TYPES[t] ? CABLE_TYPES[t].color : '#f5bde6'}">${CABLE_TYPES[t] ? CABLE_TYPES[t].name : t}: ${typeLengths[t].toFixed(2)}m</span>`).join(' | ');
            measurements.innerHTML = `<span style="color:var(--danger);margin-right:15px;">${t('textActive', activeCableIndex+1)}: <b>${activeLen.toFixed(2)} m</b></span><span style="color:var(--success); margin-right:15px;">${t('textTotal')}: <b>${totalMeters.toFixed(2)} m</b></span><span style="font-size:0.85em;">(${typeHtml})</span>`;
        } else {
            measurements.innerHTML = '';
        }
    }

    function loadSavedWorkspace() {
        try {
            const data = JSON.parse(localStorage.getItem('measurer_workspace') || 'null');
            if (!data) return;
            if (data.imgSrc) {
                img.onload = () => { resizeCanvas(); restoreState(data, true); };
                img.src = data.imgSrc;
            } else {
                restoreState(data, false);
            }
        } catch (e) {
            console.error('Error loading saved workspace', e);
        }
    }

    // Call load on startup
    loadSavedWorkspace();
    updateLanguageUI();
    document.getElementById('btn-mobile-menu').addEventListener('click', () => {
        document.getElementById('controls').classList.toggle('open');
    });

    document.querySelectorAll('#controls button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.getElementById('controls').classList.remove('open');
            }
        });
    });

    // Drag to scroll for groups-container with smooth momentum
    const groupsContainer = document.querySelector('.groups-container');
    if (groupsContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let velX = 0;
        let momentumID;

        groupsContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            groupsContainer.classList.add('active');
            startX = e.pageX - groupsContainer.offsetLeft;
            scrollLeft = groupsContainer.scrollLeft;
            cancelAnimationFrame(momentumID);
        });

        groupsContainer.addEventListener('mouseleave', () => {
            isDown = false;
            groupsContainer.classList.remove('active');
        });

        groupsContainer.addEventListener('mouseup', () => {
            isDown = false;
            groupsContainer.classList.remove('active');
            beginMomentum();
        });

        groupsContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - groupsContainer.offsetLeft;
            const walk = (x - startX) * 2; 
            let prevScrollLeft = groupsContainer.scrollLeft;
            groupsContainer.scrollLeft = scrollLeft - walk;
            velX = groupsContainer.scrollLeft - prevScrollLeft;
        });

        function beginMomentum() {
            momentumID = requestAnimationFrame(momentumLoop);
        }

        function momentumLoop() {
            if (!isDown && Math.abs(velX) > 0.1) {
                groupsContainer.scrollLeft += velX;
                velX *= 0.95; 
                momentumID = requestAnimationFrame(momentumLoop);
            }
        }
    }

    // Smart Connections Popup
    const portPopup = document.getElementById('port-selector-popup');
    const portPopupGrid = document.getElementById('port-popup-grid');
    
    function showPortPopup(devIndex, wx, wy) {
        const dev = devices[devIndex];
        if (!dev.id) dev.id = Math.random().toString(36).substr(2, 9);
        if (!dev.ports) dev.ports = {};
        if (!dev.portCount) dev.portCount = getDefaultPortCount(dev.type);
        
        portPopupGrid.innerHTML = '';
        for (let i = 0; i < dev.portCount; i++) {
            if (!dev.ports[i]) dev.ports[i] = {};
            const p = dev.ports[i];
            const btn = document.createElement('div');
            btn.className = 'port-popup-btn' + (p.conn ? ' used' : '');
            btn.innerText = i + 1;
            btn.onclick = () => {
                if (p.conn) return; // already used
                hidePortPopup();
                if (!connectState.devA) {
                    connectState.devA = dev.id;
                    connectState.portA = i;
                } else {
                    if (connectState.devA === dev.id) return; // same device
                    // Create smart cable
                    cables.push({
                        type: selectCableType.value || 'cat6',
                        fromDev: connectState.devA, fromPort: connectState.portA,
                        toDev: dev.id, toPort: i,
                        points: [] // intermediate points
                    });
                    // Update connection strings
                    const dA = devices.find(d => d.id === connectState.devA);
                    if(dA) dA.ports[connectState.portA].conn = `${dev.type.toUpperCase()} port ${i+1}`;
                    dev.ports[i].conn = `${dA ? dA.type.toUpperCase() : '?'} port ${connectState.portA+1}`;
                    connectState = { devA: null, portA: null };
                    mode = 'none'; btnConnect.classList.remove('active'); btnNewCable.classList.remove('active');
                    redraw(); autoSave();
                }
            };
            portPopupGrid.appendChild(btn);
        }
        // Position relative to canvas
        const cx = wx * zoom + cameraX + canvas.offsetLeft;
        const cy = wy * zoom + cameraY + canvas.offsetTop;
        portPopup.style.left = cx + 'px';
        portPopup.style.top = cy + 'px';
        portPopup.classList.add('open');
    }

    function hidePortPopup() { portPopup.classList.remove('open'); }
    
    // Hide popup on canvas move/pan
    canvas.addEventListener('mousedown', () => { if(mode !== 'connect') hidePortPopup(); });

function distToSegment(p, v, w) {
    const l2 = (w.x - v.x)**2 + (w.y - v.y)**2;
    if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}
