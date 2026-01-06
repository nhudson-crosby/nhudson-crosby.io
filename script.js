/* -----------------------
   ENTER OVERLAY + MUSIC
------------------------ */
const overlay = document.getElementById("enterOverlay");
const enterBtn = document.getElementById("enterBtn");
const muteBtn = document.getElementById("muteBtn");
const bgm = document.getElementById("bgm");
const toggleMusicBtn = document.getElementById("toggleMusicBtn");
const npText = document.getElementById("npText");

// Just a cute label — you can change it
const NOW_PLAYING_LABEL = "2010 pop-era vibes (your own audio file)";

function setNowPlaying() {
  if (!npText) return;
  npText.textContent = bgm && !bgm.paused ? NOW_PLAYING_LABEL : "—";
}

async function enter(withSound) {
  try {
    if (!bgm) return;
    bgm.muted = !withSound;
    // play() can throw if browser blocks; we try anyway
    await bgm.play();
  } catch (e) {
    // If blocked, user can click the toggle later
  }
  if (overlay) overlay.style.display = "none";
  setNowPlaying();
}

enterBtn?.addEventListener("click", () => enter(true));
muteBtn?.addEventListener("click", () => enter(false));

toggleMusicBtn?.addEventListener("click", async () => {
  if (!bgm) return;
  try {
    if (bgm.paused) {
      bgm.muted = false;
      await bgm.play();
    } else {
      bgm.pause();
    }
  } catch (e) {}
  setNowPlaying();
});

bgm?.addEventListener("play", setNowPlaying);
bgm?.addEventListener("pause", setNowPlaying);

/* -------------------------------
   MUSHROOM PLACEMENT + BOBBING
-------------------------------- */
const mushroomEls = [
  document.getElementById("mush1"),
  document.getElementById("mush2"),
  document.getElementById("mush3"),
  document.getElementById("mush4"),
].filter(Boolean);

// Lanes roughly matching your kitty lanes (% top)
const LANES = [68, 72, 78];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function placeMushrooms() {
  const vw = window.innerWidth;

  // distribute them across the screen with spacing
  const xs = [
    rand(vw * 0.18, vw * 0.30),
    rand(vw * 0.38, vw * 0.52),
    rand(vw * 0.58, vw * 0.72),
    rand(vw * 0.76, vw * 0.90),
  ].sort((a,b) => a-b);

  mushroomEls.forEach((m, i) => {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    m.style.left = `${xs[i % xs.length]}px`;
    m.style.top = `${lane + rand(-2, 2)}%`;

    m.classList.add("bob");
    if (Math.random() < 0.45) m.classList.add("fast");
  });
}

window.addEventListener("load", placeMushrooms);
window.addEventListener("resize", placeMushrooms);

/* ----------------------------------------
   KITTIES: RUN + GROUP UP + HOP OVER MUSH
----------------------------------------- */
const kittyState = [
  { key: "orange", el: document.querySelector(".kitty.orange"), speed: 2.25, laneTopPct: 72, x: -140, dir: 1, hopCooldown: 0, groupUntil: 0 },
  { key: "black",  el: document.querySelector(".kitty.black"),  speed: 1.85, laneTopPct: 78, x: -240, dir: 1, hopCooldown: 0, groupUntil: 0 },
  { key: "fluffy", el: document.querySelector(".kitty.fluffy"), speed: 1.55, laneTopPct: 68, x: -340, dir: 1, hopCooldown: 0, groupUntil: 0 },
].filter(k => k.el);

function rect(el) { return el.getBoundingClientRect(); }

function nearSameLane(aRect, bRect) {
  const ay = (aRect.top + aRect.bottom) / 2;
  const by = (bRect.top + bRect.bottom) / 2;
  return Math.abs(ay - by) < 55;
}

function hop(kitty) {
  if (kitty.hopCooldown > 0) return;
  kitty.hopCooldown = 40;

  kitty.el.classList.remove("hopping");
  void kitty.el.offsetWidth; // restart animation
  kitty.el.classList.add("hopping");
}

// “Group mode”: sometimes orange kitty runs near another kitty for a bit
function maybeStartGroupMode(now) {
  const orange = kittyState.find(k => k.key === "orange");
  if (!orange) return;

  // already in group mode?
  if (now < orange.groupUntil) return;

  // small chance to group up every ~frame
  if (Math.random() < 0.006) {
    const friend = kittyState.filter(k => k.key !== "orange")[Math.floor(Math.random() * 2)];
    if (!friend) return;

    // group for 4–7 seconds
    orange.groupUntil = now + rand(4000, 7000);

    // match lane and roughly match speed for the duration
    orange.laneTopPct = friend.laneTopPct + (Math.random() < 0.5 ? -2 : 2);
    orange.speed = friend.speed + rand(-0.2, 0.35);

    // position orange near friend (behind or beside)
    orange.x = friend.x - rand(70, 140) * friend.dir;
    orange.dir = friend.dir;
  } else {
    // drift back to default lane/speed slowly if not grouping
    orange.laneTopPct += (72 - orange.laneTopPct) * 0.02;
    orange.speed += (2.25 - orange.speed) * 0.02;
  }
}

