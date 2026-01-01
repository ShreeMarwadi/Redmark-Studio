/**
 * EchoStep - Main Game Logic
 * A rhythmic platformer where player movement creates echo platforms
 */

const GAME_WIDTH = 1600;
const GAME_HEIGHT = 900;
const GAME_ASPECT = GAME_WIDTH / GAME_HEIGHT;


class EchoStepGame {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover, levelcomplete
        this.levelIndex = 0;
        this.cycleTime = 0;
        this.cycleDuration = 3000; // 3 seconds in milliseconds

        // Player
        this.player = {
            x: 0,
            y: 0,
            width: 24,
            height: 36,
            vx: 0,
            vy: 0,
            speed: 300,
            jumpForce: -450,
            gravity: 1200,
            grounded: false,
            canJump: true,
            coyoteTime: 0,
            jumpBufferTime: 0
        };

        // Movement recording
        this.currentPath = []; // Current cycle's movement
        this.echoLayer1 = []; // Most recent echo
        this.echoLayer2 = []; // Older echo (fading)

        // Controls
        this.keys = {
            left: false,
            right: false,
            jump: false
        };
        this.touchState = {
            left: false,
            right: false,
            jump: false
        };

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.08
        };

        // Visual effects
        this.particles = [];
        this.screenFlash = 0;
        this.pulsePhase = 0;

        // Audio
        this.audio = new AudioSystem();

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;

        // Initialize
        this.resize();
        this.bindEvents();
        this.loadLevel(0);

        // Start game loop
        this.gameLoop(0);
    }

    /**
     * Resize canvas to fit window
     */
    resize() {
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.ctx.imageSmoothingEnabled = false;
}




    /**
     * Bind input events
     */
    bindEvents() {
        // Window resize
        window.addEventListener('resize', () => this.resize());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch controls
        this.setupTouchControls();

        // UI buttons
        document.getElementById('btn-start').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startGame();
        });
        document.getElementById('btn-continue').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-restart').addEventListener('click', () => this.restartLevel());
        document.getElementById('btn-quit').addEventListener('click', () => this.quitGame());

        // Pause with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state === 'playing') {
                this.pauseGame();
            } else if (e.key === 'Escape' && this.state === 'paused') {
                this.resumeGame();
            }
        });
    }

    /**
     * Setup touch control buttons
     */
    setupTouchControls() {
        const leftBtn = document.getElementById('btn-left');
        const rightBtn = document.getElementById('btn-right');
        const jumpBtn = document.getElementById('btn-jump');

        // Helper for touch events
        const addTouchEvents = (element, key) => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchState[key] = true;
                element.classList.add('active');
            });
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchState[key] = false;
                element.classList.remove('active');
            });
            element.addEventListener('touchcancel', (e) => {
                this.touchState[key] = false;
                element.classList.remove('active');
            });
        };

        addTouchEvents(leftBtn, 'left');
        addTouchEvents(rightBtn, 'right');
        addTouchEvents(jumpBtn, 'jump');

        // Detect touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            document.getElementById('mobile-controls').classList.add('active');
        }
    }

    /**
     * Handle keyboard keydown
     */
    handleKeyDown(e) {
        if (this.state === 'menu') {
            if (e.key === 'Enter' || e.key === ' ') {
                this.startGame();
            }
            return;
        }

        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                if (!this.keys.jump) {
                    this.keys.jump = true;
                    this.player.jumpBufferTime = 0.15; // 150ms jump buffer
                }
                break;
            case 'KeyR':
                this.restartLevel();
                break;
        }
    }

    /**
     * Handle keyboard keyup
     */
    handleKeyUp(e) {
        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                this.keys.jump = false;
                break;
        }
    }

    /**
     * Load a level
     */
    loadLevel(index) {
        if (index >= LEVELS.length) {
            // Victory - game complete
            this.showMessage('Journey Complete!');
            setTimeout(() => {
                this.state = 'menu';
                this.levelIndex = 0;
                this.updateMenu();
            }, 3000);
            return;
        }

        this.levelIndex = index;
        const level = LEVELS[index];

        // Reset player position
        this.player.x = level.spawn.x;
        this.player.y = level.spawn.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.grounded = false;

        // Reset cycle
        this.cycleTime = 0;
        this.currentPath = [];
        this.echoLayer1 = [];
        this.echoLayer2 = [];

        // Reset camera
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        this.camera.x = this.camera.targetX;
        this.camera.y = this.camera.targetY;

        // Clear particles
        this.particles = [];

        // Update UI
        document.getElementById('level-number').textContent = level.id;
        document.getElementById('level-indicator').style.opacity = '1';
    }

    /**
     * Start the game
     */
    async startGame() {
        console.log('Starting game...');
        
        try {
            // Initialize audio in background (non-blocking)
            await this.audio.init().catch(err => {
                console.warn('Audio initialization skipped:', err);
            });
            this.audio.playUI();
        } catch (e) {
            console.warn('Audio error (non-critical):', e);
        }
        
        this.state = 'playing';
        console.log('Game state set to: playing');
        
        // Hide menus
        const menuOverlay = document.getElementById('menu-overlay');
        const messageOverlay = document.getElementById('message-overlay');
        
        if (menuOverlay) {
            menuOverlay.classList.add('hidden');
            console.log('Menu overlay hidden');
        }
        
        if (messageOverlay) {
            messageOverlay.classList.add('hidden');
        }
        
        this.loadLevel(this.levelIndex);
        console.log('Level loaded:', this.levelIndex + 1);
    }

    /**
     * Pause the game
     */
    pauseGame() {
        this.state = 'paused';
        document.getElementById('pause-overlay').classList.remove('hidden');
    }

    /**
     * Resume the game
     */
    resumeGame() {
        this.state = 'playing';
        document.getElementById('pause-overlay').classList.add('hidden');
        this.audio.playUI();
    }

    /**
     * Restart current level
     */
    restartLevel() {
        this.audio.playUI();
        document.getElementById('pause-overlay').classList.add('hidden');
        this.loadLevel(this.levelIndex);
        this.state = 'playing';
    }

    /**
     * Quit game and return to menu
     */
    quitGame() {
    this.audio.playUI();

    // Small delay so click sound can play
    setTimeout(() => {
        window.location.href = "https://shreemarwadi.github.io/Redmark-Studio/";
    }, 150);
}


    /**
     * Update menu visibility
     */
    updateMenu() {
        const overlay = document.getElementById('menu-overlay');
        if (this.state === 'menu') {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Show a message overlay
     */
    showMessage(text, duration = 2000) {
        const overlay = document.getElementById('message-overlay');
        const messageText = document.getElementById('message-text');
        messageText.textContent = text;
        overlay.classList.remove('hidden');

        if (duration > 0) {
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, duration);
        }
    }

    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.state === 'playing') {
            this.update(this.deltaTime);
        }

        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    /**
     * Update game state
     */
    update(dt) {
        // Update cycle time
        this.cycleTime += dt * 1000;

        // Check for cycle reset
        if (this.cycleTime >= this.cycleDuration) {
            this.cycleReset();
        }

        // Update player physics
        this.updatePlayer(dt);

        // Record player position for echo
        this.recordPath();

        // Update camera
        this.updateCamera(dt);

        // Update particles
        this.updateParticles(dt);

        // Update pulse phase
        this.pulsePhase += dt * Math.PI * 2;

        // Check level completion
        this.checkGoal();

        // Update timer display
        this.updateTimerDisplay();
    }

    /**
     * Update player physics and movement
     */
    updatePlayer(dt) {
        const p = this.player;
        const level = LEVELS[this.levelIndex];

        // Get input
        const moveLeft = this.keys.left || this.touchState.left;
        const moveRight = this.keys.right || this.touchState.right;
        const jumpPressed = this.keys.jump || this.touchState.jump;

        // Horizontal movement with smoothing
        const targetSpeed = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
        if (targetSpeed !== 0) {
            p.vx += targetSpeed * p.speed * 10 * dt;
            p.vx = Math.max(-p.speed, Math.min(p.speed, p.vx));
        } else {
            // Friction when no input
            p.vx *= Math.pow(0.1, dt);
            if (Math.abs(p.vx) < 1) p.vx = 0;
        }

        // Coyote time (allow jump shortly after leaving platform)
        if (p.grounded) {
            p.coyoteTime = 0.15;
        } else {
            p.coyoteTime -= dt;
        }

        // Jump buffer (remember jump press shortly before landing)
        if (jumpPressed) {
            p.jumpBufferTime = 0.15;
        } else {
            p.jumpBufferTime -= dt;
        }

        // Jump execution
        if (p.jumpBufferTime > 0 && p.coyoteTime > 0 && p.canJump) {
            p.vy = p.jumpForce;
            p.canJump = false;
            p.jumpBufferTime = 0;
            p.coyoteTime = 0;
            this.audio.playJump();
            this.spawnJumpParticles();
        }

        // Variable jump height (release early for shorter jump)
        if (!jumpPressed && p.vy < p.jumpForce * 0.5) {
            p.vy = Math.max(p.vy, p.jumpForce * 0.3);
        }

        // Gravity
        p.vy += p.gravity * dt;

        // Apply velocity
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Reset grounded state
        p.grounded = false;

        // Collision with terrain
        for (const rect of level.terrain) {
            this.handleCollision(p, rect);
        }

        // Collision with echo platforms
        for (const rect of this.echoLayer1) {
            this.handleCollision(p, rect, true);
        }
        for (const rect of this.echoLayer2) {
            this.handleCollision(p, rect, true);
        }

        // Check hazards
        this.checkHazards(level);

        // Check bounds
        this.checkBounds();

        // One-way platform logic (can jump up through, land on top)
        p.canJump = true;
    }

    /**
     * Handle collision between player and a rectangle
     */
    handleCollision(player, rect, isEcho = false) {
        // Simple AABB collision
        if (player.x < rect.x + rect.width &&
            player.x + player.width > rect.x &&
            player.y < rect.y + rect.height &&
            player.y + player.height > rect.y) {

            // Calculate overlap on each axis
            const overlapLeft = (player.x + player.width) - rect.x;
            const overlapRight = (rect.x + rect.width) - player.x;
            const overlapTop = (player.y + player.height) - rect.y;
            const overlapBottom = (rect.y + rect.height) - player.y;

            // Find smallest overlap
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // Resolve collision based on smallest overlap
            if (minOverlap === overlapTop && player.vy >= 0) {
                // Landing on top
                player.y = rect.y - player.height;
                player.vy = 0;
                player.grounded = true;

                // Only spawn land particles when actually landing (not continuous contact)
                if (!player.wasGrounded) {
                    this.audio.playLand();
                    this.spawnLandParticles();
                }
                player.wasGrounded = true;
            } else if (minOverlap === overlapBottom && player.vy < 0) {
                // Hitting from below
                player.y = rect.y + rect.height;
                player.vy = 0;
            } else if (minOverlap === overlapLeft) {
                // Hitting from left
                player.x = rect.x - player.width;
                player.vx = 0;
            } else if (minOverlap === overlapRight) {
                // Hitting from right
                player.x = rect.x + rect.width;
                player.vx = 0;
            }
        }
    }

    /**
     * Check environmental hazards
     */
    checkHazards(level) {
        const p = this.player;
        const centerX = p.x + p.width / 2;
        const centerY = p.y + p.height / 2;

        // Check current beat for pulse hazards
        const currentBeat = this.audio.getCurrentBeat();

        for (const hazard of level.hazards) {
            if (hazard.type === 'pit') {
                // Pit hazard - check if player is above it
                if (p.x + p.width > hazard.x &&
                    p.x < hazard.x + hazard.width &&
                    p.y + p.height >= hazard.y) {
                    this.die('Fall');
                }
            } else if (hazard.type === 'pulse') {
                // Check if hazard is active this beat
                const patternIndex = (currentBeat + (hazard.beatOffset || 0)) % hazard.pattern.length;
                const isActive = hazard.pattern[patternIndex] === 1;

                if (isActive) {
                    // Check collision
                    if (centerX > hazard.x &&
                        centerX < hazard.x + hazard.width &&
                        centerY > hazard.y &&
                        centerY < hazard.y + hazard.height) {
                        this.die('Hazard');
                    }
                }
            }
        }
    }

    /**
     * Check if player is out of bounds
     */
    checkBounds() {
        const level = LEVELS[this.levelIndex];
        const p = this.player;

        if (p.y > level.height + 100) {
            this.die('Fall');
        }
    }

    /**
     * Handle player death
     */
    die(cause) {
        this.audio.playHazard();
        this.showMessage('Resetting...', 1500);
        setTimeout(() => {
            this.loadLevel(this.levelIndex);
        }, 1500);
    }

    /**
     * Check if player reached goal
     */
    checkGoal() {
        const level = LEVELS[this.levelIndex];
        const p = this.player;
        const g = level.goal;

        if (p.x + p.width > g.x &&
            p.x < g.x + g.width &&
            p.y + p.height > g.y &&
            p.y < g.y + g.height) {
            this.levelComplete();
        }
    }

    /**
     * Handle level completion
     */
    levelComplete() {
        this.audio.playGoal();
        this.state = 'levelcomplete';
        this.showMessage('Echo Preserved', 2000);

        setTimeout(() => {
            this.loadLevel(this.levelIndex + 1);
            this.state = 'playing';
        }, 2000);
    }

    /**
     * Cycle reset - convert current path to echo
     */
    cycleReset() {
        this.cycleTime = 0;

        // Shift echo layers
        if (this.echoLayer1.length > 0) {
            // Old echo fades away
            if (this.echoLayer2.length > 0) {
                this.audio.playEchoFade();
            }
            this.echoLayer2 = [...this.echoLayer1];
        }

        // Convert current path to echo layer 1
        if (this.currentPath.length > 0) {
            // Optimize path - remove very close points and create platforms
            this.echoLayer1 = this.createEchoPlatforms(this.currentPath);
            this.audio.playEchoCreate();
        }

        // Clear current path
        this.currentPath = [];

        // Screen flash effect
        this.screenFlash = 0.3;

        // Play cycle reset sound
        this.audio.playCycleReset();
    }

    /**
     * Create echo platforms from recorded path
     */
    createEchoPlatforms(path) {
        if (path.length < 2) return [];

        const platforms = [];
        const minDistance = 20; // Minimum distance between points
        const platformWidth = 40;
        const platformHeight = 12;

        // Group nearby points and create platforms
        for (let i = 0; i < path.length; i += 3) {
            const point = path[i];
            const x = point.x - platformWidth / 2;
            const y = point.y + point.height / 2; // Below player's feet

            // Check if this point is far enough from the last platform
            const last = platforms[platforms.length - 1];
            if (!last ||
                Math.abs(x - last.x) > minDistance ||
                Math.abs(y - last.y) > minDistance) {
                platforms.push({
                    x: x,
                    y: y,
                    width: platformWidth,
                    height: platformHeight
                });
            }
        }

        return platforms;
    }

    /**
     * Record player position for current path
     */
    recordPath() {
        // Only record if player is moving or in air
        this.currentPath.push({
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height
        });

        // Limit path length to prevent memory issues
        if (this.currentPath.length > 300) {
            this.currentPath.shift();
        }
    }

    /**
     * Update camera position
     */
    updateCamera(dt) {
    const level = LEVELS[this.levelIndex];

    this.camera.targetX = this.player.x - this.canvas.width / 2;
    this.camera.targetY = this.player.y - this.canvas.height * 0.7;

    this.camera.targetX = Math.max(
        0,
        Math.min(this.camera.targetX, level.width - this.canvas.width)
    );

    const maxCameraY = Math.max(0, level.height - this.canvas.height);
    this.camera.targetY = Math.max(
        0,
        Math.min(this.camera.targetY, maxCameraY)
    );

    this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
    this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
}


    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const progress = this.cycleTime / this.cycleDuration;
        const circumference = 157; // 2 * PI * 25
        const offset = circumference * (1 - progress);

        const timerCircle = document.getElementById('timer-progress');
        timerCircle.style.strokeDashoffset = offset;

        // Change color based on cycle progress
        if (progress > 0.8) {
            timerCircle.style.stroke = '#f43f5e'; // Red warning
        } else if (progress > 0.5) {
            timerCircle.style.stroke = '#f59e0b'; // Orange
        } else {
            timerCircle.style.stroke = '#06b6d4'; // Cyan
        }
    }

    /**
     * Update particle effects
     */
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = p.life / p.maxLife;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Spawn jump particles
     */
    spawnJumpParticles() {
        const p = this.player;
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height,
                vx: (Math.random() - 0.5) * 150,
                vy: Math.random() * -100,
                life: 0.4,
                maxLife: 0.4,
                alpha: 1,
                color: '#06b6d4',
                size: 4 + Math.random() * 4
            });
        }
    }

    /**
     * Spawn land particles
     */
    spawnLandParticles() {
        const p = this.player;
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: p.x + p.width / 2 + (Math.random() - 0.5) * p.width,
                y: p.y + p.height,
                vx: (Math.random() - 0.5) * 80,
                vy: Math.random() * -50,
                life: 0.3,
                maxLife: 0.3,
                alpha: 1,
                color: '#94a3b8',
                size: 3 + Math.random() * 3
            });
        }
    }

    /**
     * Render game
     */
    render() {
        const ctx = this.ctx;
        const level = LEVELS[this.levelIndex];

        // Clear canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transform
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // Render game elements
        this.renderTerrain(level);
        this.renderHazards(level);
        this.renderEchoLayers();
        this.renderCurrentPath();
        this.renderGoal(level);
        this.renderPlayer();
        this.renderParticles();

        ctx.restore();

        // Render screen flash
        if (this.screenFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.screenFlash})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.screenFlash *= 0.9;
        }
    }

    /**
     * Render static terrain
     */
    renderTerrain(level) {
        const ctx = this.ctx;

        for (const rect of level.terrain) {
            // Main terrain body
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

            // Top edge highlight
            ctx.fillStyle = '#334155';
            ctx.fillRect(rect.x, rect.y, rect.width, 3);
        }
    }

    /**
     * Render hazards
     */
    renderHazards(level) {
        const ctx = this.ctx;
        const currentBeat = this.audio.getCurrentBeat();

        for (const hazard of level.hazards) {
            if (hazard.type === 'pit') {
                // Pit indicator
                ctx.fillStyle = '#f43f5e';
                ctx.globalAlpha = 0.3;
                ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                ctx.globalAlpha = 1;
            } else if (hazard.type === 'pulse') {
                // Check if active
                const patternIndex = (currentBeat + (hazard.beatOffset || 0)) % hazard.pattern.length;
                const isActive = hazard.pattern[patternIndex] === 1;

                // Pulsing animation
                const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;

                if (isActive) {
                    ctx.fillStyle = '#f43f5e';
                    ctx.globalAlpha = pulse;
                    ctx.shadowColor = '#f43f5e';
                    ctx.shadowBlur = 15;
                    ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                    ctx.shadowBlur = 0;
                } else {
                    // Inactive state - dimmer
                    ctx.fillStyle = '#7c2d3f';
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                }
                ctx.globalAlpha = 1;
            }
        }
    }

    /**
     * Render echo layers (previous paths as platforms)
     */
    renderEchoLayers() {
        const ctx = this.ctx;

        // Render layer 2 (older, fading)
        if (this.echoLayer2.length > 0) {
            ctx.fillStyle = '#6366f1';
            ctx.globalAlpha = 0.4;

            for (const rect of this.echoLayer2) {
                ctx.shadowColor = '#6366f1';
                ctx.shadowBlur = 10;
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // Render layer 1 (recent, bright)
        if (this.echoLayer1.length > 0) {
            ctx.fillStyle = '#06b6d4';

            for (const rect of this.echoLayer1) {
                ctx.shadowColor = '#06b6d4';
                ctx.shadowBlur = 15;
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }
            ctx.shadowBlur = 0;
        }
    }

    /**
     * Render current recording path (faint preview)
     */
    renderCurrentPath() {
        const ctx = this.ctx;

        if (this.currentPath.length < 2) return;

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.currentPath[0].x + this.currentPath[0].width / 2,
                   this.currentPath[0].y + this.currentPath[0].height);

        for (let i = 1; i < this.currentPath.length; i++) {
            const p = this.currentPath[i];
            ctx.lineTo(p.x + p.width / 2, p.y + p.height);
        }

        ctx.stroke();
    }

    /**
     * Render goal portal
     */
    renderGoal(level) {
        const ctx = this.ctx;
        const g = level.goal;

        // Outer glow
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 30 + Math.sin(this.pulsePhase * 0.5) * 10;

        // Portal background
        const gradient = ctx.createLinearGradient(g.x, g.y, g.x, g.y + g.height);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#059669');
        gradient.addColorStop(1, '#047857');

        ctx.fillStyle = gradient;
        ctx.fillRect(g.x, g.y, g.width, g.height);

        // Inner glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(g.x + 10, g.y + 10, g.width - 20, g.height - 20);

        ctx.shadowBlur = 0;

        // Goal text
        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', g.x + g.width / 2, g.y + g.height / 2 + 5);
    }

    /**
     * Render player character
     */
    renderPlayer() {
        const ctx = this.ctx;
        const p = this.player;

        // Glow effect
        ctx.shadowColor = '#f8fafc';
        ctx.shadowBlur = 20;

        // Player body
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Inner detail
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(p.x + 4, p.y + 4, p.width - 8, p.height - 8);

        ctx.shadowBlur = 0;

        // Trail particles when moving
        if (Math.abs(p.vx) > 50 && !p.grounded) {
            ctx.fillStyle = 'rgba(248, 250, 252, 0.5)';
            for (let i = 0; i < 2; i++) {
                const offsetX = Math.random() * 10 - 5;
                const offsetY = Math.random() * p.height;
                ctx.fillRect(p.x + offsetX, p.y + offsetY, 2, 4);
            }
        }
    }

    /**
     * Render particle effects
     */
    renderParticles() {
        const ctx = this.ctx;

        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing EchoStep game...');
    try {
        window.game = new EchoStepGame();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
