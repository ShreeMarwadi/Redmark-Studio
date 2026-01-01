// ==========================================
// LEAF HOPPER - GAME ENGINE
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Responsive canvas sizing
function resizeCanvas() {
  const container = document.getElementById("gameContainer");
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Game State
let gameState = "menu";
let score = 0;
let highScore = parseInt(localStorage.getItem("leafHopperHighScore")) || 0;
let maxHeight = 0;
let cameraY = 0;
let targetCameraY = 0;
let waterLevel = 0;
let lastTime = 0;

// Input State
const keys = { left: false, right: false, jump: false };
let jumpHeld = false;
let jumpStartTime = 0;

// Player (Frog)
let player = null;

// Game Objects
let leaves = [];
let particles = [];
let ripples = [];
let backgroundElements = [];

// Constants
const GRAVITY = 800;
const JUMP_FORCE = -450;
const JUMP_HOLD_FORCE = -600;
const MAX_JUMP_TIME = 200;
const MOVE_SPEED = 300; // was 280
const FRICTION = 0.85; // was 0.9
const WATER_SPEED = 30;
const CAMERA_SMOOTH = 0.08;

// Colors
const COLORS = {
  frog: "#7CB342",
  frogBelly: "#C5E1A5",
  frogDark: "#558B2F",
  leafNormal: "#66BB6A",
  leafMoving: "#81C784",
  leafSinking: "#AED581",
  leafSinkingDark: "#9CCC65",
  water: "rgba(129, 199, 232, 0.8)",
  waterTop: "rgba(179, 229, 252, 0.6)",
  background: "#E3F2FD",
  particle: ["#81C784", "#A5D6A7", "#C8E6C9"],
};

// ==========================================
// PLAYER CLASS (FROG)
// ==========================================

class Frog {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 35;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.squash = 1;
    this.stretch = 1;
    this.blinkTimer = Math.random() * 3000;
    this.isBlinking = false;
    this.jumpCharge = 0;
    this.facingRight = true;
  }

  update(dt) {
    // Horizontal movement
    let targetSpeed = 0;

if (keys.left) targetSpeed = -MOVE_SPEED;
if (keys.right) targetSpeed = MOVE_SPEED;

this.vx += (targetSpeed - this.vx) * 0.15;



    // Clamp horizontal speed
    if (this.vx > MOVE_SPEED) this.vx = MOVE_SPEED;
    if (this.vx < -MOVE_SPEED) this.vx = -MOVE_SPEED;

    // Variable jump
    if (keys.jump && this.onGround && !jumpHeld) {
      jumpHeld = true;
      jumpStartTime = performance.now();
      this.vy = JUMP_FORCE;
      this.onGround = false;
      this.stretch = 1.3;
      this.squash = 0.7;

      // Jump particles
      for (let i = 0; i < 6; i++) {
        particles.push(
          new Particle(this.x + this.width / 2, this.y + this.height, "jump")
        );
      }
    }

    // Jump hold for higher jump
    if (
      jumpHeld &&
      keys.jump &&
      performance.now() - jumpStartTime < MAX_JUMP_TIME
    ) {
      this.vy += (JUMP_HOLD_FORCE - JUMP_FORCE) * dt * 3;
    }

    // Apply gravity
    this.vy += GRAVITY * dt;

    // Terminal velocity
    if (this.vy > 800) this.vy = 800;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Screen wrap
    if (this.x + this.width < 0) {
      this.x = canvas.width;
    } else if (this.x > canvas.width) {
      this.x = -this.width;
    }

    // Squash and stretch recovery
    this.squash += (1 - this.squash) * 0.2;
    this.stretch += (1 - this.stretch) * 0.2;

    // Blinking
    this.blinkTimer -= dt * 1000;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer > -200) {
        this.blinkTimer -= dt * 1000;
      } else {
        this.isBlinking = false;
        this.blinkTimer = 2000 + Math.random() * 3000;
      }
    }

    // Leaf collision (only when falling)
    if (this.vy > 0) {
      this.onGround = false;
      leaves.forEach((leaf) => {
        if (leaf.active && this.checkCollision(leaf)) {
          this.y = leaf.y - this.height;
          this.vy = 0;
          this.onGround = true;
          this.squash = 1.2;
          this.stretch = 0.8;

          // Handle sinking leaves
          if (leaf.type === "sinking") {
            leaf.startSinking();
          }

          // Jump particles
          for (let i = 0; i < 4; i++) {
            particles.push(
              new Particle(
                this.x + this.width / 2,
                this.y + this.height,
                "land"
              )
            );
          }
        }
      });
    }

    // Check water collision (death)
    if (this.y + this.height > waterLevel + 20) {
      gameOver();
    }
  }

  checkCollision(leaf) {
    const playerBottom = this.y + this.height;
    const playerCenterX = this.x + this.width / 2;

    // Check if player is above and falling onto the leaf
    return (
      playerBottom >= leaf.y - 10 &&
      playerBottom <= leaf.y + leaf.height / 2 &&
      playerCenterX >= leaf.x &&
      playerCenterX <= leaf.x + leaf.width &&
      this.vy >= 0
    );
  }

  draw() {
    ctx.save();

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Apply squash and stretch
    ctx.translate(centerX, this.y + this.height);
    ctx.scale(this.squash, this.stretch);
    ctx.translate(-centerX, -(this.y + this.height));

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      this.y + this.height + 3,
      this.width / 2,
      6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Body
    ctx.fillStyle = COLORS.frog;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      this.y + this.height - 10,
      this.width / 2 - 2,
      this.height / 2 - 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Belly
    ctx.fillStyle = COLORS.frogBelly;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      this.y + this.height - 8,
      this.width / 3,
      this.height / 3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Eyes
    const eyeY = this.y + 8;
    const leftEyeX = centerX - 12;
    const rightEyeX = centerX + 12;

    // Eye bumps
    ctx.fillStyle = COLORS.frog;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 10, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Eye whites
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, this.isBlinking ? 10 : 6, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, this.isBlinking ? 10 : 6, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    if (!this.isBlinking) {
      const pupilOffset = this.facingRight ? 2 : -2;
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(leftEyeX + pupilOffset, eyeY + 1, 3, 0, Math.PI * 2);
      ctx.arc(rightEyeX + pupilOffset, eyeY + 1, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smile
    ctx.strokeStyle = COLORS.frogDark;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(centerX, this.y + 18, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Cheeks
    ctx.fillStyle = "rgba(248, 187, 217, 0.4)";
    ctx.beginPath();
    ctx.arc(centerX - 18, this.y + 15, 5, 0, Math.PI * 2);
    ctx.arc(centerX + 18, this.y + 15, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x + 5,
      y: this.y + 5,
      width: this.width - 10,
      height: this.height - 10,
    };
  }
}

// ==========================================
// LEAF CLASS
// ==========================================

class Leaf {
  constructor(x, y, type = "normal") {
    this.x = x;
    this.y = y;
    this.width = 70 + Math.random() * 20;
    this.height = 15;
    this.type = type;
    this.active = true;
    this.originalX = x;

    // Movement properties
    this.moveSpeed = type === "moving" ? 40 + Math.random() * 30 : 0;
    this.moveRange = 60 + Math.random() * 40;
    this.moveOffset = Math.random() * Math.PI * 2;

    // Sinking properties
    this.sinking = false;
    this.sinkSpeed = 0;
    this.maxSinkSpeed = 50;
    this.sinkAcceleration = 20;

    // Visual properties
    this.wobble = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.wobble += dt * 2;

    if (this.type === "moving" && !this.sinking) {
      // Horizontal oscillation
      this.x =
        this.originalX +
        Math.sin(this.wobble + this.moveOffset) * this.moveRange;
    }

    if (this.sinking) {
      // Accelerating sink
      this.sinkSpeed += this.sinkAcceleration * dt;
      if (this.sinkSpeed > this.maxSinkSpeed) {
        this.sinkSpeed = this.maxSinkSpeed;
      }
      this.y += this.sinkSpeed * dt;

      // Deactivate if too far below camera
      if (this.y > cameraY + canvas.height + 100) {
        this.active = false;
      }
    }
  }

  startSinking() {
    if (!this.sinking) {
      this.sinking = true;
    }
  }

  draw() {
    if (!this.active) return;

    ctx.save();

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2 + 5,
      this.y + 10,
      this.width / 2 - 5,
      8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Leaf color
    let leafColor = COLORS.leafNormal;
    if (this.type === "moving") {
      leafColor = COLORS.leafMoving;
    } else if (this.type === "sinking") {
      leafColor = COLORS.leafSinking;
    }

    // Leaf shape (lily pad style)
    ctx.fillStyle = leafColor;
    ctx.beginPath();

    // Main leaf body
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Leaf detail (veins and cutout)
    ctx.strokeStyle =
      this.type === "sinking" ? COLORS.leafSinkingDark : "#4CAF50";
    ctx.lineWidth = 1;

    // Center vein
    ctx.beginPath();
    ctx.moveTo(this.x + 10, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width - 10, this.y + this.height / 2);
    ctx.stroke();

    // Side veins
    for (let i = 0; i < 3; i++) {
      const veinX = this.x + 20 + i * 15;
      ctx.beginPath();
      ctx.moveTo(veinX, this.y + this.height / 2);
      ctx.lineTo(veinX - 5, this.y + 3);
      ctx.moveTo(veinX, this.y + this.height / 2);
      ctx.lineTo(veinX - 5, this.y + this.height - 3);
      ctx.stroke();
    }

    // Lily pad cutout (small triangle at edge)
    ctx.fillStyle = "rgba(129, 199, 232, 0.3)";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width - 5, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width + 8, this.y + this.height / 2 - 6);
    ctx.lineTo(this.x + this.width + 8, this.y + this.height / 2 + 6);
    ctx.closePath();
    ctx.fill();

    // Sinking indicator (shake effect)
    if (this.sinking) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      const shakeX = Math.sin(this.wobble * 10) * 2;
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2 + shakeX, this.y);
      ctx.lineTo(this.x + this.width / 2 + shakeX, this.y + this.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

// ==========================================
// PARTICLE CLASS
// ==========================================

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.life = 1;
    this.decay = 2;
    this.vx = (Math.random() - 0.5) * 100;
    this.vy = (Math.random() - 0.5) * 50;
    this.size = Math.random() * 5 + 2;
    this.color =
      COLORS.particle[Math.floor(Math.random() * COLORS.particle.length)];

    if (type === "splash") {
      this.vy = -Math.random() * 150 - 50;
      this.decay = 1.5;
      this.size = Math.random() * 8 + 4;
    } else if (type === "land") {
      this.vy = -Math.random() * 30 - 10;
      this.decay = 3;
    }
  }

  update(dt) {
    this.life -= this.decay * dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 300 * dt; // gravity

    if (this.type === "splash") {
      this.vx *= 0.98;
    }
  }

  draw() {
    if (!this.active) return;

    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;

    if (this.type === "splash") {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
      );
    }

    ctx.restore();
  }
}

