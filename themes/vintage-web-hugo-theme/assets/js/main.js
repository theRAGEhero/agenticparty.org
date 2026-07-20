// Vintage Web Theme JavaScript
// Retro functionality with modern enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Window controls functionality
    initWindowControls();

    // Snapshot the windows visible on load; the easter-egg game needs ALL of them closed.
    window.__eggPanels = getEasterEggPanels().filter(function (p) { return !isPanelClosed(p); });

    // Retro effects
    initRetroEffects();
    
    // Keyboard navigation
    initKeyboardNavigation();
    
    // Image galleries
    initImageGalleries();
    
    // Code copy functionality
    initCodeCopy();
    
    // Search functionality
    initSearch();
    
    // Theme persistence
    initThemePersistence();

    // Live status clock for static builds
    initStatusClock();

    // Audience pathway selector
    initPathwaySelector();

    // Party deployment-topology CRT animation
    initPartyTopology();

    // "How it works" CRT explainer cards
    initCrtCards();
});

// Window controls (minimize, maximize, close)
function initWindowControls() {
    document.querySelectorAll('.window-button').forEach(button => {
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttonText = this.textContent.trim();
            const panel = getWindowPanel(this);
            
            // Visual feedback
            this.style.border = '1px inset var(--button-face)';
            setTimeout(() => {
                this.style.border = '1px outset var(--button-face)';
            }, 100);
            
            switch(buttonText) {
                case '_': // Minimize
                    toggleWindowMinimize(panel);
                    break;
                case '□': // Maximize
                    toggleWindowMaximize(panel);
                    break;
                case '×': // Close
                    showCloseDialog(panel);
                    break;
            }
        });
    });

    // Clicking a collapsed window's title bar restores it (easier than the tiny "_" on touch).
    document.querySelectorAll('.window-header').forEach(header => {
        header.addEventListener('click', function(e) {
            if (e.target.closest('.window-button')) {
                return; // let the control buttons handle their own clicks
            }
            const panel = getWindowPanel(this);
            if (panel && panel.classList.contains('is-minimized')) {
                setWindowMinimized(panel, false);
            }
        });
    });
}

function getWindowPanel(button) {
    return button.closest('.window, .hero-panel, .split-statement, .program-band, .method-panel, .principles-panel, .reading-panel, .contact-panel, .subpage-hero, .article-window, .archive-window');
}

function toggleWindowMinimize(panel) {
    if (!panel) {
        return;
    }
    setWindowMinimized(panel, !panel.classList.contains('is-minimized'));
}

function setWindowMinimized(panel, minimized) {
    if (!panel) {
        return;
    }
    panel.classList.toggle('is-minimized', minimized);
    panel.style.height = '';

    const minimizeButton = panel.querySelector(':scope > .window-header .window-button:first-child');
    if (minimizeButton) {
        minimizeButton.setAttribute('aria-label', minimized ? 'Restore window' : 'Minimize window');
        minimizeButton.setAttribute('aria-pressed', String(minimized));
    }
}

function toggleWindowMaximize(panel) {
    if (!panel) {
        return;
    }
    if (panel.classList.contains('maximized')) {
        panel.classList.remove('maximized');
        panel.style.position = 'static';
        panel.style.top = 'auto';
        panel.style.left = 'auto';
        panel.style.width = 'auto';
        panel.style.height = 'auto';
        panel.style.zIndex = 'auto';
    } else {
        // A minimized window hides its content via `.is-minimized > :not(.window-header)`,
        // so it must be un-minimized before maximizing or it becomes an empty title bar.
        setWindowMinimized(panel, false);
        panel.classList.add('maximized');
        panel.style.position = 'fixed';
        panel.style.top = '10px';
        panel.style.left = '10px';
        panel.style.width = 'calc(100vw - 20px)';
        panel.style.height = 'calc(100vh - 40px)';
        panel.style.zIndex = '1000';
    }
}

function showCloseDialog(panel) {
    if (!panel) {
        return;
    }
    showRetroCloseDialog(panel);
}

