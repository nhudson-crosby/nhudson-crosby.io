/* =========================================================
   Forestspace script.js
   - Renders forest scene (kitties + mushrooms)
   - Mushroom collision avoidance + hopping
   - Dragon treat game wired to dragon PNGs
   ========================================================= */

/* ---------------------------
   ASSET PATHS
---------------------------- */

const DRAGON_IMAGES = {
  ember: "assets/dragons/ember.png",
  storm: "assets/dragons/storm.png",
  moss: "assets/dragons/moss.png",
};

const MUSHROOMS = [
  "assets/mushrooms/amanita.png",
  "assets/mushrooms/balloon.png",
  "assets/mushrooms/spiral.png",
  "assets/mushrooms/group.png",
  "assets/mushrooms/long.png",
  "assets/mushrooms/basic.png",
  "assets/mushrooms/oyster.png",
  "assets/mushrooms/hen_of_woods.png",
  "assets/mushrooms/elfin_saddle.png",
  "assets/mushrooms/chanterelle.png",
];

/* ---------------------------
   Helpers
---------------------------- */

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function rectsOverlap(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

/* =========================================================
   (1) DRAGON GAME: show your dragon images
   ========================================================= */

function wireDragonGame() {
  const stepPickDragon = document.getElementById("stepPickDragon");
  const stepPickTreat = document.getElementById("stepPickTreat");
  const stepResult = document.getElementById("stepResult");

  const resultText = document.getElementById("resultText");
  const rideRow = document.getElementById("rideRow");
  const rideBtn = document.getElementById("rideBtn");
  const resetBtn = document.getElementById("resetBtn");

  const sky = document.getElementById("sky");
  const dragonEmoji = document.getElementById("dragon");

  if (!stepPickDragon || !stepPickTreat || !stepResult) return;

  // Add an <img> for the dragon sticker into the result step (once)
  let dragonSticker = document.getElementById("dragonSticker");
  if (!dragonSticker) {
    dragonSticker = document.createElement("img");
    dragonSticker.id = "dragonSticker";
    dragonSticker.alt = "Your dragon";
    dragonSticker.style.width = "180px";
    dragonSticker.style.maxWidth = "45vw";
    dragonSticker.style.display = "block";
    dragonSticker.style.margin = "10px 0 8px";
    dragonSticker.style.filter = "drop-shadow(0 12px 20px rgba(0,0,0,0.35))";
    // Put it above the result text
    stepResult.insertBefore(dragonSticker, resultText);
  }

  let chosenDragon = null;
  let chosenTreat = null;

  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function reset() {
    chosenDragon = null;
    chosenTreat = null;
    hide(stepPickTreat);
    hide(stepResult);
    show(stepPickDragon);
    hide(rideRow);
    hide(sky);
    resultText.textContent = "";
    dragonSticker.src = "";
    dragonEmoji.textContent = "🐉";
  }

  // Step 1: pick dragon egg
  stepPickDragon.querySelectorAll("button[data-dragon]").forEach((btn) => {
    btn.addEventListener("click", () => {
      chosenDragon = btn.dataset.dragon;

      hide(stepPickDragon);
      show(stepPickTreat);
    });
  });

  // Step 2: pick treat => outcome
  stepPickTreat.querySelectorAll("button[data-treat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      chosenTreat = btn.dataset.treat;

      hide(stepPickTreat);
      show(stepResult);

      // show sticker
      dragonSticker.src = DRAGON_IMAGES[chosenDragon] || "";

      // outcome rules (simple + fun; tweak anytime)
      let outcome = "bite";
      if (chosenDragon === "ember" && chosenTreat === "spicyJerky") outcome = "fire";
      if (chosenDragon === "storm" && chosenTreat === "stardustBerry") outcome = "wings";
      if (chosenDragon === "moss" && chosenTreat === "marshmallow") outcome = "wings";

      // Also allow a little randomness so it feels alive
      if (chosenTreat === "stardustBerry" && Math.random() < 0.15) outcome = "wings";
      if (chosenTreat === "spicyJerky" && Math.random() < 0.12) outcome = "fire";

      if (outcome === "fire") {
        resultText.textContent = `🔥 Your ${chosenDragon} dragon loves that treat… and breathes FIRE. Respect.`;
        hide(rideRow);
        hide(sky);
      } else if (outcome === "wings") {
        resultText.textContent = `🪽 Your ${chosenDragon} dragon grows wings!! You can ride it into the glittery sky.`;
        show(rideRow);
      } else {
        resultText.textContent = `😾 Your ${chosenDragon} dragon bites you. Not hard. Just… disrespectfully.`;
        hide(rideRow);
        hide(sky);
      }
    });
  });

  rideBtn?.addEventListener("click", () => {
    show(sky);
    // swap emoji “dragon” to a vibe; sticker stays above
    dragonEmoji.textContent = "🐉✨🪽";
  });

  resetBtn?.addEventListener("click", reset);

  reset();
}

/* =========================================================
   (2) + (3) FOREST SCENE: render + collision/hopping
   ========================================================= */