// ==========================================
// RIPPLE CLASS
// ==========================================

class Ripple {
  constructor(x) {
    this.x = x;
    this.y = waterLevel;
    this.width = 10;
    this.maxWidth = 80;
    this.active = true;
    this.life = 1;
  }

  update(dt) {
    this.width += 100 * dt;
    this.life -= 1.5 * dt;
    if (this.life <= 0) {
      this.active = false;
    }
  }

  draw() {
    if (!this.active) return;

    ctx.save();
    ctx.globalAlpha = this.life * 0.5;
    ctx.strokeStyle = "#BBDEFB";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ==========================================
// BACKGROUND ELEMENTS
// ==========================================

class BackgroundElement {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height * 2;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -50;
    this.type = Math.random() > 0.5 ? "reed" : "cloud";
    this.size = 0.3 + Math.random() * 0.5;
    this.speed = 10 + Math.random() * 20;
    this.opacity = 0.1 + Math.random() * 0.2;
  }

  update(dt) {
    this.y += this.speed * dt;

    if (this.y > canvas.height + 50) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.type === "reed") {
      // Reed/grass
      ctx.fillStyle = "#A5D6A7";
      for (let i = 0; i < 3; i++) {
        const reedX = this.x + i * 15;
        const height = 30 + Math.random() * 30;
        ctx.beginPath();
        ctx.moveTo(reedX, this.y);
        ctx.quadraticCurveTo(
          reedX + 5,
          this.y - height / 2,
          reedX,
          this.y - height
        );
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#81C784";
        ctx.stroke();
      }
    } else {
      // Cloud
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 20 * this.size, 0, Math.PI * 2);
      ctx.arc(
        this.x + 25 * this.size,
        this.y - 10 * this.size,
        25 * this.size,
        0,
        Math.PI * 2
      );
      ctx.arc(this.x + 50 * this.size, this.y, 20 * this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ==========================================
// GAME FUNCTIONS
// ==========================================

function initGame() {
  score = 0;
  maxHeight = 0;
  cameraY = 0;
  targetCameraY = 0;
  waterLevel = canvas.height + 100;
  leaves = [];
  particles = [];
  ripples = [];

  // Initialize background elements
  backgroundElements = [];
  for (let i = 0; i < 15; i++) {
    backgroundElements.push(new BackgroundElement());
  }

  // Create player
  player = new Frog(canvas.width / 2 - 20, canvas.height - 150);

  // Create initial leaves
  const startY = canvas.height - 100;
  leaves.push(new Leaf(canvas.width / 2 - 35, startY, "normal"));

  // Generate more leaves upward
  for (let i = 1; i < 15; i++) {
    generateLeaf(startY - i * 100);
  }

  updateUI();
}

function generateLeaf(yPos) {
  // Difficulty-based leaf type selection
  let type = "normal";
  const rand = Math.random();

  if (score > 500 && rand < 0.25) {
    type = "moving";
  } else if (score > 1500 && rand < 0.4) {
    type = "sinking";
  }

  const xPos = Math.random() * (canvas.width - 80) + 5;
  leaves.push(new Leaf(xPos, yPos, type));
}

function updateUI() {
  document.getElementById("scoreDisplay").textContent = Math.floor(score);
  document.getElementById("highScoreDisplay").textContent = `Best: ${Math.floor(
    highScore
  )}`;
}

function gameOver() {
  gameState = "gameOver";

  // Create splash particles
  for (let i = 0; i < 20; i++) {
    particles.push(
      new Particle(player.x + player.width / 2, waterLevel, "splash")
    );
  }

  // Create ripples
  for (let i = 0; i < 3; i++) {
    ripples.push(
      new Ripple(player.x + player.width / 2 + (Math.random() - 0.5) * 40)
    );
  }

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("leafHopperHighScore", Math.floor(highScore));
  }

  // Show game over after a moment
  setTimeout(() => {
    showMenu();
  }, 1500);
}

function showMenu() {
  document.getElementById("menu").classList.remove("hidden");
  updateUI();
}
function quitToHome() {
  window.location.href = "https://shreemarwadi.github.io/Redmark-Studio/";
}


function startGame() {
  document.getElementById("menu").classList.add("hidden");
  gameState = "playing";
  initGame();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  if (gameState === "playing") {
    // Update player
    player.update(dt);

    // Update camera
    const playerScreenY = player.y - cameraY;
    if (playerScreenY < canvas.height * 0.4) {
      targetCameraY = player.y - canvas.height * 0.4;
    }
    cameraY += (targetCameraY - cameraY) * CAMERA_SMOOTH;

    // Update score based on height
    const currentHeight = -player.y;
    if (currentHeight > maxHeight) {
      maxHeight = currentHeight;
      score = maxHeight / 10;
    }

    // Rising water
    waterLevel = cameraY + canvas.height + 50;

    // Update leaves
    leaves.forEach((leaf) => leaf.update(dt));
    leaves = leaves.filter((leaf) => leaf.active);

    // Generate new leaves as player climbs
    const highestLeaf = Math.min(...leaves.map((l) => l.y));
    if (highestLeaf > cameraY - 100) {
      generateLeaf(highestLeaf - 80 - Math.random() * 40);
    }

    // Remove leaves below water
    leaves = leaves.filter((leaf) => leaf.y < waterLevel + 50);

    // Update particles
    particles.forEach((p) => p.update(dt));
    particles = particles.filter((p) => p.active);

    // Update ripples
    ripples.forEach((r) => r.update(dt));
    ripples = ripples.filter((r) => r.active);

    // Update background
    backgroundElements.forEach((el) => el.update(dt));

    updateUI();
  }

  // Render
  render();

  requestAnimationFrame(gameLoop);
}

function render() {
  // Clear canvas
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply camera transform
  ctx.save();
  ctx.translate(0, -cameraY);

  // Draw background elements
  backgroundElements.forEach((el) => el.draw());

  // Draw leaves
  leaves.forEach((leaf) => leaf.draw());

  // Draw particles
  particles.forEach((p) => p.draw());

  // Draw ripples
  ripples.forEach((r) => r.draw());

  // Draw player
  if (player && gameState === "playing") {
    player.draw();
  }

  ctx.restore();

  // Draw water (always at bottom of screen)
  drawWater();

  // Draw game over splash
  if (gameState === "gameOver") {
    ctx.fillStyle = "rgba(129, 199, 232, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawWater() {
  const waterScreenY = waterLevel - cameraY;

  if (waterScreenY > canvas.height) return;

  // Water gradient
  const gradient = ctx.createLinearGradient(
    0,
    waterScreenY - 50,
    0,
    canvas.height
  );
  gradient.addColorStop(0, COLORS.waterTop);
  gradient.addColorStop(1, COLORS.water);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, waterScreenY, canvas.width, canvas.height + 100);

  // Water surface ripple effect
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const offset = performance.now() / 1000 + i;
    for (let x = 0; x < canvas.width; x += 10) {
      const y = waterScreenY + Math.sin(x * 0.03 + offset) * 5 + i * 3;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

// ==========================================
// INPUT HANDLING
// ==========================================

// Keyboard
document.addEventListener("keydown", (e) => {
  if (gameState === "menu" && (e.code === "Space" || e.code === "Enter")) {
    startGame();
    return;
  }

  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      keys.left = true;
      break;
    case "ArrowRight":
    case "KeyD":
      keys.right = true;
      break;
    case "Space":
    case "ArrowUp":
    case "KeyW":
      if (!keys.jump) {
        keys.jump = true;
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      keys.left = false;
      break;
    case "ArrowRight":
    case "KeyD":
      keys.right = false;
      break;
    case "Space":
    case "ArrowUp":
    case "KeyW":
      keys.jump = false;
      jumpHeld = false;
      break;
  }
});

// Mobile Controls
const leftArea = document.getElementById("leftArea");
const rightArea = document.getElementById("rightArea");
const jumpBtn = document.getElementById("jumpBtn");

// Show mobile controls on touch
document.addEventListener(
  "touchstart",
  (e) => {
    if (gameState === "menu" || gameState === "playing") {
      document
        .getElementById("mobileControls")
        .classList.add("mobile-controls-visible");
    }
  },
  { passive: true }
);

leftArea.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    keys.left = true;
  },
  { passive: false }
);

leftArea.addEventListener("touchend", () => {
  keys.left = false;
});

rightArea.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    keys.right = true;
  },
  { passive: false }
);

rightArea.addEventListener("touchend", () => {
  keys.right = false;
});

jumpBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    if (gameState === "menu") {
      startGame();
    } else if (gameState === "playing") {
      keys.jump = true;
    }
  },
  { passive: false }
);

jumpBtn.addEventListener("touchend", () => {
  keys.jump = false;
  jumpHeld = false;
});

// Start button
document.getElementById("startBtn").addEventListener("click", startGame);

// Initialize UI
updateUI();

// Start game loop
lastTime = performance.now();
requestAnimationFrame(gameLoop);

(function () {
    const quitBtn = document.getElementById("quitBtn");

    if (quitBtn) {
        quitBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Absolute redirect to home
            window.location.href = "https://shreemarwadi.github.io/Redmark-Studio/";
        });
    } else {
        console.warn("Quit button not found");
    }
})();