function showRetroCloseDialog(panel) {
    playRetroSound('error');

    const existingDialog = document.querySelector('.retro-dialog-backdrop');
    if (existingDialog) {
        existingDialog.remove();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'retro-dialog-backdrop';
    backdrop.innerHTML = `
        <div class="retro-dialog-window" role="dialog" aria-modal="true" aria-labelledby="retro-dialog-title">
            <div class="retro-dialog-titlebar">
                <span id="retro-dialog-title">System Message</span>
                <button class="retro-dialog-x" type="button" aria-label="Cancel">×</button>
            </div>
            <div class="retro-dialog-body">
                <div class="retro-dialog-icon">!</div>
                <div class="retro-dialog-copy">
                    <p class="retro-dialog-heading">Cannot close democracy.exe</p>
                    <p>Participation is still running in the background.</p>
                </div>
            </div>
            <div class="retro-dialog-actions">
                <button class="retro-dialog-button retro-dialog-ok" type="button">OK</button>
                <button class="retro-dialog-button retro-dialog-cancel" type="button">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    const keyHandler = function(e) {
        if (e.key === 'Escape') {
            closeDialog();
        }
        if (e.key === 'Enter') {
            closeWindow();
        }
    };

    const closeDialog = () => {
        document.removeEventListener('keydown', keyHandler);
        backdrop.remove();
    };

    const closeWindow = () => {
        closeDialog();
        panel.classList.add('closing-window');
        panel.addEventListener('animationend', function handleCloseAnimation() {
            panel.style.display = 'none';
            panel.classList.remove('closing-window');
            panel.removeEventListener('animationend', handleCloseAnimation);
            checkAllWindowsClosed();
        }, { once: true });
    };

    backdrop.querySelector('.retro-dialog-ok').addEventListener('click', closeWindow);
    backdrop.querySelector('.retro-dialog-cancel').addEventListener('click', closeDialog);
    backdrop.querySelector('.retro-dialog-x').addEventListener('click', closeDialog);
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) {
            closeDialog();
        }
    });

    document.addEventListener('keydown', keyHandler);
    backdrop.querySelector('.retro-dialog-ok').focus();
}

function getEasterEggPanels() {
    // Every closeable desktop window on the page (excluding dialogs and the game itself).
    const panels = new Set();
    document.querySelectorAll('.window-button').forEach(button => {
        if (button.closest('.retro-dialog-window, .agentic-game-window')) {
            return;
        }
        const panel = getWindowPanel(button);
        if (panel && !panel.closest('.retro-dialog-window, .agentic-game-window')) {
            panels.add(panel);
        }
    });
    return Array.from(panels);
}

function isPanelClosed(panel) {
    return panel.style.display === 'none' || panel.hidden || getComputedStyle(panel).display === 'none';
}

function checkAllWindowsClosed() {
    if (window.civicGameLaunched) {
        return;
    }
    // Require every window that was actually visible on load to be closed — so the game
    // launches only when ALL of them are gone (not when a CSS-hidden one is pre-"closed").
    if (!window.__eggPanels) {
        window.__eggPanels = getEasterEggPanels().filter(function (p) { return !isPanelClosed(p); });
    }
    const panels = window.__eggPanels;
    if (!panels.length) {
        return;
    }
    if (panels.every(isPanelClosed)) {
        window.civicGameLaunched = true;
        launchCivicGame(panels);
    }
}

function launchCivicGame(closedPanels) {
    const existingGame = document.querySelector('.agentic-game-backdrop');
    if (existingGame) {
        existingGame.remove();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'agentic-game-backdrop';
    backdrop.innerHTML = `
        <section class="agentic-game-window" role="dialog" aria-modal="true" aria-labelledby="agentic-game-title">
            <div class="agentic-game-titlebar">
                <span id="agentic-game-title">democracy-capacity.exe</span>
                <div class="agentic-game-title-actions">
                    <button class="agentic-game-title-button agentic-game-help" type="button" aria-label="How to play" aria-expanded="false">?</button>
                    <button class="agentic-game-title-button agentic-game-mute" type="button" aria-label="Mute sound" aria-pressed="false">&#9834;</button>
                    <button class="agentic-game-title-button agentic-game-exit" type="button" aria-label="Close game">&times;</button>
                </div>
            </div>
            <canvas class="agentic-game-canvas" width="480" height="588" tabindex="0" aria-label="Agentic Party civic arcade game: route citizen signals through the democratic pipeline."></canvas>
            <div class="agentic-game-help-panel" hidden role="dialog" aria-label="How to play">
                <div class="agentic-game-help-inner">
                    <h3>How to play &mdash; democracy&#8209;capacity.exe</h3>
                    <p class="agentic-game-help-goal">Goal: turn scattered participation into decisions &mdash; without letting trust collapse.</p>
                    <ul>
                        <li><b>You are Agentic</b>, a citizen. Move with arrows / WASD, the on&#8209;screen D&#8209;pad, or by clicking a side of the board.</li>
                        <li><b>Collect signals</b> &mdash; the small glowing tokens. You can carry up to 3 at a time.</li>
                        <li><b>Deliver them to the lit station</b>, in order: Listen &rarr; Synthesize &rarr; Decide &rarr; Explain &rarr; Account. Clear all five to finish a wave.</li>
                        <li><b>Dodge the failure modes</b> (Opaque, Slogan Loop, No Follow&#8209;up, Campaign Mode) &mdash; they drain Trust. If Trust hits 0, it&rsquo;s game over.</li>
                        <li><b>Grab Transparency (T)</b> to make them flee, then chase them down for bonus points.</li>
                        <li>Build combos, clear endless waves, and beat your HI&#8209;SCORE.</li>
                    </ul>
                    <button class="agentic-game-button agentic-game-help-close" type="button">Got it</button>
                </div>
            </div>
            <div class="agentic-game-hud" aria-live="polite">
                <span class="agentic-game-message">Route citizen signals through the pipeline. Press Space or tap to start.</span>
                <div class="agentic-game-hud-buttons">
                    <button class="agentic-game-button agentic-game-restart" type="button">Restart</button>
                    <button class="agentic-game-button agentic-game-restore" type="button">Restore windows</button>
                </div>
            </div>
            <div class="agentic-game-controls" aria-label="Touch movement controls">
                <div class="agentic-game-dpad">
                    <button class="agentic-game-pad agentic-game-pad-up" type="button" data-dir="up" aria-label="Move up">&#9650;</button>
                    <button class="agentic-game-pad agentic-game-pad-left" type="button" data-dir="left" aria-label="Move left">&#9664;</button>
                    <button class="agentic-game-pad agentic-game-pad-down" type="button" data-dir="down" aria-label="Move down">&#9660;</button>
                    <button class="agentic-game-pad agentic-game-pad-right" type="button" data-dir="right" aria-label="Move right">&#9654;</button>
                </div>
            </div>
        </section>
    `;
    document.body.appendChild(backdrop);

    const game = initCivicGame(backdrop, closedPanels);
    backdrop.querySelector('.agentic-game-exit').addEventListener('click', game.destroy);
    backdrop.querySelector('.agentic-game-restart').addEventListener('click', game.restart);
    backdrop.querySelector('.agentic-game-restore').addEventListener('click', game.restore);
    backdrop.querySelector('.agentic-game-mute').addEventListener('click', function() {
        const muted = game.toggleMute();
        this.setAttribute('aria-pressed', String(muted));
        this.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
        this.innerHTML = muted ? '&#128263;' : '&#9834;';
    });
    const helpBtn = backdrop.querySelector('.agentic-game-help');
    const helpPanel = backdrop.querySelector('.agentic-game-help-panel');
    function setHelp(open) {
        helpPanel.hidden = !open;
        helpBtn.setAttribute('aria-expanded', String(open));
        if (game.setPaused) { game.setPaused(open); }
    }
    helpBtn.addEventListener('click', function() { setHelp(helpPanel.hidden); });
    backdrop.querySelector('.agentic-game-help-close').addEventListener('click', function() { setHelp(false); });
    document.addEventListener('keydown', game.handleGlobalKeys);
    backdrop.querySelector('.agentic-game-canvas').focus();
}

// WebAudio SFX + a small chiptune loop. Self-contained; resumes on first gesture.
function createGameAudio() {
    let audioCtx = null;
    let muted = false;
    let musicTimer = null;
    let musicStep = 0;

    function ctx() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                audioCtx = null;
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function tone(freq, dur, type, vol, when) {
        const c = ctx();
        if (!c || muted) {
            return;
        }
        const t0 = c.currentTime + (when || 0);
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(vol || 0.05, t0);
        gain.gain.exponentialRampToValueAtTime(0.0007, t0 + dur);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    function seq(notes, step, type, vol) {
        notes.forEach((f, i) => tone(f, step * 1.5, type, vol, i * step));
    }

    // A gentle chiptune loop: Am - F - C - G, with a singable lead over a triangle bass.
    const MUSIC_BASS = [110.0, 87.31, 130.81, 98.0];          // A2, F2, C3, G2 (one per bar)
    const MUSIC_LEAD = [
        659.25, 587.33, 523.25, 440.0,   // Am:  E5 D5 C5 A4
        698.46, 659.25, 523.25, 440.0,   // F:   F5 E5 C5 A4
        392.0, 523.25, 659.25, 783.99,   // C:   G4 C5 E5 G5
        587.33, 493.88, 392.0, 493.88    // G:   D5 B4 G4 B4
    ];

    function startMusic() {
        if (musicTimer || muted) {
            return;
        }
        musicTimer = setInterval(() => {
            const step = musicStep % 16;
            const bar = Math.floor(step / 4);
            if (step % 4 === 0) {
                tone(MUSIC_BASS[bar], 0.42, 'triangle', 0.05);        // bass on the downbeat
            } else if (step % 4 === 2) {
                tone(MUSIC_BASS[bar] * 2, 0.16, 'triangle', 0.028);   // soft octave pulse
            }
            tone(MUSIC_LEAD[step], 0.24, 'square', 0.03);             // lead melody
            musicStep += 1;
        }, 215);
    }

    function stopMusic() {
        if (musicTimer) {
            clearInterval(musicTimer);
            musicTimer = null;
        }
    }

    return {
        resume() { ctx(); },
        collect() { tone(680, 0.09, 'square', 0.04); },
        deliver() { seq([523, 659, 784, 1047], 0.07, 'triangle', 0.05); },
        damage() { tone(150, 0.28, 'sawtooth', 0.06); tone(90, 0.3, 'square', 0.05); },
        power() { seq([392, 523, 659, 880], 0.06, 'square', 0.05); },
        eat() { seq([880, 1245], 0.05, 'square', 0.05); },
        wave() { seq([523, 659, 784, 1047, 1319], 0.08, 'triangle', 0.06); },
        over() { seq([440, 349, 262, 175], 0.15, 'sawtooth', 0.06); },
        start() { seq([392, 523, 659], 0.08, 'square', 0.05); startMusic(); },
        startMusic,
        stopMusic,
        toggleMute() {
            muted = !muted;
            if (muted) {
                stopMusic();
            } else {
                startMusic();
            }
            return muted;
        },
        isMuted() { return muted; }
    };
}

function initCivicGame(backdrop, closedPanels) {
    const canvas = backdrop.querySelector('.agentic-game-canvas');
    const ctx = canvas.getContext('2d');
    const messageEl = backdrop.querySelector('.agentic-game-message');
    const audio = createGameAudio();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- geometry ----
    const COLS = 15;
    const ROWS = 17;
    const TILE = 32;
    const TR = 8;                 // tunnel row (wraps horizontally)
    const HUD_H = 44;
    const BOARD_W = COLS * TILE;  // 480
    const BOARD_H = ROWS * TILE;  // 544
    const VIEW_W = BOARD_W;       // 480
    const VIEW_H = BOARD_H + HUD_H;

    const DIRS = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ];

    // ---- palette (on-brand, pulled partly from site CSS vars) ----
    const rootStyle = getComputedStyle(document.documentElement);
    function cssVar(name, fallback) {
        const v = rootStyle.getPropertyValue(name).trim();
        return v || fallback;
    }
    const COL = {
        bg: '#0a0d15',
        board: '#11131a',
        grid: 'rgba(120,150,210,0.10)',
        wall: '#3f6bd6',
        wallEdge: '#8fb4ff',
        text: '#d5f0ce',
        player: '#ffd36d',
        power: cssVar('--accent-teal', '#40E0D0'),
        trust: cssVar('--accent-pink', '#f3a0cf'),
        hit: '#a93a5f',
        signal: ['#66bdf2', '#7ecb8a', '#ffd36d', '#f3a0cf', '#c47be8'],
        station: ['#66bdf2', '#7ecb8a', '#ffd36d', '#f3a0cf', '#c47be8'],
        fright: '#8fb4ff'
    };

    const STAGE_DEFS = [
        { label: 'Listen', c: 3, r: 3 },
        { label: 'Synthesize', c: 11, r: 3 },
        { label: 'Decide', c: 7, r: 7 },
        { label: 'Explain', c: 3, r: 13 },
        { label: 'Account', c: 11, r: 13 }
    ];
    const SIGNAL_NAMES = ['Need', 'Idea', 'Concern', 'Local', 'Dissent'];
    const GHOST_DEFS = [
        { name: 'Opaque', color: '#ff5d6c', kind: 'chase', home: { c: 1, r: 1 }, spawn: { c: 7, r: 7 } },
        { name: 'Slogan Loop', color: '#ffb454', kind: 'ambush', home: { c: COLS - 2, r: 1 }, spawn: { c: 5, r: 7 } },
        { name: 'No Follow-up', color: '#7ce7ff', kind: 'wander', home: { c: 1, r: ROWS - 2 }, spawn: { c: 9, r: 7 } },
        { name: 'Campaign Mode', color: '#c47be8', kind: 'burst', home: { c: COLS - 2, r: ROWS - 2 }, spawn: { c: 7, r: 9 } }
    ];
    const PLAYER_SPAWN = { c: 7, r: 15 };

    // ---- maze ----
    function isWall(c, r) {
        if (r === TR && (c < 0 || c > COLS - 1)) {
            return false; // tunnel mouths
        }
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
            return true;
        }
        if (r === 0 || r === ROWS - 1) {
            return true;
        }
        if (c === 0 || c === COLS - 1) {
            return r !== TR; // open only on tunnel row
        }
        return (r % 2 === 0 && c % 2 === 0); // pillar lattice -> fully connected corridors
    }
    function centerOf(tile) { return tile * TILE + TILE / 2; }
    function tileOf(px) { return Math.floor(px / TILE); }

    // all traversable interior cells (for random signal / power-up placement)
    const PATH_CELLS = [];
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (!isWall(c, r)) {
                PATH_CELLS.push({ c, r });
            }
        }
    }

    // ---- state ----
    let animationId = null;
    let lastTime = 0;
    let state = 'title';        // title | play | over
    let paused = false;
    let wave = 1;
    let score = 0;
    let hiScore = 0;
    try { hiScore = parseInt(localStorage.getItem('agentic-game-highscore') || '0', 10) || 0; } catch (e) { hiScore = 0; }
    let newRecord = false;
    let trust = 100;
    let capacity = 0;
    let carried = 0;
    let currentStage = 0;
    let combo = 1;
    let invuln = 0;
    let frightT = 0;
    let modeTimer = 0;
    let ghostMode = 'scatter';
    let shakeT = 0;
    let flashT = 0;
    let waveFlash = 0;
    let stages = [];
    let signals = [];
    let ghosts = [];
    let powerup = null;
    let particles = [];
    let popups = [];
    let player = null;

    // Easy at the start, ramping up: slower chasers early, faster each wave.
    function ghostBaseSpeed() { return 72 + (wave - 1) * 13; }
    function playerSpeed() { return 134 + (wave - 1) * 5; }
    function activeGhostCount() { return Math.min(GHOST_DEFS.length, wave + 1); }

    function makeEntity(cell, speed) {
        return {
            x: centerOf(cell.c), y: centerOf(cell.r),
            dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 },
            speed: speed, spawn: { c: cell.c, r: cell.r }
        };
    }

    function randomPathCell(avoid) {
        const avoidSet = new Set((avoid || []).map(a => a.c + ',' + a.r));
        const pool = PATH_CELLS.filter(p => !avoidSet.has(p.c + ',' + p.r));
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function occupiedCells() {
        const list = stages.map(s => ({ c: s.c, r: s.r }));
        list.push({ c: PLAYER_SPAWN.c, r: PLAYER_SPAWN.r });
        ghosts.forEach(g => list.push({ c: g.spawn.c, r: g.spawn.r }));
        signals.forEach(s => list.push({ c: s.c, r: s.r }));
        if (powerup) { list.push({ c: powerup.c, r: powerup.r }); }
        return list;
    }

    function spawnSignal() {
        const cell = randomPathCell(occupiedCells());
        if (!cell) { return; }
        const idx = signals.length % SIGNAL_NAMES.length;
        signals.push({
            c: cell.c, r: cell.r,
            x: centerOf(cell.c), y: centerOf(cell.r),
            label: SIGNAL_NAMES[Math.floor(Math.random() * SIGNAL_NAMES.length)],
            color: COL.signal[idx], pulse: Math.random() * 6, active: true
        });
    }

    function spawnPowerup() {
        const cell = randomPathCell(occupiedCells());
        if (!cell) { return; }
        powerup = { c: cell.c, r: cell.r, x: centerOf(cell.c), y: centerOf(cell.r), pulse: 0, respawn: 0 };
    }

    function resetBoard(fullReset) {
        stages = STAGE_DEFS.map(s => ({ label: s.label, c: s.c, r: s.r, done: false }));
        currentStage = 0;
        capacity = 0;
        carried = 0;
        signals = [];
        player = makeEntity(PLAYER_SPAWN, playerSpeed());
        player.dir = { x: 0, y: 0 };
        player.nextDir = { x: 0, y: 0 };
        player.pulse = 0;
        ghosts = GHOST_DEFS.slice(0, activeGhostCount()).map(def => {
            const g = makeEntity(def.spawn, ghostBaseSpeed());
            g.name = def.name;
            g.color = def.color;
            g.kind = def.kind;
            g.home = def.home;
            g.dir = { x: -1, y: 0 };
            g.nextDir = { x: -1, y: 0 };
            g.frightened = false;
            g.wanderTimer = 0;
            g.burstTimer = Math.random() * 2;
            return g;
        });
        for (let i = 0; i < 4; i++) { spawnSignal(); }
        powerup = null;
        spawnPowerup();
        frightT = 0;
        invuln = 0;
        modeTimer = 0;
        ghostMode = 'scatter';
        if (fullReset) {
            wave = 1;
            score = 0;
            trust = 100;
            combo = 1;
            newRecord = false;
        }
        particles = [];
        popups = [];
        setMessage('Route citizen signals through Listen → Synthesize → Decide → Explain → Account.');
    }

    function startGame() {
        resetBoard(true);
        state = 'play';
        paused = false;
        audio.resume();
        audio.start();
    }

    function setMessage(text) {
        if (text && messageEl) { messageEl.textContent = text; }
    }

    // ---- rendering scale ----
    const fit = { scale: 1, ox: 0, oy: 0 };
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
        canvas.width = Math.max(1, Math.round((rect.width || VIEW_W) * dpr));
        canvas.height = Math.max(1, Math.round((rect.height || VIEW_H) * dpr));
        // contain-fit VIEW into the buffer (letterboxed) so no aspect distortion
        fit.scale = Math.min(canvas.width / VIEW_W, canvas.height / VIEW_H);
        fit.ox = (canvas.width - VIEW_W * fit.scale) / 2;
        fit.oy = (canvas.height - VIEW_H * fit.scale) / 2;
    }
    function applyViewTransform() {
        ctx.setTransform(fit.scale, 0, 0, fit.scale, fit.ox, fit.oy);
    }

    // ---- input ----
    function setDirection(name) {
        const dirs = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        if (!dirs[name]) { return; }
        if (state !== 'play') {
            startOrRetry();
            return;
        }
        player.nextDir = dirs[name];
    }

    function startOrRetry() {
        if (state === 'title' || state === 'over') {
            startGame();
        }
    }

    function handleGlobalKeys(e) {
        const keyMap = {
            ArrowUp: 'up', w: 'up', W: 'up',
            ArrowDown: 'down', s: 'down', S: 'down',
            ArrowLeft: 'left', a: 'left', A: 'left',
            ArrowRight: 'right', d: 'right', D: 'right'
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            setDirection(keyMap[e.key]);
            return;
        }
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (state === 'play') { deliverIfPossible(); } else { startOrRetry(); }
            return;
        }
        if (e.key === 'p' || e.key === 'P') { paused = !paused; lastTime = performance.now(); return; }
        if (e.key === 'm' || e.key === 'M') { audio.toggleMute(); syncMuteButton(); return; }
        if (e.key === 'Escape') { destroy(); }
    }

    function syncMuteButton() {
        const btn = backdrop.querySelector('.agentic-game-mute');
        if (btn) {
            const muted = audio.isMuted();
            btn.setAttribute('aria-pressed', String(muted));
            btn.innerHTML = muted ? '🔇' : '♪';
        }
    }

    // ---- movement ----
    function opposite(a, b) { return a.x === -b.x && a.y === -b.y && (a.x !== 0 || a.y !== 0); }

    function stepEntity(e, dt, chooser) {
        const step = e.speed * dt;
        const col = tileOf(e.x);
        const row = tileOf(e.y);
        const cx = centerOf(col);
        const cy = centerOf(row);
        if (Math.abs(e.x - cx) <= step && Math.abs(e.y - cy) <= step) {
            e.x = cx;
            e.y = cy;
            if (chooser) {
                chooser(e, col, row);
            } else if ((e.nextDir.x || e.nextDir.y) && !isWall(col + e.nextDir.x, row + e.nextDir.y)) {
                e.dir = e.nextDir;
            }
            if (isWall(col + e.dir.x, row + e.dir.y)) {
                return; // blocked ahead: rest at the tile centre
            }
        }
        e.x += e.dir.x * step;
        e.y += e.dir.y * step;
        if (row === TR) {
            if (e.x < 0) { e.x += BOARD_W; }
            else if (e.x >= BOARD_W) { e.x -= BOARD_W; }
        }
    }

    function ghostTarget(g, pc, pr, pdir) {
        if (g.frightened) { return null; }
        if (ghostMode === 'scatter' && g.kind !== 'wander') { return g.home; }
        if (g.kind === 'ambush') { return { c: pc + pdir.x * 3, r: pr + pdir.y * 3 }; }
        if (g.kind === 'wander') {
            return g.wanderTimer > 0 ? g.home : { c: pc, r: pr };
        }
        return { c: pc, r: pr };
    }

    function chooseGhostDir(g, col, row, pc, pr, pdir) {
        let options = DIRS.filter(d => !isWall(col + d.x, row + d.y) && !opposite(d, g.dir));
        if (!options.length) {
            options = DIRS.filter(d => !isWall(col + d.x, row + d.y));
        }
        if (!options.length) { return; }
        const target = ghostTarget(g, pc, pr, pdir);
        if (!target) {
            // frightened: flee from player
            let best = options[0];
            let bestDist = -Infinity;
            options.forEach(d => {
                const dist = (col + d.x - pc) * (col + d.x - pc) + (row + d.y - pr) * (row + d.y - pr);
                if (dist > bestDist) { bestDist = dist; best = d; }
            });
            g.dir = best;
            return;
        }
        let best = options[0];
        let bestDist = Infinity;
        options.forEach(d => {
            const dist = (col + d.x - target.c) * (col + d.x - target.c) + (row + d.y - target.r) * (row + d.y - target.r);
            if (dist < bestDist) { bestDist = dist; best = d; }
        });
        g.dir = best;
    }

    // ---- particles / popups ----
    function burst(x, y, color, count) {
        if (reduceMotion) { count = Math.min(count, 4); }
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 40 + Math.random() * 120;
            particles.push({
                x: x, y: y,
                vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                life: 0.5 + Math.random() * 0.4, max: 0.9,
                color: color, size: 2 + Math.random() * 3
            });
        }
        if (particles.length > 160) { particles.splice(0, particles.length - 160); }
    }

    function popup(x, y, text, color) {
        popups.push({ x: x, y: y, text: text, color: color, life: 0.9 });
    }

    function addShake(amount) {
        if (!reduceMotion) { shakeT = Math.min(0.5, shakeT + amount); }
    }

    // ---- game actions ----
    function deliverIfPossible() {
        if (carried <= 0) { return; }
        const st = stages[currentStage];
        if (!st) { return; }
        if (tileOf(player.x) === st.c && tileOf(player.y) === st.r) {
            const gained = carried;
            combo = Math.min(9, combo + 1);
            const points = 100 * gained * combo;
            score += points;
            carried = 0;
            trust = Math.min(100, trust + 6);
            st.done = true;
            capacity += 1;
            popup(st.c * TILE + TILE / 2, st.r * TILE + TILE / 2, '+' + points, COL.station[currentStage]);
            burst(centerOf(st.c), centerOf(st.r), COL.station[currentStage], 22);
            addShake(0.12);
            audio.deliver();
            if (capacity >= stages.length) {
                waveClear();
            } else {
                currentStage += 1;
                setMessage(st.label + ' delivered (x' + combo + '). Route signals to ' + stages[currentStage].label + '.');
            }
        }
    }

    function waveClear() {
        wave += 1;
        const bonus = 500 * wave;
        score += bonus;
        trust = Math.min(100, trust + 15);
        waveFlash = 1.4;
        popup(BOARD_W / 2, BOARD_H / 2, 'CYCLE ' + (wave - 1) + ' COMPLETE  +' + bonus, COL.text);
        burst(BOARD_W / 2, BOARD_H / 2, COL.power, 40);
        addShake(0.2);
        audio.wave();
        resetBoard(false);
        setMessage('Democratic cycle complete. Wave ' + wave + ' — the failure modes get faster.');
    }

    function loseGame() {
        state = 'over';
        combo = 1;
        addShake(0.3);
        flashT = 0.6;
        audio.over();
        audio.stopMusic();
        if (score > hiScore) {
            hiScore = score;
            newRecord = true;
            try { localStorage.setItem('agentic-game-highscore', String(hiScore)); } catch (e) {}
        }
        setMessage('Trust collapsed — the institution stalled. Press Space or tap to try again.');
    }

    function hitPlayer(g) {
        invuln = 1.3;
        combo = 1;
        trust = Math.max(0, trust - 18);
        flashT = 0.4;
        addShake(0.22);
        audio.damage();
        burst(player.x, player.y, COL.hit, 18);
        setMessage(g.name + ' drained trust. Keep participation legible.');
        if (trust <= 0) { loseGame(); }
    }

    function eatGhost(g) {
        const points = 200 * combo;
        score += points;
        popup(g.x, g.y, '+' + points, COL.power);
        burst(g.x, g.y, g.color, 20);
        audio.eat();
        addShake(0.1);
        g.frightened = false;
        g.x = centerOf(g.spawn.c);
        g.y = centerOf(g.spawn.r);
        g.dir = { x: -1, y: 0 };
    }

    // ---- update ----
    function update(dt) {
        // animate ambient bits even on title / over
        signals.forEach(s => { s.pulse += dt * 4; });
        if (powerup) { powerup.pulse += dt * 4; }
        particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt; });
        particles = particles.filter(p => p.life > 0);
        popups.forEach(p => { p.y -= dt * 26; p.life -= dt; });
        popups = popups.filter(p => p.life > 0);
        if (shakeT > 0) { shakeT = Math.max(0, shakeT - dt); }
        if (flashT > 0) { flashT = Math.max(0, flashT - dt); }
        if (waveFlash > 0) { waveFlash = Math.max(0, waveFlash - dt); }

        if (state !== 'play' || paused) {
            if (player) { player.pulse += dt * 6; }
            return;
        }

        player.pulse += dt * 10;
        if (invuln > 0) { invuln = Math.max(0, invuln - dt); }

        // scatter/chase cadence
        modeTimer += dt;
        if (ghostMode === 'scatter' && modeTimer > 5) { ghostMode = 'chase'; modeTimer = 0; }
        else if (ghostMode === 'chase' && modeTimer > 12) { ghostMode = 'scatter'; modeTimer = 0; }

        if (frightT > 0) {
            frightT = Math.max(0, frightT - dt);
            if (frightT === 0) { ghosts.forEach(g => { g.frightened = false; }); }
        }

        // player
        stepEntity(player, dt);
        const pc = tileOf(player.x);
        const pr = tileOf(player.y);

        // collect signals
        signals.forEach(s => {
            if (!s.active) { return; }
            if (carried < 3 && Math.hypot(player.x - s.x, player.y - s.y) < TILE * 0.55) {
                s.active = false;
                carried += 1;
                score += 10 * wave;
                audio.collect();
                burst(s.x, s.y, s.color, 8);
                popup(s.x, s.y, s.label, s.color);
                setMessage(s.label + ' collected. Deliver to ' + stages[currentStage].label + '.');
                setTimeout(() => {
                    s.c = -99; // mark; will be replaced
                }, 0);
                // respawn a fresh signal after a delay
                const delay = Math.max(700, 2200 - wave * 150);
                setTimeout(() => {
                    signals = signals.filter(x => x !== s);
                    spawnSignal();
                }, delay);
            }
        });

        // auto-deliver on arrival at the active station
        deliverIfPossible();

        // power-up pickup
        if (powerup && Math.hypot(player.x - powerup.x, player.y - powerup.y) < TILE * 0.6) {
            powerup = null;
            frightT = Math.max(4.5 - (wave - 1) * 0.3, 2.2);
            ghosts.forEach(g => { g.frightened = true; });
            audio.power();
            burst(player.x, player.y, COL.power, 24);
            setMessage('Transparency! The failure modes are legible — chase them down.');
            setTimeout(spawnPowerup, Math.max(6000, 12000 - wave * 500));
        }

        // ghosts
        ghosts.forEach(g => {
            if (g.kind === 'wander') {
                g.wanderTimer -= dt;
                if (g.wanderTimer <= 0) { g.wanderTimer = 2 + Math.random() * 3; }
            }
            let speed = ghostBaseSpeed();
            if (g.frightened) { speed *= 0.6; }
            else if (g.kind === 'burst') {
                g.burstTimer -= dt;
                if (g.burstTimer <= 0) { g.burstTimer = 2.4; }
                speed *= (g.burstTimer > 1.4 ? 1.35 : 0.8);
            }
            g.speed = speed;
            stepEntity(g, dt, (e, col, row) => chooseGhostDir(e, col, row, pc, pr, player.dir));

            if (Math.hypot(player.x - g.x, player.y - g.y) < TILE * 0.62) {
                if (g.frightened) { eatGhost(g); }
                else if (invuln === 0) { hitPlayer(g); }
            }
        });
    }

    // ---- draw ----
    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function drawBoard() {
        // maze background
        ctx.fillStyle = COL.board;
        ctx.fillRect(0, 0, BOARD_W, BOARD_H);
        // walls
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (r === TR && (c === 0 || c === COLS - 1)) { continue; }
                if (isWall(c, r)) {
                    const x = c * TILE;
                    const y = r * TILE;
                    ctx.fillStyle = COL.wall;
                    ctx.shadowBlur = reduceMotion ? 0 : 8;
                    ctx.shadowColor = COL.wallEdge;
                    roundRect(x + 3, y + 3, TILE - 6, TILE - 6, 5);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = COL.wallEdge;
                    ctx.lineWidth = 1.5;
                    roundRect(x + 3, y + 3, TILE - 6, TILE - 6, 5);
                    ctx.stroke();
                }
            }
        }
    }

    function drawStations() {
        stages.forEach((st, i) => {
            const x = centerOf(st.c);
            const y = centerOf(st.r);
            const active = i === currentStage && state === 'play';
            const pulse = active ? (Math.sin(performance.now() / 220) * 0.5 + 0.5) : 0;
            ctx.save();
            ctx.shadowBlur = reduceMotion ? 0 : (active ? 10 + pulse * 12 : (st.done ? 8 : 4));
            ctx.shadowColor = COL.station[i];
            ctx.fillStyle = st.done ? COL.station[i] : 'rgba(20,24,34,0.9)';
            roundRect(x - 15, y - 12, 30, 24, 7);
            ctx.fill();
            ctx.lineWidth = active ? 3 : 2;
            ctx.strokeStyle = COL.station[i];
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = st.done ? '#0a0d15' : COL.station[i];
            ctx.font = '700 8px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(i + 1), x, y);
            ctx.restore();
        });
    }

    function drawSignals() {
        signals.forEach(s => {
            if (!s.active) { return; }
            const wob = Math.sin(s.pulse) * 2;
            ctx.save();
            ctx.shadowBlur = reduceMotion ? 0 : 10;
            ctx.shadowColor = s.color;
            ctx.fillStyle = s.color;
            roundRect(s.x - 7, s.y - 7 + wob, 14, 14, 3);
            ctx.fill();
            ctx.restore();
        });
    }

    function drawPowerup() {
        if (!powerup) { return; }
        const pr = 8 + Math.sin(powerup.pulse) * 2;
        ctx.save();
        ctx.shadowBlur = reduceMotion ? 0 : 16;
        ctx.shadowColor = COL.power;
        ctx.fillStyle = COL.power;
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#06231f';
        ctx.font = '700 10px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('T', powerup.x, powerup.y);
        ctx.restore();
    }

    function drawPlayer() {
        if (!player) { return; }
        const blink = invuln > 0 && Math.floor(invuln * 12) % 2 === 0;
        if (blink) { return; }
        // A citizen figure (head + shoulders) that walk-bobs and leans in the facing direction.
        const bob = reduceMotion ? 0 : Math.sin(player.pulse) * 1.4;
        const lean = player.dir.x * 2;
        const x = player.x + lean;
        const y = player.y;
        ctx.save();
        ctx.shadowBlur = reduceMotion ? 0 : 14;
        ctx.shadowColor = COL.player;
        ctx.fillStyle = COL.player;
        // body / shoulders (bell shape)
        ctx.beginPath();
        ctx.moveTo(x - 9, y + 10);
        ctx.quadraticCurveTo(x - 8, y - 2 + bob, x, y - 2 + bob);
        ctx.quadraticCurveTo(x + 8, y - 2 + bob, x + 9, y + 10);
        ctx.closePath();
        ctx.fill();
        // head
        ctx.beginPath();
        ctx.arc(x, y - 7 + bob, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    const GHOST_SHORT = {
        'Opaque': 'OPAQUE',
        'Slogan Loop': 'SLOGAN',
        'No Follow-up': 'NO F-UP',
        'Campaign Mode': 'CAMPAIGN'
    };
    function drawGhosts() {
        ghosts.forEach(g => {
            const fr = g.frightened;
            const flashing = fr && frightT < 1.6 && Math.floor(frightT * 8) % 2 === 0;
            const color = fr ? (flashing ? '#ffffff' : COL.fright) : g.color;
            const x = g.x;
            const y = g.y - 1;
            const s = 10; // half-size of the corruption block
            ctx.save();
            // retro glitch "tear" slices behind the block (skip when calm/reduced)
            if (!reduceMotion && !fr) {
                ctx.globalAlpha = 0.55;
                ctx.fillStyle = '#7ce7ff';
                ctx.fillRect(x - s - 2, y - s + 3, s * 2, 2.5);
                ctx.fillStyle = '#ff5d6c';
                ctx.fillRect(x - s + 2, y + s - 5, s * 2, 2.5);
                ctx.globalAlpha = 1;
            }
            // main corruption block
            ctx.shadowBlur = reduceMotion ? 0 : 10;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            roundRect(x - s, y - s, s * 2, s * 2, 3);
            ctx.fill();
            ctx.shadowBlur = 0;
            // notched (cut) corner -> reads as "corruption", not a character
            ctx.fillStyle = COL.board;
            ctx.beginPath();
            ctx.moveTo(x + s, y - s);
            ctx.lineTo(x + s - 5, y - s);
            ctx.lineTo(x + s, y - s + 5);
            ctx.closePath();
            ctx.fill();
            // direction marker on the leading edge
            if (!fr && (g.dir.x || g.dir.y)) {
                ctx.fillStyle = '#0a0d15';
                const ax = x + g.dir.x * (s - 3);
                const ay = y + g.dir.y * (s - 3);
                ctx.beginPath();
                if (g.dir.x !== 0) {
                    ctx.moveTo(ax, ay - 3);
                    ctx.lineTo(ax + g.dir.x * 3.5, ay);
                    ctx.lineTo(ax, ay + 3);
                } else {
                    ctx.moveTo(ax - 3, ay);
                    ctx.lineTo(ax, ay + g.dir.y * 3.5);
                    ctx.lineTo(ax + 3, ay);
                }
                ctx.closePath();
                ctx.fill();
            }
            // name label -> makes each chaser legible as a democratic failure mode
            if (!fr) {
                ctx.fillStyle = COL.text;
                ctx.font = '700 7px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(GHOST_SHORT[g.name] || g.name, x, y + s + 2);
            }
            ctx.restore();
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life / p.max);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }

    function drawPopups() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 11px "Courier New", monospace';
        popups.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life / 0.9);
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        });
        ctx.globalAlpha = 1;
    }

    function drawHud() {
        ctx.save();
        applyViewTransform();
        ctx.fillStyle = '#0a0d15';
        ctx.fillRect(0, 0, VIEW_W, HUD_H);
        ctx.fillStyle = COL.text;
        ctx.font = '700 12px "Courier New", monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE ' + score, 8, 14);
        ctx.fillText('HI ' + hiScore, 8, 31);
        ctx.textAlign = 'center';
        ctx.fillText('WAVE ' + wave, VIEW_W / 2, 14);
        ctx.fillStyle = carried > 0 ? COL.player : COL.text;
        ctx.fillText('SIGNALS ' + carried + '/3   COMBO x' + combo, VIEW_W / 2, 31);
        // trust bar
        const bw = 88;
        const bx = VIEW_W - bw - 10;
        ctx.textAlign = 'right';
        ctx.fillStyle = COL.text;
        ctx.fillText('TRUST', VIEW_W - 10, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        roundRect(bx, 22, bw, 12, 4); ctx.fill();
        ctx.fillStyle = trust > 33 ? COL.power : COL.hit;
        roundRect(bx, 22, bw * Math.max(0, trust) / 100, 12, 4); ctx.fill();
        ctx.restore();
    }

    function drawOverlay() {
        if (state === 'play' && !paused) { return; }
        ctx.save();
        applyViewTransform();
        ctx.fillStyle = 'rgba(8,11,20,0.72)';
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.textAlign = 'center';
        ctx.fillStyle = COL.text;
        if (state === 'title') {
            ctx.font = '700 26px Georgia, serif';
            ctx.fillText('democracy-capacity', VIEW_W / 2, VIEW_H / 2 - 66);
            ctx.font = 'italic 600 12px Georgia, serif';
            ctx.fillStyle = COL.text;
            ctx.fillText('route participation into decisions', VIEW_W / 2, VIEW_H / 2 - 44);
            ctx.font = '700 13px "Courier New", monospace';
            ctx.fillStyle = COL.player;
            ctx.fillText('Collect signals → deliver through the pipeline', VIEW_W / 2, VIEW_H / 2 - 22);
            ctx.fillStyle = COL.text;
            ctx.fillText('Dodge the failure modes. Grab Transparency to fight back.', VIEW_W / 2, VIEW_H / 2 - 4);
            ctx.font = '700 15px "Courier New", monospace';
            ctx.fillStyle = COL.power;
            const blink = Math.floor(performance.now() / 500) % 2 === 0;
            if (blink) { ctx.fillText('PRESS SPACE / TAP TO START', VIEW_W / 2, VIEW_H / 2 + 40); }
            ctx.font = '700 11px "Courier New", monospace';
            ctx.fillStyle = COL.text;
            ctx.fillText('Arrows / WASD · D-pad · or click a side · HI ' + hiScore, VIEW_W / 2, VIEW_H / 2 + 74);
        } else if (state === 'over') {
            ctx.font = '700 28px Georgia, serif';
            ctx.fillStyle = COL.hit;
            ctx.fillText('SYSTEM STALLED', VIEW_W / 2, VIEW_H / 2 - 44);
            ctx.font = '700 15px "Courier New", monospace';
            ctx.fillStyle = COL.text;
            ctx.fillText('Score ' + score + '   ·   Wave ' + wave, VIEW_W / 2, VIEW_H / 2 - 8);
            if (newRecord) {
                ctx.fillStyle = COL.player;
                ctx.fillText('★ NEW RECORD ★', VIEW_W / 2, VIEW_H / 2 + 16);
            } else {
                ctx.fillStyle = COL.text;
                ctx.fillText('Best ' + hiScore, VIEW_W / 2, VIEW_H / 2 + 16);
            }
            ctx.fillStyle = COL.power;
            const blink = Math.floor(performance.now() / 500) % 2 === 0;
            if (blink) { ctx.fillText('SPACE / TAP TO TRY AGAIN', VIEW_W / 2, VIEW_H / 2 + 52); }
        } else if (paused) {
            ctx.font = '700 22px Georgia, serif';
            ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2);
        }
        ctx.restore();
    }

    // cached scanline strip
    let scanPattern = null;
    function getScanPattern() {
        if (scanPattern) { return scanPattern; }
        const off = document.createElement('canvas');
        off.width = 4; off.height = 4;
        const octx = off.getContext('2d');
        octx.fillStyle = 'rgba(0,0,0,0.22)';
        octx.fillRect(0, 0, 4, 2);
        scanPattern = ctx.createPattern(off, 'repeat');
        return scanPattern;
    }

    function drawCrt() {
        ctx.save();
        applyViewTransform();
        // scanlines
        ctx.globalAlpha = reduceMotion ? 0.25 : 0.5;
        ctx.fillStyle = getScanPattern();
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.globalAlpha = 1;
        // vignette
        const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.3, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.75);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        // damage / wave flash
        if (flashT > 0) {
            ctx.fillStyle = 'rgba(169,58,95,' + (flashT * 0.5) + ')';
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        if (waveFlash > 0) {
            ctx.fillStyle = 'rgba(64,224,208,' + (waveFlash * 0.18) + ')';
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
        ctx.restore();
    }

    function draw() {
        // full clear in device space (fills letterbox bars)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = COL.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // board space (below HUD), with optional shake
        const sx = shakeT > 0 ? (Math.random() - 0.5) * shakeT * 40 : 0;
        const sy = shakeT > 0 ? (Math.random() - 0.5) * shakeT * 40 : 0;
        applyViewTransform();
        ctx.save();
        ctx.translate(sx, HUD_H + sy);
        drawBoard();
        drawStations();
        drawSignals();
        drawPowerup();
        drawGhosts();
        drawPlayer();
        drawParticles();
        drawPopups();
        ctx.restore();

        drawHud();
        drawOverlay();
        drawCrt();
    }

    function loop(time) {
        const delta = Math.min(0.033, (time - lastTime) / 1000 || 0);
        lastTime = time;
        if (!paused) { update(delta); }
        draw();
        animationId = requestAnimationFrame(loop);
    }

    // ---- lifecycle ----
    function restart() {
        startGame();
        resizeCanvas();
        lastTime = performance.now();
    }

    function restore() {
        closedPanels.forEach(panel => {
            panel.style.display = '';
            panel.classList.remove('maximized', 'closing-window', 'is-minimized');
            panel.style.position = '';
            panel.style.top = '';
            panel.style.left = '';
            panel.style.width = '';
            panel.style.height = '';
            panel.style.zIndex = '';
        });
        destroy();
        window.civicGameLaunched = false;
    }

    function destroy() {
        cancelAnimationFrame(animationId);
        audio.stopMusic();
        document.removeEventListener('keydown', handleGlobalKeys);
        window.removeEventListener('resize', resizeCanvas);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        padCleanups.forEach(fn => fn());
        backdrop.remove();
    }

    function handleVisibilityChange() {
        paused = document.hidden || paused;
        lastTime = performance.now();
    }

    const padCleanups = [];
    function bindControls() {
        backdrop.querySelectorAll('.agentic-game-pad').forEach(button => {
            const down = e => { e.preventDefault(); setDirection(button.dataset.dir); button.classList.add('is-active'); };
            const up = () => button.classList.remove('is-active');
            button.addEventListener('pointerdown', down);
            button.addEventListener('pointerup', up);
            button.addEventListener('pointerleave', up);
            padCleanups.push(() => { button.removeEventListener('pointerdown', down); button.removeEventListener('pointerup', up); button.removeEventListener('pointerleave', up); });
        });

        let touchStart = null;
        const ts = e => { const t = e.changedTouches[0]; touchStart = { x: t.clientX, y: t.clientY }; };
        const te = e => {
            if (!touchStart) { return; }
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            touchStart = null;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
                startOrRetry();
                return;
            }
            if (Math.abs(dx) > Math.abs(dy)) { setDirection(dx > 0 ? 'right' : 'left'); }
            else { setDirection(dy > 0 ? 'down' : 'up'); }
        };
        // Click / tap on a side of the board steers that way (top=up, bottom=down, left, right).
        const clickSteer = e => {
            if (state !== 'play') { startOrRetry(); return; }
            const rect = canvas.getBoundingClientRect();
            const dx = (e.clientX - rect.left) - rect.width / 2;
            const dy = (e.clientY - rect.top) - rect.height / 2;
            if (Math.abs(dx) > Math.abs(dy)) { setDirection(dx > 0 ? 'right' : 'left'); }
            else { setDirection(dy > 0 ? 'down' : 'up'); }
        };
        canvas.addEventListener('touchstart', ts, { passive: true });
        canvas.addEventListener('touchend', te, { passive: true });
        canvas.addEventListener('click', clickSteer);
        padCleanups.push(() => { canvas.removeEventListener('touchstart', ts); canvas.removeEventListener('touchend', te); canvas.removeEventListener('click', clickSteer); });
    }

    resetBoard(true);
    state = 'title';
    bindControls();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    lastTime = performance.now();
    animationId = requestAnimationFrame(loop);

    return {
        destroy, restart, restore, handleGlobalKeys,
        toggleMute: () => { const m = audio.toggleMute(); return m; },
        setPaused: (v) => { paused = v; lastTime = performance.now(); }
    };
}

function initPathwaySelector() {
    const selector = document.querySelector('[data-pathway-selector]');
    if (!selector) {
        return;
    }

    const tabs = Array.from(selector.querySelectorAll('[data-pathway-tab]'));
    const panels = Array.from(selector.querySelectorAll('[data-pathway-panel]'));
    const validPathways = tabs.map(tab => tab.dataset.pathwayTab);

    function activatePathway(pathway, options = {}) {
        if (!validPathways.includes(pathway)) {
            return;
        }

        tabs.forEach(tab => {
            const selected = tab.dataset.pathwayTab === pathway;
            tab.classList.toggle('is-active', selected);
            tab.setAttribute('aria-selected', String(selected));
            tab.setAttribute('tabindex', selected ? '0' : '-1');
            if (selected && options.focus) {
                tab.focus();
            }
        });

        panels.forEach(panel => {
            panel.hidden = panel.dataset.pathwayPanel !== pathway;
        });

        if (options.updateHash !== false) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${pathway}`);
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activatePathway(tab.dataset.pathwayTab));
        tab.addEventListener('keydown', e => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                return;
            }
            e.preventDefault();
            let nextIndex = index;
            if (e.key === 'Home') nextIndex = 0;
            if (e.key === 'End') nextIndex = tabs.length - 1;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
            activatePathway(tabs[nextIndex].dataset.pathwayTab, { focus: true });
        });
    });

    const requestedPathway = window.location.hash.slice(1);
    activatePathway(validPathways.includes(requestedPathway) ? requestedPathway : validPathways[0], { updateHash: false });
}

