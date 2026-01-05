const overlay = document.getElementById("enterOverlay");
const enterBtn = document.getElementById("enterBtn");
const bgm = document.getElementById("bgm");

enterBtn.addEventListener("click", async () => {
  // Autoplay is usually blocked until a user gesture. This click is the gesture.
  try {
    await bgm.play();
  } catch (e) {
    // If it fails, user can click again or choose muted audio.
    console.warn("Audio blocked:", e);
  }
  overlay.style.display = "none";
});

/* -----------------------
   Dragon mini-game logic
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
    stepPickDragon.classList.add("hidden");
    stepPickTreat.classList.remove("hidden");
  });
});

document.querySelectorAll("[data-treat]").forEach(btn => {
  btn.addEventListener("click", () => {
    const treat = btn.dataset.treat;
    const outcome = getOutcome(chosenDragon, treat);

    stepPickTreat.classList.add("hidden");
    stepResult.classList.remove("hidden");

    rideRow.classList.add("hidden");
    sky.classList.add("hidden");

    if (outcome.type === "fire") {
      resultText.textContent = `Your ${outcome.name} dragon breathes FIRE 🔥 and looks extremely pleased with itself.`;
    } else if (outcome.type === "wings") {
      resultText.textContent = `Your ${outcome.name} dragon spreads its WINGS 🪽 — it trusts you enough to fly!`;
      rideRow.classList.remove("hidden");
    } else {
      resultText.textContent = `Your ${outcome.name} dragon BITES you 😼 (not fatal, just rude).`;
    }
  });
});

rideBtn.addEventListener("click", () => {
  sky.classList.remove("hidden");
  startRideAnimation();
});

resetBtn.addEventListener("click", () => {
  chosenDragon = null;
  stepResult.classList.add("hidden");
  stepPickTreat.classList.add("hidden");
  stepPickDragon.classList.remove("hidden");
  sky.classList.add("hidden");
});

function getOutcome(dragonType, treat) {
  // Simple mapping: treats influence outcomes
  // You can expand this into probabilities, leveling, inventory, etc.
  const dragonName = {
    ember: "Ember",
    storm: "Storm",
    moss: "Moss"
  }[dragonType] || "Mysterious";

  if (treat === "spicyJerky") return { type: "fire", name: dragonName };
  if (treat === "stardustBerry") return { type: "wings", name: dragonName };
  return { type: "bite", name: dragonName }; // marshmallow = chaotic neutral
}

let animId = null;
function startRideAnimation() {
  cancelAnimationFrame(animId);

  let x = 10;
  let dir = 1;

  function tick() {
    x += 2.2 * dir;
    if (x > 420) dir = -1;
    if (x < 10) dir = 1;

    dragon.style.left = `${x}px`;
    rider.style.left = `${x + 50}px`;

    animId = requestAnimationFrame(tick);
  }
  tick();
}
