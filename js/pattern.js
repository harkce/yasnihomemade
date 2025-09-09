/* Pattern Background JavaScript */

/* ================== CONFIG =================== */

/** Define your 0/1 matrix (example):
 *  010101
 *  101010
 *  010101
 */
const MATRIX = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
];

/** Icons to use for the 1-cells (use your own file names/paths) */
const ICONS = [
  "../images/anise.svg",
  "../images/cabbage.svg",
  "../images/garlic.svg",
  "../images/lemongrass.svg",
  "../images/nut.svg",
  "../images/onion.svg",
  "../images/pepper.svg",
  "../images/tomato.svg",
];

/** Behavior flags */
const randomizeIcons = false; // true = pick random icon for each 1-cell
const cycleStartIndex = 0; // starting icon index when cycling

/** Animation settings */
const ANIMATION_ENABLED = true;
const ANIMATION_SPEED = 0.1; // pixels per frame (how fast the pattern moves)

/** Sizing – must stay in sync with CSS custom properties */
const CELL =
  parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--cell")
  ) || 100;

/* Animation state */
let animationOffset = 0;
let animationId = null;
let allTiles = [];

/* ============================================= */

/** Build a single tile element following MATRIX using ICONS */
function buildTile() {
  const rows = MATRIX.length;
  const cols = MATRIX[0].length;
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.style.setProperty("--cols", cols);

  let iconIdx = cycleStartIndex;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (MATRIX[r][c] === 1) {
        const img = document.createElement("img");
        if (randomizeIcons) {
          const rnd = Math.floor(Math.random() * ICONS.length);
          img.src = ICONS[rnd];
        } else {
          img.src = ICONS[iconIdx % ICONS.length];
          iconIdx++;
        }
        tile.appendChild(img);
      } else {
        const empty = document.createElement("div");
        empty.className = "empty";
        tile.appendChild(empty);
      }
    }
  }
  return tile;
}

/** Clear node children */
function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Fill the viewport by cloning the tile enough times (seamless) */
function fillViewport() {
  const mount = document.getElementById("pattern");
  if (!mount) return; // Exit if pattern element doesn't exist

  clearNode(mount);

  // Measure tile size (based on CSS variables and matrix)
  const cols = MATRIX[0].length;
  const rows = MATRIX.length;
  const tileW = cols * CELL;
  const tileH = rows * CELL;

  // Get viewport dimensions
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Calculate how many tiles we need to completely cover viewport
  // Add extra tiles to ensure no gaps at edges
  const tilesX = Math.ceil(vw / tileW) + 2;
  const tilesY = Math.ceil(vh / tileH) + 2;

  // Create tiles starting from negative position to ensure full coverage
  const startX = -Math.ceil(tileW * 2);
  const startY = -Math.ceil(tileH * 2);

  // Clear the tiles array
  allTiles = [];

  // Create and place all tiles
  for (let y = 0; y < tilesY + 2; y++) {
    for (let x = 0; x < tilesX + 2; x++) {
      const tile = buildTile();
      tile.classList.add("tile-clone");
      const baseX = startX + x * tileW;
      const baseY = startY + y * tileH;

      tile.style.transform = `translate(${baseX}px, ${baseY}px)`;
      mount.appendChild(tile);

      // Store tile info for animation
      allTiles.push({
        element: tile,
        baseX: baseX,
        baseY: baseY,
      });
    }
  }

  // Start with no offset
  mount.style.transform = `translate(0px, 0px)`;
}

/* ============= PATTERN ANIMATION ============= */

/** Animation loop for seamless pattern movement */
function animatePattern() {
  if (!ANIMATION_ENABLED) return;

  // Update animation offset (diagonal movement)
  animationOffset += ANIMATION_SPEED;

  // Get current tile dimensions
  const cols = MATRIX[0].length;
  const rows = MATRIX.length;
  const tileW = cols * CELL;
  const tileH = rows * CELL;

  // Calculate seamless offset
  const offsetX = animationOffset % tileW;
  const offsetY = animationOffset % tileH;

  // Move all tiles by the offset to create seamless scrolling
  allTiles.forEach((tile) => {
    const newX = tile.baseX + offsetX;
    const newY = tile.baseY + offsetY;
    tile.element.style.transform = `translate(${newX}px, ${newY}px)`;
  });

  // Continue animation
  animationId = requestAnimationFrame(animatePattern);
}

/** Start pattern animation */
function startPatternAnimation() {
  if (ANIMATION_ENABLED && !animationId) {
    animationId = requestAnimationFrame(animatePattern);
  }
}

/** Stop pattern animation */
function stopPatternAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Basic resize handling (throttled)
let resizeTimer = null;
function onResize() {
  if (resizeTimer) cancelAnimationFrame(resizeTimer);
  resizeTimer = requestAnimationFrame(() => {
    fillViewport();
    // Restart pattern animation after resize
    if (ANIMATION_ENABLED) {
      stopPatternAnimation();
      startPatternAnimation();
    }
  });
}

// Initialize pattern when DOM is loaded
function initPattern() {
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  // Initial render
  fillViewport();

  // Start pattern animation
  startPatternAnimation();
}

// Auto-initialize if DOM is ready, otherwise wait for it
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPattern);
} else {
  initPattern();
}