const sceneState = {
  w: 0,
  h: 0,
  mushrooms: [],
  cats: [],
  lastT: 0,
};

// lanes inside the scene
const LANES = [300, 330, 360];

function measureScene(scene) {
  sceneState.w = scene.clientWidth;
  sceneState.h = scene.clientHeight;
}

function spawnMushrooms(layer) {
  // clear old
  for (const m of sceneState.mushrooms) m.el.remove();
  sceneState.mushrooms = [];

  const count = 14;
  const pad = 40;

  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.className = "mushroom";
    img.src = pick(MUSHROOMS);
    img.alt = "mushroom";

    const size = rand(58, 110);
    img.style.width = `${size}px`;

    const laneY = pick(LANES);
    const x = rand(pad, Math.max(pad + 1, sceneState.w - pad - size));
    const y = clamp(laneY + rand(-18, 22), 50, sceneState.h - 130);

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    layer.appendChild(img);

    // collision bbox (tuned)
    const bbox = {
      x,
      y,
      w: size * 0.62,
      h: size * 0.48,
      ox: size * 0.18,
      oy: size * 0.40,
    };

    sceneState.mushrooms.push({ el: img, bbox });
  }
}

function createCat(layer, type, laneIndex, x) {
  const el = document.createElement("div");
  el.className = `kitty ${type} ${type === "grey" ? "walk" : "run"}`;
  layer.appendChild(el);

  const cat = {
    type,
    el,
    x,
    laneIndex,
    y: LANES[laneIndex],
    vx:
      type === "grey" ? rand(25, 45) :
      type === "orange" ? rand(55, 85) :
      rand(70, 105),
    hopUntil: 0,
  };

  // random direction
  if (Math.random() < 0.5) cat.vx *= -1;

  sceneState.cats.push(cat);
  placeCat(cat);
  return cat;
}

function placeCat(cat) {
  cat.el.style.left = `${cat.x}px`;
  cat.el.style.top = `${cat.y}px`;
  cat.el.style.setProperty("--facing", cat.vx >= 0 ? 1 : -1);
}

function catRect(cat) {
  return { x: cat.x + 18, y: cat.y + 46, w: 60, h: 34 };
}

function shouldHop(cat, obstacleRect) {
  const cr = catRect(cat);
  const forward = cat.vx >= 0;
  const dx = forward
    ? (obstacleRect.x - (cr.x + cr.w))
    : (cr.x - (obstacleRect.x + obstacleRect.w));
  const aligned = Math.abs((obstacleRect.y + obstacleRect.h / 2) - (cr.y + cr.h / 2)) < 30;
  return aligned && dx >= -6 && dx < 42;
}

function hop(cat) {
  const t = performance.now();
  cat.hopUntil = t + 240;
  cat.el.classList.add("hop");
  setTimeout(() => cat.el.classList.remove("hop"), 260);
}

function avoidMushrooms(cat) {
  const cr = catRect(cat);

  for (const m of sceneState.mushrooms) {
    const r = {
      x: m.bbox.x + m.bbox.ox,
      y: m.bbox.y + m.bbox.oy,
      w: m.bbox.w,
      h: m.bbox.h,
    };

    if (rectsOverlap(cr, r) || shouldHop(cat, r)) {
      // 70% hop, 30% lane change
      if (Math.random() < 0.7) {
        if (performance.now() > cat.hopUntil) hop(cat);
      } else {
        const dir = Math.random() < 0.5 ? -1 : 1;
        cat.laneIndex = (cat.laneIndex + dir + LANES.length) % LANES.length;
        cat.y = LANES[cat.laneIndex];
      }
      break;
    }
  }
}

function tickScene(scene) {
  if (!sceneState.lastT) sceneState.lastT = performance.now();
  const t = performance.now();
  const dt = (t - sceneState.lastT) / 1000;
  sceneState.lastT = t;

  for (const cat of sceneState.cats) {
    avoidMushrooms(cat);

    // move
    cat.x += cat.vx * dt;

    // bounce at edges
    const minX = -60;
    const maxX = sceneState.w + 60;

    if (cat.x < minX) {
      cat.x = minX;
      cat.vx = Math.abs(cat.vx);
    } else if (cat.x > maxX) {
      cat.x = maxX;
      cat.vx = -Math.abs(cat.vx);
    }

    placeCat(cat);
  }

  requestAnimationFrame(() => tickScene(scene));
}

function initForestScene() {
  const scene = document.getElementById("scene");
  const layer = document.getElementById("sceneLayer");
  if (!scene || !layer) return;

  measureScene(scene);
  spawnMushrooms(layer);

  // Create kitties (3)
  if (sceneState.cats.length === 0) {
    createCat(layer, "orange", 1, 60);
    createCat(layer, "black", 0, 190);
    createCat(layer, "grey", 2, 330);
  }

  // respawn mushrooms on resize (simple)
  window.addEventListener("resize", () => {
    measureScene(scene);
    spawnMushrooms(layer);
  });

  tickScene(scene);
}

/* =========================================================
   Boot
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  wireDragonGame();
  initForestScene();
});