// Retro effects
function initRetroEffects() {
    // Random retro messages
    const retroMessages = [
        "Loading... Please wait...",
        "System is Y2K compliant!",
        "Best viewed in 1024x768",
        "Optimized for Internet Explorer 6.0",
        "This site uses cutting-edge JavaScript!",
        "Now with 256 colors!",
        "Geocities approved!",
        "Web 1.0 Forever!"
    ];
    
    // Add random message to status bar if it exists
    const statusBar = document.querySelector('.status-bar .status-left');
    if (statusBar && Math.random() > 0.7) {
        const message = retroMessages[Math.floor(Math.random() * retroMessages.length)];
        const messageElement = document.createElement('span');
        messageElement.className = 'status-item';
        messageElement.textContent = message;
        statusBar.appendChild(messageElement);
    }
    
    // Add retro cursor trail effect (optional)
    if (localStorage.getItem('retroCursor') === 'true') {
        initCursorTrail();
    }
    
    // Konami code easter egg
    initKonamiCode();
}

function initCursorTrail() {
    let trail = [];
    document.addEventListener('mousemove', function(e) {
        trail.push({x: e.clientX, y: e.clientY, time: Date.now()});
        
        // Remove old trail points
        trail = trail.filter(point => Date.now() - point.time < 500);
        
        // Create trail elements
        trail.forEach((point, index) => {
            if (index % 3 === 0) { // Only every 3rd point to reduce clutter
                const dot = document.createElement('div');
                dot.style.position = 'fixed';
                dot.style.left = point.x + 'px';
                dot.style.top = point.y + 'px';
                dot.style.width = '3px';
                dot.style.height = '3px';
                dot.style.backgroundColor = '#00ffff';
                dot.style.borderRadius = '50%';
                dot.style.pointerEvents = 'none';
                dot.style.zIndex = '9999';
                dot.style.opacity = (500 - (Date.now() - point.time)) / 500;
                document.body.appendChild(dot);
                
                setTimeout(() => {
                    if (dot.parentNode) {
                        dot.parentNode.removeChild(dot);
                    }
                }, 500);
            }
        });
    });
}