function tickKitties() {
  const vw = window.innerWidth;
  const now = performance.now();

  maybeStartGroupMode(now);

  for (const kitty of kittyState) {
    // Place on lane
    kitty.el.style.top = `${kitty.laneTopPct}%`;

    // Move
    kitty.x += kitty.speed * kitty.dir;

    // Patrol/bounce edges
    const wrapPad = 170;
    if (kitty.dir === 1 && kitty.x > vw + wrapPad) kitty.dir = -1;
    if (kitty.dir === -1 && kitty.x < -wrapPad) kitty.dir = 1;

    // Apply position + facing
    kitty.el.style.left = `${kitty.x}px`;
    kitty.el.style.setProperty("--facing", kitty.dir === 1 ? 1 : -1);

    if (kitty.hopCooldown > 0) kitty.hopCooldown--;

    // Hop when approaching mushrooms in same lane
    const kRect = rect(kitty.el);

    for (const mush of mushroomEls) {
      const mRect = rect(mush);
      if (!nearSameLane(kRect, mRect)) continue;

      const approaching =
        (kitty.dir === 1 && kRect.right < mRect.left && (mRect.left - kRect.right) < 68) ||
        (kitty.dir === -1 && kRect.left > mRect.right && (kRect.left - mRect.right) < 68);

      if (approaching) hop(kitty);
    }
  }

  requestAnimationFrame(tickKitties);
}

window.addEventListener("load", () => {
  kittyState.forEach(k => {
    k.el.style.position = "fixed";
    k.el.style.left = `${k.x}px`;
  });
  requestAnimationFrame(tickKitties);
});

/* -----------------------
   DRAGON MINI-GAME LOGIC
------------------------ */
let chosenDragon = null;

const stepPickDragon = document.getElementById("stepPickDragon");
const stepPickTreat = document.getElementById("stepPickTreat");
const stepResult = document.getElementById("stepResult");

const resultText = document.getElementById("resultText");
const rideRow = document.getElementById("rideRow");
const rideBtn = document.getElementById("rideBtn");
const resetBtn = document.getElementById("resetBtn");

const sky = document.getElementById("sky");
const dragon = document.getElementById("dragon");
const rider = document.getElementById("rider");

document.querySelectorAll("[data-dragon]").forEach(btn => {
  btn.addEventListener("click", () => {
    chosenDragon = btn.dataset.dragon;
    stepPickDragon?.classList.add("hidden");
    stepPickTreat?.classList.remove("hidden");
  });
});

document.querySelectorAll("[data-treat]").forEach(btn => {
  btn.addEventListener("click", () => {
    const treat = btn.dataset.treat;
    const outcome = getOutcome(chosenDragon, treat);

    stepPickTreat?.classList.add("hidden");
    stepResult?.classList.remove("hidden");

    rideRow?.classList.add("hidden");
    sky?.classList.add("hidden");

    if (outcome.type === "fire") {
      resultText.textContent = `Your ${outcome.name} dragon breathes FIRE 🔥 and looks smug about it.`;
    } else if (outcome.type === "wings") {
      resultText.textContent = `Your ${outcome.name} dragon spreads its WINGS 🪽 — it trusts you enough to fly!`;
      rideRow?.classList.remove("hidden");
    } else {
      resultText.textContent = `Your ${outcome.name} dragon BITES you 😼 (not fatal, just disrespectful).`;
    }
  });
});

rideBtn?.addEventListener("click", () => {
  sky?.classList.remove("hidden");
  startRideAnimation();
});

resetBtn?.addEventListener("click", () => {
  chosenDragon = null;
  stepResult?.classList.add("hidden");
  stepPickTreat?.classList.add("hidden");
  stepPickDragon?.classList.remove("hidden");
  sky?.classList.add("hidden");
});

function getOutcome(dragonType, treat) {
  const dragonName = {
    ember: "Ember",
    storm: "Storm",
    moss: "Moss"
  }[dragonType] || "Mysterious";

  // Treat mapping (simple + predictable)
  if (treat === "spicyJerky") return { type: "fire", name: dragonName };
  if (treat === "stardustBerry") return { type: "wings", name: dragonName };
  return { type: "bite", name: dragonName }; // marshmallow = chaotic neutral
}

let animId = null;
function startRideAnimation() {
  if (!dragon || !rider) return;
  cancelAnimationFrame(animId);

  let x = 10;
  let dir = 1;

  function tick() {
    x += 2.4 * dir;
    if (x > 520) dir = -1;
    if (x < 10) dir = 1;

    dragon.style.left = `${x}px`;
    rider.style.left = `${x + 54}px`;

    animId = requestAnimationFrame(tick);
  }
  tick();
}