function initKonamiCode() {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateRetroMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function initStatusClock() {
    const dateElement = document.querySelector('.status-date');
    const timeElement = document.querySelector('.status-time');
    if (!dateElement || !timeElement) {
        return;
    }

    const updateClock = () => {
        const now = new Date();
        const locale = getBrowserLocale();
        try {
            dateElement.textContent = now.toLocaleDateString(locale, {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            timeElement.textContent = now.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            dateElement.textContent = now.toDateString();
            timeElement.textContent = now.toTimeString().slice(0, 5);
        }
    };

    updateClock();
    setInterval(updateClock, 30000);
}

function getBrowserLocale() {
    const candidates = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    const locale = candidates.find(item => item && item !== 'undefined');
    return locale || 'en-US';
}

function activateRetroMode() {
    alert('🎉 RETRO MODE ACTIVATED! 🎉\n\nCursor trail enabled!\nExtra retro effects unlocked!');
    localStorage.setItem('retroCursor', 'true');
    document.body.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)';
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'retroBackground 3s ease infinite';
    
    // Add CSS animation for background
    const style = document.createElement('style');
    style.textContent = `
        @keyframes retroBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    initCursorTrail();
}

// Keyboard navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Alt + H for home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/';
        }
        
        // Alt + M for manifesto
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            window.location.href = '/#manifesto-text';
        }
        
        // Escape to minimize all windows
        if (e.key === 'Escape') {
            document.querySelectorAll('.window').forEach(panel => setWindowMinimized(panel, true));
        }
        
        // F11 for fullscreen (show message)
        if (e.key === 'F11') {
            e.preventDefault();
            alert('F11 detected! If this were a real 90s browser, you\'d now be in fullscreen mode! 📺');
        }
    });
}

// Image galleries
function initImageGalleries() {
    document.querySelectorAll('.image-gallery img').forEach(img => {
        img.addEventListener('click', function() {
            openLightbox(this);
        });
        
        // Add retro loading effect
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        });
    });
}

function openLightbox(img) {
    const lightbox = document.createElement('div');
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100%';
    lightbox.style.height = '100%';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    lightbox.style.zIndex = '10000';
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.cursor = 'pointer';
    
    const lightboxImg = document.createElement('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImg.style.maxWidth = '90%';
    lightboxImg.style.maxHeight = '90%';
    lightboxImg.style.border = '2px outset var(--border-dark)';
    
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', function() {
        document.body.removeChild(lightbox);
    });
    
    // ESC to close
    const closeHandler = function(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(lightbox);
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
}

// Code copy functionality
function initCodeCopy() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = '📋 Copy';
        copyButton.className = 'btn';
        copyButton.style.position = 'absolute';
        copyButton.style.top = '4px';
        copyButton.style.right = '4px';
        copyButton.style.fontSize = '8px';
        copyButton.style.padding = '2px 4px';
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                copyButton.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyButton.textContent = '📋 Copy';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = codeBlock.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyButton.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyButton.textContent = '📋 Copy';
                }, 2000);
            });
        });
    });
}

// Simple search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const posts = document.querySelectorAll('.post-list-item');
            
            posts.forEach(post => {
                const title = post.querySelector('.post-list-title a').textContent.toLowerCase();
                const summary = post.querySelector('.post-list-summary');
                const summaryText = summary ? summary.textContent.toLowerCase() : '';
                
                if (title.includes(query) || summaryText.includes(query)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    }
}

// Theme persistence
function initThemePersistence() {
    // Save scroll position
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('scrollPosition', window.scrollY);
    });
    
    // Restore scroll position
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        localStorage.removeItem('scrollPosition');
    }
    
    // Remember window states
    document.querySelectorAll('.window').forEach((window, index) => {
        const savedState = localStorage.getItem(`window-${index}-minimized`);
        if (savedState === 'true') {
            setWindowMinimized(window, true);
        }
        
        // Save state when minimized
        const minimizeBtn = window.querySelector('.window-button');
        if (minimizeBtn && minimizeBtn.textContent === '_') {
            minimizeBtn.addEventListener('click', function() {
                localStorage.setItem(`window-${index}-minimized`, window.classList.contains('is-minimized'));
            });
        }
    });
}

// Utility functions
let retroAudioContext = null;

function playRetroSound(type) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return;
    }

    if (!retroAudioContext || retroAudioContext.state === 'closed') {
        retroAudioContext = new AudioContext();
    }

    const play = () => {
        const oscillator = retroAudioContext.createOscillator();
        const gainNode = retroAudioContext.createGain();
        const now = retroAudioContext.currentTime;

        oscillator.connect(gainNode);
        gainNode.connect(retroAudioContext.destination);

        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                break;
            case 'error':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(190, now);
                oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.24);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                break;
        }

        gainNode.gain.setValueAtTime(0.055, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        oscillator.start(now);
        oscillator.stop(now + 0.27);
    };

    if (retroAudioContext.state === 'suspended') {
        retroAudioContext.resume().then(play).catch(() => {});
    } else {
        play();
    }
}

// Party deployment-topology CRT canvas engine
function initPartyTopology() {
    const root = document.querySelector('[data-topo]');
    if (!root) return;
    const canvas = root.querySelector('[data-topo-canvas]');
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) return; // no canvas support -> static text description carries the meaning

    const btns = Array.from(root.querySelectorAll('[data-topo-mode]'));
    const caption = root.querySelector('[data-topo-caption]');
    const modes = ['single', 'shared', 'federated'];
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const DESIGN_W = 340, DESIGN_H = 180;
    const accent = (getComputedStyle(root).getPropertyValue('--pathway-accent').trim()) || '#a93a5f';
    const COLOR = { bg: '#11131a', box: '#171a24', label: '#d5f0ce', platform: '#8ad6ff', feed: '#7cf5b4', mesh: '#ffd36d', packet: '#f3a0cf' };

    // All node centers/sizes in a fixed 340x180 design space, scaled to fit the canvas.
    const MODEL = {
        single: {
            aria: 'Single deployment: one political party connected to one dedicated platform.',
            caption: '<span class="prompt">mode:</span> SINGLE <span class="term-accent">// one party · one dedicated platform</span>',
            nodes: [
                { id: 'p', kind: 'party', x: 80, y: 90, w: 66, h: 36, label: 'PARTY' },
                { id: 'pf', kind: 'platform', x: 252, y: 90, w: 98, h: 48, label: 'PLATFORM' }
            ],
            links: [{ a: 'p', b: 'pf', kind: 'feed' }]
        },
        shared: {
            aria: 'Shared deployment: several political parties hosted together on one shared multi-tenant platform.',
            caption: '<span class="prompt">mode:</span> SHARED <span class="term-accent">// many parties · one multi-tenant platform</span>',
            nodes: [
                { id: 'hub', kind: 'hub', x: 170, y: 90, w: 108, h: 52, label: 'PLATFORM' },
                { id: 'p1', kind: 'party', x: 52, y: 40, w: 58, h: 30, label: 'PARTY' },
                { id: 'p2', kind: 'party', x: 52, y: 140, w: 58, h: 30, label: 'PARTY' },
                { id: 'p3', kind: 'party', x: 288, y: 40, w: 58, h: 30, label: 'PARTY' },
                { id: 'p4', kind: 'party', x: 288, y: 140, w: 58, h: 30, label: 'PARTY' }
            ],
            links: [
                { a: 'p1', b: 'hub', kind: 'feed' }, { a: 'p2', b: 'hub', kind: 'feed' },
                { a: 'p3', b: 'hub', kind: 'feed' }, { a: 'p4', b: 'hub', kind: 'feed' }
            ]
        },
        federated: {
            aria: 'Federated deployment: each party runs its own platform, and the platforms interlink with each other.',
            caption: '<span class="prompt">mode:</span> FEDERATED <span class="term-accent">// each party · own platform · interlinked</span>',
            nodes: [
                { id: 'a_p', kind: 'party', x: 170, y: 30, w: 52, h: 26, label: 'PARTY' },
                { id: 'a_f', kind: 'platform', x: 170, y: 78, w: 56, h: 28, label: 'NODE' },
                { id: 'b_p', kind: 'party', x: 44, y: 154, w: 52, h: 26, label: 'PARTY' },
                { id: 'b_f', kind: 'platform', x: 104, y: 132, w: 56, h: 28, label: 'NODE' },
                { id: 'c_p', kind: 'party', x: 296, y: 154, w: 52, h: 26, label: 'PARTY' },
                { id: 'c_f', kind: 'platform', x: 236, y: 132, w: 56, h: 28, label: 'NODE' }
            ],
            links: [
                { a: 'a_p', b: 'a_f', kind: 'feed' }, { a: 'b_p', b: 'b_f', kind: 'feed' }, { a: 'c_p', b: 'c_f', kind: 'feed' },
                { a: 'a_f', b: 'b_f', kind: 'mesh' }, { a: 'b_f', b: 'c_f', kind: 'mesh' }, { a: 'c_f', b: 'a_f', kind: 'mesh' }
            ]
        }
    };

    let mode = 'single', pinned = false, cycleT = 0, elapsed = 0;
    let raf = null, lastTime = 0, cssW = 0, cssH = DESIGN_H;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        cssW = rect.width || root.clientWidth || DESIGN_W;
        cssH = rect.height || DESIGN_H;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function draw() {
        const m = MODEL[mode];
        const scale = Math.min(cssW / DESIGN_W, cssH / DESIGN_H);
        const ox = (cssW - DESIGN_W * scale) / 2;
        const oy = (cssH - DESIGN_H * scale) / 2;
        const TX = function (x) { return ox + x * scale; };
        const TY = function (y) { return oy + y * scale; };
        const node = function (id) { return m.nodes.find(function (n) { return n.id === id; }); };

        ctx.fillStyle = COLOR.bg;
        ctx.fillRect(0, 0, cssW, cssH);

        // links: chunky marching ants
        const dash = 6 * scale;
        const dashOffset = -(Math.floor(elapsed * 8) % 4) * dash;
        m.links.forEach(function (l) {
            const a = node(l.a), b = node(l.b);
            ctx.save();
            ctx.strokeStyle = l.kind === 'mesh' ? COLOR.mesh : COLOR.feed;
            ctx.lineWidth = Math.max(1.4, 1.8 * scale);
            ctx.setLineDash([dash, dash]);
            ctx.lineDashOffset = dashOffset;
            ctx.shadowBlur = 6;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            ctx.moveTo(TX(a.x), TY(a.y));
            ctx.lineTo(TX(b.x), TY(b.y));
            ctx.stroke();
            ctx.restore();
        });

        // packets: quantized position for retro low-framerate feel
        const phase = Math.floor(((elapsed * 0.5) % 1) * 10) / 10;
        const s = Math.max(3, 4.5 * scale);
        m.links.forEach(function (l) {
            const a = node(l.a), b = node(l.b);
            [phase, (phase + 0.5) % 1].forEach(function (t) {
                const px = TX(a.x) + (TX(b.x) - TX(a.x)) * t;
                const py = TY(a.y) + (TY(b.y) - TY(a.y)) * t;
                ctx.save();
                ctx.fillStyle = COLOR.packet;
                ctx.shadowBlur = 8;
                ctx.shadowColor = COLOR.packet;
                ctx.fillRect(px - s / 2, py - s / 2, s, s);
                ctx.restore();
            });
        });

        // nodes
        m.nodes.forEach(function (n) {
            const cx = TX(n.x), cy = TY(n.y), w = n.w * scale, h = n.h * scale;
            const stroke = n.kind === 'party' ? accent : COLOR.platform;
            ctx.save();
            ctx.fillStyle = COLOR.box;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = Math.max(1.5, 2 * scale);
            ctx.shadowBlur = 10;
            ctx.shadowColor = stroke;
            roundRect(cx - w / 2, cy - h / 2, w, h, 3 * scale);
            ctx.fill();
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.fillStyle = COLOR.label;
            ctx.font = '700 ' + Math.max(8, 10 * scale) + 'px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.label, cx, cy);
            ctx.restore();
        });

        // hub "online" LED (shared mode)
        if (mode === 'shared') {
            const hub = node('hub');
            const on = Math.floor(elapsed * 1.5) % 2 === 0;
            ctx.save();
            ctx.fillStyle = on ? COLOR.feed : '#2a5c44';
            if (on) { ctx.shadowBlur = 8; ctx.shadowColor = COLOR.feed; }
            ctx.beginPath();
            ctx.arc(TX(hub.x) + (hub.w * scale) / 2 - 6 * scale, TY(hub.y) - (hub.h * scale) / 2 + 6 * scale, Math.max(2, 2.6 * scale), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawStatic() { draw(); }

    function setMode(m) {
        mode = m;
        root.dataset.topoActive = m;
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.topoMode === m)); });
        canvas.setAttribute('aria-label', MODEL[m].aria);
        if (caption) caption.innerHTML = MODEL[m].caption;
        if (reduce) drawStatic();
    }

    function pin(m) { pinned = true; setMode(m); if (reduce) drawStatic(); else start(); }

    function loop(time) {
        const dt = Math.min(0.033, (time - lastTime) / 1000);
        lastTime = time;
        elapsed += dt;
        if (!pinned) {
            cycleT += dt;
            if (cycleT >= 4.5) { cycleT = 0; setMode(modes[(modes.indexOf(mode) + 1) % modes.length]); }
        }
        draw();
        raf = requestAnimationFrame(loop);
    }

    function start() {
        if (raf || reduce) return;
        lastTime = performance.now();
        raf = requestAnimationFrame(loop);
    }

    function stop() {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    btns.forEach(function (b) { b.addEventListener('click', function () { pin(b.dataset.topoMode); }); });
    window.addEventListener('resize', function () { resize(); if (!raf) drawStatic(); });

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { resize(); reduce ? drawStatic() : start(); }
                else { stop(); }
            });
        }, { threshold: 0.25 });
        io.observe(root);
    } else {
        resize();
        reduce ? drawStatic() : start();
    }

    setMode('single');
    resize();
    drawStatic();
}

// Export functions for global use
window.VintageTheme = {
    playRetroSound,
    activateRetroMode,
    openLightbox
};

console.log('🖥️ Vintage Web Theme loaded! Press ↑↑↓↓←→←→BA for a surprise! 🎮');

// Shared CRT-card animation engine for the "How it works" page.
// Each <canvas data-crt="name"> is driven by a module in CRT_ANIMS.
function crtRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Penrose "impossible triangle" emblem — three beams overlapping cyclically.
function crtTribar(ctx, cx, cy, u, rot, col) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(u, u);
    ctx.lineJoin = 'round';
    var Rt = 2.15, w = 0.72, ext = w * 0.95;
    var pts = [];
    for (var k = 0; k < 3; k++) {
        var a = -Math.PI / 2 + k * 2 * Math.PI / 3;
        pts.push({ x: Math.cos(a) * Rt, y: Math.sin(a) * Rt });
    }
    for (var k2 = 0; k2 < 3; k2++) {
        var A = pts[k2], B = pts[(k2 + 1) % 3];
        var dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
        var ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
        var A2 = { x: A.x - ux * ext, y: A.y - uy * ext };
        var B2 = { x: B.x + ux * ext, y: B.y + uy * ext };
        var Ai = { x: A2.x + nx * w, y: A2.y + ny * w };
        var Bi = { x: B2.x + nx * w, y: B2.y + ny * w };
        var Ao = { x: A2.x - nx * w * 0.5, y: A2.y - ny * w * 0.5 };
        var Bo = { x: B2.x - nx * w * 0.5, y: B2.y - ny * w * 0.5 };
        // outer (top) strip for a hint of 3D
        ctx.fillStyle = '#123f2f';
        ctx.beginPath(); ctx.moveTo(A2.x, A2.y); ctx.lineTo(B2.x, B2.y); ctx.lineTo(Bo.x, Bo.y); ctx.lineTo(Ao.x, Ao.y); ctx.closePath(); ctx.fill();
        // front face
        ctx.fillStyle = '#1c6349';
        ctx.strokeStyle = col; ctx.lineWidth = 0.13;
        ctx.beginPath(); ctx.moveTo(A2.x, A2.y); ctx.lineTo(B2.x, B2.y); ctx.lineTo(Bi.x, Bi.y); ctx.lineTo(Ai.x, Ai.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
    }
    ctx.restore();
}

var CRT_ANIMS = {
    // Platform hero — isometric modular platform that re-tessellates (customizable) + impossible triangle
    escher: {
        view: { w: 384, h: 240 },
        setup: function (s, e) {
            s.N = 6; s.tile = 30; s.ch = 24; s.ox = e.W / 2; s.oy = 62;
            s.labels = { '1,1': 'LISTEN', '4,1': 'VOTE', '1,4': 'LEDGER', '4,4': 'GROUPS', '2,3': 'DELEGATE' };
        },
        draw: function (ctx, s, e) {
            var t = e.t;
            function H(i, j) { return 0.65 + 0.55 * Math.sin(i * 0.8 + j * 0.6 + t * 0.85) + 0.28 * Math.sin((i + j) * 0.55 - t * 0.6); }
            function iso(i, j, h) { return { x: s.ox + (i - j) * s.tile, y: s.oy + (i + j) * s.tile * 0.5 - h * s.ch }; }
            var TOP = '#5fe6a6', LF = '#2b8060', RF = '#17553f', EDGE = '#a9ffd0';
            var cells = [];
            for (var i = 0; i < s.N; i++) { for (var j = 0; j < s.N; j++) { cells.push([i, j]); } }
            cells.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]; });
            cells.forEach(function (c) {
                var i = c[0], j = c[1], h = Math.max(0.15, H(i, j));
                var A = iso(i, j, h), B = iso(i + 1, j, h), C = iso(i + 1, j + 1, h), D = iso(i, j + 1, h);
                var Bg = iso(i + 1, j, 0), Cg = iso(i + 1, j + 1, 0), Dg = iso(i, j + 1, 0);
                ctx.fillStyle = RF; ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(Cg.x, Cg.y); ctx.lineTo(Bg.x, Bg.y); ctx.closePath(); ctx.fill();
                ctx.fillStyle = LF; ctx.beginPath(); ctx.moveTo(D.x, D.y); ctx.lineTo(C.x, C.y); ctx.lineTo(Cg.x, Cg.y); ctx.lineTo(Dg.x, Dg.y); ctx.closePath(); ctx.fill();
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = TOP; }
                ctx.fillStyle = TOP; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(D.x, D.y); ctx.closePath(); ctx.fill(); ctx.restore();
                ctx.strokeStyle = EDGE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(D.x, D.y); ctx.closePath(); ctx.stroke();
                var key = i + ',' + j;
                if (s.labels[key]) {
                    var mid = iso(i + 0.5, j + 0.5, h);
                    ctx.globalAlpha = 0.5 + 0.45 * Math.sin(t * 1.4 + i + j);
                    ctx.fillStyle = '#06231a'; ctx.font = '700 8px "Courier New", monospace';
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.labels[key], mid.x, mid.y); ctx.globalAlpha = 1;
                }
            });
            crtTribar(ctx, e.W - 52, 48, 15, Math.sin(t * 0.3) * 0.06, EDGE);
            ctx.fillStyle = '#8aa290'; ctx.font = '700 9px "Courier New", monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('platform.morph  ·  reconfiguring modules', 10, e.H - 16);
        }
    },

    // 02 — attract people; connect citizens to elected representatives
    reach: {
        setup: function (s, e) {
            s.hub = { x: e.W / 2, y: e.H / 2 };
            s.dots = [];
            s.docked = [];
            s.count = 0;
            s.spawnT = 0;
            s.slots = 20;
            for (var k = 0; k < 9; k++) {
                var a0 = (k / s.slots) * Math.PI * 2, r0 = 30 + (k % 3) * 9;
                s.docked[k] = { x: s.hub.x + Math.cos(a0) * r0, y: s.hub.y + Math.sin(a0) * r0, rep: k % 5 === 0 };
            }
            s.count = 9;
        },
        update: function (dt, s, e) {
            s.spawnT -= dt;
            if (s.spawnT <= 0 && s.dots.length < 8) {
                s.spawnT = 0.28;
                var side = Math.floor(e.rand(0, 4));
                var x = side === 0 ? 0 : side === 2 ? e.W : e.rand(0, e.W);
                var y = side === 1 ? 0 : side === 3 ? e.H : e.rand(0, e.H);
                s.dots.push({ x: x, y: y });
            }
            for (var i = s.dots.length - 1; i >= 0; i--) {
                var d = s.dots[i];
                var dx = s.hub.x - d.x, dy = s.hub.y - d.y;
                var dist = Math.hypot(dx, dy) || 1;
                d.x += (dx / dist) * 70 * dt;
                d.y += (dy / dist) * 70 * dt;
                if (dist < 30) {
                    var idx = s.count % s.slots;
                    var ang = (idx / s.slots) * Math.PI * 2;
                    var rad = 30 + (idx % 3) * 9;
                    s.docked[idx] = {
                        x: s.hub.x + Math.cos(ang) * rad,
                        y: s.hub.y + Math.sin(ang) * rad,
                        rep: s.count % 5 === 0
                    };
                    s.count++;
                    s.dots.splice(i, 1);
                }
            }
        },
        draw: function (ctx, s, e) {
            var reps = s.docked.filter(function (d) { return d && d.rep; });
            // links reps -> hub
            ctx.strokeStyle = 'rgba(124,245,180,0.5)';
            ctx.lineWidth = 1;
            reps.forEach(function (d) {
                ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(s.hub.x, s.hub.y); ctx.stroke();
            });
            // docked citizens
            s.docked.forEach(function (d) {
                if (!d) { return; }
                ctx.save();
                if (!e.reduce) { ctx.shadowBlur = 6; ctx.shadowColor = d.rep ? e.COL.amber : e.COL.cyan; }
                ctx.fillStyle = d.rep ? e.COL.amber : e.COL.cyan;
                if (d.rep) { crtRoundRect(ctx, d.x - 4, d.y - 4, 8, 8, 2); ctx.fill(); }
                else { ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, Math.PI * 2); ctx.fill(); }
                ctx.restore();
            });
            // incoming
            ctx.fillStyle = e.COL.dim;
            s.dots.forEach(function (d) { ctx.beginPath(); ctx.arc(d.x, d.y, 2.4, 0, Math.PI * 2); ctx.fill(); });
            // hub
            ctx.save();
            if (!e.reduce) { ctx.shadowBlur = 12; ctx.shadowColor = e.COL.green; }
            ctx.fillStyle = '#171a24'; ctx.strokeStyle = e.COL.green; ctx.lineWidth = 2;
            crtRoundRect(ctx, s.hub.x - 26, s.hub.y - 13, 52, 26, 4); ctx.fill(); ctx.stroke();
            ctx.restore();
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('PLATFORM', s.hub.x, s.hub.y);
            // counters
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillStyle = e.COL.cyan; ctx.fillText('citizens joined: ' + s.count, 8, 8);
            ctx.fillStyle = e.COL.amber; ctx.fillText('representatives: ' + reps.length, 8, 22);
        }
    },

    // 03 — find convergences, form teams
    converge: {
        setup: function (s, e) {
            s.groups = [
                { label: 'HOUSING WG', color: e.COL.cyan, cx: e.W * 0.24, cy: e.H * 0.42 },
                { label: 'TRANSIT WG', color: e.COL.green, cx: e.W * 0.72, cy: e.H * 0.34 },
                { label: 'ENERGY WG', color: e.COL.pink, cx: e.W * 0.5, cy: e.H * 0.76 }
            ];
            s.dots = [];
            for (var g = 0; g < 3; g++) {
                for (var i = 0; i < 6; i++) {
                    s.dots.push({ g: g, x: e.rand(20, e.W - 20), y: e.rand(20, e.H - 20), hx: e.rand(20, e.W - 20), hy: e.rand(20, e.H - 20) });
                }
            }
            s.phase = 0; s.pt = 0;
        },
        update: function (dt, s, e) {
            s.pt += dt;
            // cycle: 0 scatter (2.6s) -> 1 converge (4s) -> back
            if (s.phase === 0 && s.pt > 2.6) { s.phase = 1; s.pt = 0; }
            else if (s.phase === 1 && s.pt > 4.2) {
                s.phase = 0; s.pt = 0;
                s.dots.forEach(function (d) { d.hx = e.rand(20, e.W - 20); d.hy = e.rand(20, e.H - 20); });
            }
            s.dots.forEach(function (d) {
                var grp = s.groups[d.g];
                var tx = s.phase === 1 ? grp.cx + Math.cos(d.hx) * 16 : d.hx;
                var ty = s.phase === 1 ? grp.cy + Math.sin(d.hy) * 16 : d.hy;
                d.x += (tx - d.x) * Math.min(1, dt * 2.2);
                d.y += (ty - d.y) * Math.min(1, dt * 2.2);
            });
        },
        draw: function (ctx, s, e) {
            var conv = s.phase === 1;
            if (conv) {
                s.groups.forEach(function (grp) {
                    ctx.strokeStyle = grp.color; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
                    var members = s.dots.filter(function (d) { return d.g === s.groups.indexOf(grp); });
                    for (var a = 0; a < members.length; a++) {
                        for (var b = a + 1; b < members.length; b++) {
                            ctx.beginPath(); ctx.moveTo(members[a].x, members[a].y); ctx.lineTo(members[b].x, members[b].y); ctx.stroke();
                        }
                    }
                    ctx.globalAlpha = 1;
                    // labeled box
                    ctx.setLineDash([4, 3]); ctx.strokeStyle = grp.color; ctx.lineWidth = 1.5;
                    crtRoundRect(ctx, grp.cx - 34, grp.cy - 26, 68, 52, 5); ctx.stroke(); ctx.setLineDash([]);
                    ctx.fillStyle = grp.color; ctx.font = '700 8px "Courier New", monospace';
                    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
                    ctx.fillText(grp.label, grp.cx, grp.cy - 28);
                });
            }
            s.dots.forEach(function (d) {
                var c = s.groups[d.g].color;
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = 6; ctx.shadowColor = c; }
                ctx.fillStyle = c; crtRoundRect(ctx, d.x - 4, d.y - 4, 8, 8, 2); ctx.fill(); ctx.restore();
            });
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New", monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText(conv ? 'convergence found -> working groups' : 'scanning positions...', 8, 8);
        }
    },

    // 05 — transparency, no corruption
    ledger: {
        view: { w: 330, h: 165 },
        setup: function (s, e) {
            s.actions = ['proposal filed', 'vote recorded', 'fund allocated', 'minutes published', 'amendment logged', 'delegate assigned'];
            s.rows = [];
            s.addT = 1.1; s.n = 1042; s.tamperT = 5; s.tampered = -1;
            for (var k = 0; k < 5; k++) {
                s.rows.push({ label: s.actions[k % s.actions.length], hash: (s.n++).toString(16), ok: true, flash: 0 });
            }
        },
        update: function (dt, s, e) {
            s.addT -= dt;
            if (s.addT <= 0) {
                s.addT = 1.3;
                s.rows.push({ label: s.actions[Math.floor(e.rand(0, s.actions.length))], hash: (s.n++).toString(16), ok: true, flash: 1 });
                if (s.rows.length > 6) { s.rows.shift(); }
            }
            s.rows.forEach(function (r) { if (r.flash > 0) { r.flash = Math.max(0, r.flash - dt); } });
            s.tamperT -= dt;
            if (s.tamperT <= 0 && s.rows.length > 2) {
                s.tamperT = 6;
                s.tampered = Math.floor(e.rand(0, s.rows.length - 1));
                s.rows[s.tampered].tamper = 1.4;
            }
            s.rows.forEach(function (r) { if (r.tamper > 0) { r.tamper = Math.max(0, r.tamper - dt); } });
        },
        draw: function (ctx, s, e) {
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.font = '700 9px "Courier New", monospace';
            ctx.fillStyle = e.COL.dim;
            ctx.fillText('public-ledger.sh  ·  append-only  ·  signed', 10, 12);
            var y = 30;
            s.rows.forEach(function (r) {
                var tampering = r.tamper > 0;
                if (tampering) {
                    ctx.fillStyle = e.COL.red;
                    ctx.fillText('✗ TAMPER DETECTED  #' + r.hash + '  -> rejected', 10, y);
                } else {
                    ctx.fillStyle = r.flash > 0 ? e.COL.text : e.COL.green;
                    ctx.fillText('✓', 10, y);
                    ctx.fillStyle = r.flash > 0 ? e.COL.text : '#a7c0a2';
                    ctx.fillText(r.label, 24, y);
                    ctx.fillStyle = e.COL.dim;
                    ctx.fillText('#' + r.hash, e.W - 70, y);
                }
                y += 22;
            });
        }
    },

    // 06 — a person is more than an elector
    roles: {
        setup: function (s, e) {
            s.roles = ['ELECTOR', 'CONTRIBUTOR', 'ACTIVIST', 'WORKING GROUP', 'DELEGATE'];
            s.colors = [e.COL.cyan, e.COL.green, e.COL.amber, e.COL.pink, e.COL.purple];
            s.cx = e.W / 2; s.cy = e.H / 2 + 6;
            s.lit = 0; s.t = 0; s.hold = 0;
        },
        update: function (dt, s, e) {
            if (s.hold > 0) { s.hold -= dt; if (s.hold <= 0) { s.lit = 0; } return; }
            s.t += dt;
            if (s.t > 0.9) {
                s.t = 0; s.lit++;
                if (s.lit >= s.roles.length) { s.lit = s.roles.length; s.hold = 1.8; }
            }
        },
        draw: function (ctx, s, e) {
            var n = s.roles.length;
            var R = 58;
            for (var i = 0; i < n; i++) {
                var ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
                var x = s.cx + Math.cos(ang) * R;
                var y = s.cy + Math.sin(ang) * R * 0.72;
                var on = i < s.lit;
                ctx.strokeStyle = on ? s.colors[i] : 'rgba(150,170,150,0.25)';
                ctx.lineWidth = on ? 1.6 : 1;
                ctx.beginPath(); ctx.moveTo(s.cx, s.cy); ctx.lineTo(x, y); ctx.stroke();
                ctx.save();
                if (on && !e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = s.colors[i]; }
                ctx.fillStyle = on ? s.colors[i] : '#20242c';
                crtRoundRect(ctx, x - 30, y - 8, 60, 16, 4); ctx.fill();
                ctx.restore();
                ctx.fillStyle = on ? '#0a0d15' : '#6f8470';
                ctx.font = '700 8px "Courier New", monospace';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(s.roles[i], x, y);
            }
            // center citizen node
            ctx.save();
            if (!e.reduce) { ctx.shadowBlur = 12; ctx.shadowColor = e.COL.text; }
            ctx.fillStyle = e.COL.text;
            ctx.beginPath(); ctx.arc(s.cx, s.cy - 4, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(s.cx - 8, s.cy + 8);
            ctx.quadraticCurveTo(s.cx, s.cy - 2, s.cx + 8, s.cy + 8);
            ctx.closePath(); ctx.fill();
            ctx.restore();
            ctx.fillStyle = e.COL.dim; ctx.font = '700 9px "Courier New", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText('one person  ·  many roles', s.cx, 8);
        }
    },

    // 06 — a party where the citizens are happy
    celebrate: {
        setup: function (s, e) {
            var cols = [e.COL.cyan, e.COL.green, e.COL.amber, e.COL.pink, e.COL.purple, e.COL.green, e.COL.cyan, e.COL.amber];
            s.people = [];
            for (var i = 0; i < 8; i++) {
                s.people.push({ x: e.W * (0.09 + 0.82 * i / 7), ph: e.rand(0, 6.28), col: cols[i % cols.length] });
            }
            s.conf = []; s.spawnT = 0;
            for (var k = 0; k < 40; k++) {
                s.conf.push({ x: e.rand(0, e.W), y: e.rand(0, e.H), vx: e.rand(-14, 14), vy: e.rand(28, 66), r: e.rand(0, 6.28), vr: e.rand(-4, 4), col: [e.COL.cyan, e.COL.amber, e.COL.pink, e.COL.purple, e.COL.green][k % 5] });
            }
        },
        update: function (dt, s, e) {
            s.spawnT -= dt;
            if (s.spawnT <= 0) {
                s.spawnT = 0.06;
                var cc = [e.COL.cyan, e.COL.amber, e.COL.pink, e.COL.purple, e.COL.green];
                s.conf.push({ x: e.rand(0, e.W), y: -6, vx: e.rand(-14, 14), vy: e.rand(28, 66), r: e.rand(0, 6.28), vr: e.rand(-4, 4), col: cc[Math.floor(e.rand(0, cc.length))] });
            }
            for (var i = s.conf.length - 1; i >= 0; i--) {
                var c = s.conf[i];
                c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
                if (c.y > e.H + 8) { s.conf.splice(i, 1); }
            }
            if (s.conf.length > 90) { s.conf.splice(0, s.conf.length - 90); }
        },
        draw: function (ctx, s, e) {
            var t = e.t, base = e.H - 26;
            s.conf.forEach(function (c) {
                ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
                ctx.fillStyle = c.col; ctx.fillRect(-3, -2, 6, 4); ctx.restore();
            });
            s.people.forEach(function (p) {
                var bounce = Math.abs(Math.sin(t * 3 + p.ph)) * 9;
                var x = p.x, y = base - bounce;
                ctx.save();
                if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = p.col; }
                ctx.fillStyle = p.col;
                ctx.beginPath();
                ctx.moveTo(x - 8, y + 11);
                ctx.quadraticCurveTo(x - 7, y, x, y);
                ctx.quadraticCurveTo(x + 7, y, x + 8, y + 11);
                ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.arc(x, y - 5, 4.4, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                ctx.strokeStyle = '#0a0d15'; ctx.lineWidth = 0.9;
                ctx.beginPath(); ctx.arc(x, y - 5, 2.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
                ctx.strokeStyle = p.col; ctx.lineWidth = 1.4;
                var aw = Math.sin(t * 3 + p.ph) * 2;
                ctx.beginPath(); ctx.moveTo(x - 6, y + 2); ctx.lineTo(x - 11, y - 6 + aw); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + 6, y + 2); ctx.lineTo(x + 11, y - 6 - aw); ctx.stroke();
            });
            ctx.strokeStyle = 'rgba(124,245,180,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(6, base + 12); ctx.lineTo(e.W - 6, base + 12); ctx.stroke();
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText('a party people are glad to belong to', e.W / 2, 8);
        }
    }
    ,
    // 03 — listening without flattening (synthesis)
    synthesize: {
        setup: function (s, e) {
            s.themes = [
                { y: e.H * 0.28, count: 4, color: e.COL.cyan, label: 'HOUSING' },
                { y: e.H * 0.55, count: 4, color: e.COL.green, label: 'TRANSIT' },
                { y: e.H * 0.82, count: 4, color: e.COL.pink, label: 'CLIMATE' }
            ];
            s.inputs = []; s.dissent = []; s.spawnT = 0; s.disT = 2;
            s.tx = e.W * 0.6;
        },
        update: function (dt, s, e) {
            s.spawnT -= dt;
            if (s.spawnT <= 0) {
                s.spawnT = 0.1;
                var th = s.themes[Math.floor(e.rand(0, 3))];
                s.inputs.push({ x: e.rand(0, e.W * 0.12), y: e.rand(10, e.H - 10), th: th, spd: e.rand(55, 95) });
            }
            for (var i = s.inputs.length - 1; i >= 0; i--) {
                var p = s.inputs[i];
                p.x += p.spd * dt; p.y += (p.th.y - p.y) * Math.min(1, dt * 2);
                if (p.x >= s.tx) { p.th.count = Math.min(15, p.th.count + 1); s.inputs.splice(i, 1); }
            }
            s.disT -= dt;
            if (s.disT <= 0) {
                s.disT = 3;
                var th2 = s.themes[Math.floor(e.rand(0, 3))];
                s.dissent.push({ th: th2, x: s.tx + th2.count * 6 + e.rand(14, 30), y: th2.y + e.rand(-9, 9), life: 3 });
            }
            s.dissent.forEach(function (d) { d.life -= dt; });
            s.dissent = s.dissent.filter(function (d) { return d.life > 0; });
            s.themes.forEach(function (t) { t.count = Math.max(3, t.count - dt * 1.1); });
        },
        draw: function (ctx, s, e) {
            ctx.fillStyle = e.COL.dim;
            s.inputs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 6.28); ctx.fill(); });
            s.themes.forEach(function (t) {
                var w = t.count * 6;
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = t.color; }
                ctx.fillStyle = t.color; crtRoundRect(ctx, s.tx, t.y - 7, w, 14, 3); ctx.fill(); ctx.restore();
                ctx.fillStyle = '#06231a'; ctx.font = '700 8px "Courier New",monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(t.label, s.tx + 4, t.y);
            });
            s.dissent.forEach(function (d) {
                ctx.globalAlpha = Math.min(1, d.life);
                ctx.strokeStyle = e.COL.amber; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
                ctx.beginPath(); ctx.moveTo(s.tx + d.th.count * 6, d.th.y); ctx.lineTo(d.x, d.y); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = e.COL.amber; crtRoundRect(ctx, d.x - 3, d.y - 3, 6, 6, 1); ctx.fill();
                ctx.globalAlpha = 1;
            });
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New",monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('themes emerge · dissent kept visible', 8, 8);
        }
    },

    // 05 — disagreement, organized (deliberation)
    deliberate: {
        setup: function (s, e) {
            s.q = { x: e.W * 0.5, y: e.H * 0.2 };
            s.pros = []; s.cons = [];
            for (var i = 0; i < 4; i++) {
                s.pros.push({ hx: e.rand(0, e.W), hy: e.rand(0, e.H), x: e.rand(0, e.W), y: e.rand(0, e.H) });
                s.cons.push({ hx: e.rand(0, e.W), hy: e.rand(0, e.H), x: e.rand(0, e.W), y: e.rand(0, e.H) });
            }
            s.phase = 0; s.pt = 0; s.proX = e.W * 0.22; s.conX = e.W * 0.78;
        },
        update: function (dt, s, e) {
            s.pt += dt;
            if (s.phase === 0 && s.pt > 2.4) { s.phase = 1; s.pt = 0; }
            else if (s.phase === 1 && s.pt > 3.8) {
                s.phase = 0; s.pt = 0;
                s.pros.concat(s.cons).forEach(function (p) { p.hx = e.rand(0, e.W); p.hy = e.rand(0, e.H); });
            }
            var org = s.phase === 1;
            function move(arr, colX) {
                arr.forEach(function (p, i) {
                    var tx = org ? colX : p.hx, ty = org ? (e.H * 0.42 + i * e.H * 0.15) : p.hy;
                    p.x += (tx - p.x) * Math.min(1, dt * 2.4);
                    p.y += (ty - p.y) * Math.min(1, dt * 2.4);
                });
            }
            move(s.pros, s.proX); move(s.cons, s.conX);
        },
        draw: function (ctx, s, e) {
            var org = s.phase === 1;
            if (org) {
                ctx.strokeStyle = 'rgba(138,162,144,0.3)'; ctx.lineWidth = 1;
                s.pros.concat(s.cons).forEach(function (p) { ctx.beginPath(); ctx.moveTo(s.q.x, s.q.y); ctx.lineTo(p.x, p.y); ctx.stroke(); });
            }
            function dots(arr, col) {
                arr.forEach(function (p) { ctx.save(); if (!e.reduce) { ctx.shadowBlur = 6; ctx.shadowColor = col; } ctx.fillStyle = col; crtRoundRect(ctx, p.x - 5, p.y - 5, 10, 10, 2); ctx.fill(); ctx.restore(); });
            }
            dots(s.pros, e.COL.green); dots(s.cons, e.COL.amber);
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = e.COL.text; }
            ctx.fillStyle = '#171a24'; ctx.strokeStyle = e.COL.text; ctx.lineWidth = 1.6;
            crtRoundRect(ctx, s.q.x - 30, s.q.y - 9, 60, 18, 4); ctx.fill(); ctx.stroke(); ctx.restore();
            ctx.fillStyle = e.COL.text; ctx.font = '700 8px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('QUESTION', s.q.x, s.q.y);
            if (org) {
                ctx.font = '700 8px "Courier New",monospace';
                ctx.fillStyle = e.COL.green; ctx.textAlign = 'center'; ctx.fillText('PRO', s.proX, e.H * 0.3);
                ctx.fillStyle = e.COL.amber; ctx.fillText('CON', s.conX, e.H * 0.3);
            }
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New",monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText(org ? 'disagreement, structured' : 'gathering arguments...', 8, 8);
        }
    },

    // 06 — a voice you can lend and reclaim (delegation)
    delegate: {
        setup: function (s, e) {
            s.cz = { x: e.W * 0.2, y: e.H * 0.52, color: e.COL.cyan };
            s.dg = { x: e.W * 0.8, y: e.H * 0.52, color: e.COL.amber };
            s.t = 0; s.phase = 0; s.topics = ['HOUSING', 'TRANSIT', 'CLIMATE']; s.ti = 0;
            s.dur = [1.4, 1.2, 1.4, 0.9];
        },
        update: function (dt, s, e) {
            s.t += dt;
            if (s.t >= s.dur[s.phase]) {
                s.t = 0; s.phase = (s.phase + 1) % 4;
                if (s.phase === 0) { s.ti = (s.ti + 1) % s.topics.length; }
            }
        },
        draw: function (ctx, s, e) {
            ctx.strokeStyle = 'rgba(138,162,144,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(s.cz.x, s.cz.y); ctx.lineTo(s.dg.x, s.dg.y); ctx.stroke();
            var tp;
            if (s.phase === 0) { var k0 = s.t / s.dur[0]; tp = { x: s.cz.x + (s.dg.x - s.cz.x) * k0, y: s.cz.y }; }
            else if (s.phase === 1) { tp = { x: s.dg.x, y: s.dg.y - 20 }; }
            else if (s.phase === 2) { var k2 = s.t / s.dur[2]; tp = { x: s.dg.x + (s.cz.x - s.dg.x) * k2, y: s.cz.y }; }
            else { tp = { x: s.cz.x, y: s.cz.y - 20 }; }
            function node(n, label, glow) {
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = glow ? 13 : 8; ctx.shadowColor = n.color; }
                ctx.fillStyle = '#171a24'; ctx.strokeStyle = n.color; ctx.lineWidth = 2;
                crtRoundRect(ctx, n.x - 30, n.y - 14, 60, 28, 5); ctx.fill(); ctx.stroke(); ctx.restore();
                ctx.fillStyle = n.color; ctx.font = '700 9px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(label, n.x, n.y);
            }
            node(s.cz, 'CITIZEN', s.phase === 3);
            node(s.dg, 'DELEGATE', s.phase === 1);
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 10; ctx.shadowColor = e.COL.pink; }
            ctx.fillStyle = e.COL.pink; crtRoundRect(ctx, tp.x - 5, tp.y - 5, 10, 10, 2); ctx.fill(); ctx.restore();
            var msg = s.phase === 0 ? 'lend your voice' : (s.phase === 1 ? 'delegate votes' : (s.phase === 2 ? 'reclaim anytime' : 'held by you'));
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New",monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('topic: ' + s.topics[s.ti] + '  ·  ' + msg, 8, 8);
        }
    },

    // 07 — listening leaves a trace (the loop closes)
    trace: {
        setup: function (s, e) {
            s.nodes = [
                { x: e.W * 0.12, y: e.H * 0.52, label: 'CITIZEN', color: e.COL.cyan },
                { x: e.W * 0.37, y: e.H * 0.24, label: 'LISTEN', color: e.COL.green },
                { x: e.W * 0.63, y: e.H * 0.24, label: 'DECIDE', color: e.COL.amber },
                { x: e.W * 0.88, y: e.H * 0.52, label: 'OUTCOME', color: e.COL.pink },
                { x: e.W * 0.5, y: e.H * 0.84, label: '', color: e.COL.cyan }
            ];
            s.seg = 0; s.t = 0; s.trail = []; s.px = s.nodes[0].x; s.py = s.nodes[0].y;
        },
        update: function (dt, s, e) {
            s.t += dt * 0.55;
            if (s.t >= 1) { s.t = 0; s.seg = (s.seg + 1) % s.nodes.length; }
            var a = s.nodes[s.seg], b = s.nodes[(s.seg + 1) % s.nodes.length];
            s.px = a.x + (b.x - a.x) * s.t; s.py = a.y + (b.y - a.y) * s.t;
            s.trail.push({ x: s.px, y: s.py, life: 0.85 });
            s.trail.forEach(function (t) { t.life -= dt; });
            s.trail = s.trail.filter(function (t) { return t.life > 0; });
            if (s.trail.length > 70) { s.trail.splice(0, s.trail.length - 70); }
        },
        draw: function (ctx, s, e) {
            ctx.strokeStyle = 'rgba(138,162,144,0.22)'; ctx.lineWidth = 1;
            for (var i = 0; i < s.nodes.length; i++) {
                var a = s.nodes[i], b = s.nodes[(i + 1) % s.nodes.length];
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            s.trail.forEach(function (t) { ctx.globalAlpha = t.life / 0.85; ctx.fillStyle = e.COL.pink; ctx.fillRect(t.x - 2, t.y - 2, 4, 4); });
            ctx.globalAlpha = 1;
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 10; ctx.shadowColor = e.COL.pink; }
            ctx.fillStyle = e.COL.pink; ctx.beginPath(); ctx.arc(s.px, s.py, 4, 0, 6.28); ctx.fill(); ctx.restore();
            s.nodes.forEach(function (n) {
                if (!n.label) { return; }
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = n.color; }
                ctx.fillStyle = '#171a24'; ctx.strokeStyle = n.color; ctx.lineWidth = 1.6;
                crtRoundRect(ctx, n.x - 27, n.y - 9, 54, 18, 4); ctx.fill(); ctx.stroke(); ctx.restore();
                ctx.fillStyle = n.color; ctx.font = '700 8px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(n.label, n.x, n.y);
            });
            ctx.fillStyle = e.COL.text; ctx.font = '700 9px "Courier New",monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('contribution → decision → visible outcome', 8, 8);
        }
    }

    ,
    // 10 — collective intelligence: people <-> platform (mediator) <-> party
    collective: {
        setup: function (s, e) {
            s.party = { x: e.W * 0.5, y: e.H * 0.27 };
            s.hub = { x: e.W * 0.5, y: e.H * 0.52 };
            s.N = 11;
            s.cit = [];
            for (var i = 0; i < s.N; i++) {
                s.cit.push({ x: e.W * (0.07 + 0.86 * i / (s.N - 1)), y: e.H * 0.82 + Math.sin(i * 1.3) * 4, ph: e.rand(0, 6.28) });
            }
        },
        draw: function (ctx, s, e) {
            var t = e.t;
            ctx.strokeStyle = 'rgba(124,245,180,0.16)'; ctx.lineWidth = 1;
            for (var i = 0; i < s.N - 1; i++) { ctx.beginPath(); ctx.moveTo(s.cit[i].x, s.cit[i].y); ctx.lineTo(s.cit[i + 1].x, s.cit[i + 1].y); ctx.stroke(); }
            ctx.strokeStyle = 'rgba(138,214,255,0.18)';
            s.cit.forEach(function (c) { ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(s.hub.x, s.hub.y); ctx.stroke(); });
            ctx.strokeStyle = 'rgba(255,211,109,0.32)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(s.hub.x, s.hub.y); ctx.lineTo(s.party.x, s.party.y); ctx.stroke();
            s.cit.forEach(function (c, i) {
                var k = (t * 0.55 + i / s.N) % 1;
                var px = c.x + (s.hub.x - c.x) * k, py = c.y + (s.hub.y - c.y) * k;
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = 6; ctx.shadowColor = e.COL.green; } ctx.fillStyle = e.COL.green; ctx.fillRect(px - 2, py - 2, 4, 4); ctx.restore();
            });
            var ku = (t * 0.7) % 1, ux = s.hub.x + (s.party.x - s.hub.x) * ku, uy = s.hub.y + (s.party.y - s.hub.y) * ku;
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = e.COL.cyan; } ctx.fillStyle = e.COL.cyan; ctx.fillRect(ux - 2.5, uy - 2.5, 5, 5); ctx.restore();
            var kd = (t * 0.7 + 0.5) % 1, dx = s.party.x + (s.hub.x - s.party.x) * kd, dy = s.party.y + (s.hub.y - s.party.y) * kd;
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = e.COL.amber; } ctx.fillStyle = e.COL.amber; ctx.fillRect(dx - 2.5, dy - 2.5, 5, 5); ctx.restore();
            s.cit.forEach(function (c) {
                var pulse = 0.6 + 0.4 * Math.sin(t * 2.5 + c.ph);
                ctx.save(); if (!e.reduce) { ctx.shadowBlur = 6 * pulse; ctx.shadowColor = e.COL.green; } ctx.fillStyle = e.COL.green;
                ctx.beginPath(); ctx.arc(c.x, c.y, 2.7, 0, 6.28); ctx.fill(); ctx.restore();
            });
            var g = 1 + 0.4 * Math.sin(t * 3);
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 12 * g; ctx.shadowColor = e.COL.cyan; }
            ctx.fillStyle = '#171a24'; ctx.strokeStyle = e.COL.cyan; ctx.lineWidth = 2;
            crtRoundRect(ctx, s.hub.x - 32, s.hub.y - 14, 64, 28, 5); ctx.fill(); ctx.stroke(); ctx.restore();
            ctx.fillStyle = e.COL.cyan; ctx.font = '700 8px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PLATFORM', s.hub.x, s.hub.y);
            ctx.save(); if (!e.reduce) { ctx.shadowBlur = 8; ctx.shadowColor = e.COL.amber; } ctx.fillStyle = '#171a24'; ctx.strokeStyle = e.COL.amber; ctx.lineWidth = 2;
            crtRoundRect(ctx, s.party.x - 26, s.party.y - 11, 52, 22, 5); ctx.fill(); ctx.stroke(); ctx.restore();
            ctx.fillStyle = e.COL.amber; ctx.textBaseline = 'middle'; ctx.fillText('PARTY', s.party.x, s.party.y);
            ctx.fillStyle = e.COL.dim; ctx.font = '700 8px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText('the people', s.hub.x, e.H - 13);
            ctx.fillStyle = e.COL.text; ctx.font = '700 8px "Courier New",monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('collective intelligence, mediated by the platform', 6, 5);
        }
    }
};

function initCrtCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-crt]'));
    if (!cards.length) { return; }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COL = {
        bg: '#11131a', text: '#d5f0ce', dim: '#8aa290', accent: '#a93a5f',
        cyan: '#8ad6ff', green: '#7cf5b4', amber: '#ffd36d', pink: '#f3a0cf', purple: '#c47be8', red: '#ff6d7a'
    };

    cards.forEach(function (canvas) {
        var anim = CRT_ANIMS[canvas.getAttribute('data-crt')];
        if (!anim || !canvas.getContext) { return; }
        var ctx = canvas.getContext('2d');
        var VIEW = anim.view || { w: 270, h: 135 };
        var fit = { s: 1, ox: 0, oy: 0 };
        var raf = null, last = 0;
        var state = {};
        var env = { COL: COL, reduce: reduce, W: VIEW.w, H: VIEW.h, t: 0, rand: function (a, b) { return a + Math.random() * (b - a); } };

        function resize() {
            var r = canvas.getBoundingClientRect();
            var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
            canvas.width = Math.max(1, Math.round((r.width || VIEW.w) * dpr));
            canvas.height = Math.max(1, Math.round((r.height || VIEW.h) * dpr));
            fit.s = Math.min(canvas.width / VIEW.w, canvas.height / VIEW.h);
            fit.ox = (canvas.width - VIEW.w * fit.s) / 2;
            fit.oy = (canvas.height - VIEW.h * fit.s) / 2;
        }
        function render() {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(fit.s, 0, 0, fit.s, fit.ox, fit.oy);
            anim.draw(ctx, state, env);
        }
        function frame(now) {
            var dt = Math.min(0.033, (now - last) / 1000 || 0); last = now; env.t += dt;
            if (anim.update) { anim.update(dt, state, env); }
            render();
            raf = requestAnimationFrame(frame);
        }
        function start() { if (raf || reduce) { return; } last = performance.now(); raf = requestAnimationFrame(frame); }
        function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

        if (anim.setup) { anim.setup(state, env); }
        resize();
        window.addEventListener('resize', function () { resize(); if (!raf) { render(); } });

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (es) {
                es.forEach(function (en) {
                    if (en.isIntersecting) { resize(); reduce ? render() : start(); }
                    else { stop(); }
                });
            }, { threshold: 0.2 });
            io.observe(canvas);
        } else { resize(); reduce ? render() : start(); }
    });
}
