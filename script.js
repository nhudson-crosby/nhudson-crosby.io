/* Forestspace - script.js (FULL FILE, overlay fix + safe boot) */
document.addEventListener("DOMContentLoaded", () => {
  const qs = (s) => document.querySelector(s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  console.log("✅ script.js loaded (DOMContentLoaded)");

  const enterOverlay = qs("#enterOverlay");
  const enterBtn = qs("#enterBtn");
  const muteBtn = qs("#muteBtn");
  const bgm = qs("#bgm");

  const scene = qs("#scene");
  const sceneLayer = qs("#sceneLayer");

  // ---- HARD CLOSE overlay (no reliance on CSS) ----
  function closeOverlay() {
    if (!enterOverlay) {
      console.warn("❌ #enterOverlay not found");
      return;
    }
    enterOverlay.classList.add("hidden");
    enterOverlay.style.display = "none";
    enterOverlay.style.pointerEvents = "none";
    console.log("✅ overlay closed");
  }

  async function tryPlay() {
    if (!bgm) return;
    try {
      await bgm.play();
      console.log("✅ music playing");
    } catch (e) {
      console.log("ℹ️ autoplay blocked (normal until click gesture)");
    }
  }

  // ---- Scene assets ----
  const BG = "assets/ui/bg-forest.png";
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

  function intersects(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  const state = { started: false };

  function sceneDims() {
    const r = scene.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function rectInScene(el) {
    const sr = scene.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
  }

  function clearScene() {
    if (!sceneLayer) return;
    sceneLayer.innerHTML = "";
  }

  function setBackground() {
    if (!sceneLayer) return;
    sceneLayer.style.backgroundImage = `url("${BG}")`;
    sceneLayer.style.backgroundSize = "cover";
    sceneLayer.style.backgroundPosition = "center";
    sceneLayer.style.backgroundRepeat = "no-repeat";
  }

  function spawnMushrooms(count = 12) {
    const { w, h } = sceneDims();

    // grass band (higher) to avoid stream area
    const yMin = h * 0.62;
    const yMax = h * 0.82;

    const placed = [];

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom";
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";

      // give an initial non-zero position so they don't appear stacked while loading
      img.style.left = `${rand(20, w - 120)}px`;
      img.style.top = `${rand(yMin, yMax)}px`;

      sceneLayer.appendChild(img);

      img.onload = () => {
        const mw = clamp((img.naturalWidth || 300) * 0.18, 45, 95);
        img.style.width = `${mw}px`;

        let tries = 90;
        while (tries-- > 0) {
          const x = rand(20, w - mw - 20);
          const y = rand(yMin, yMax);
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;

          const r = rectInScene(img);
          const hit = placed.some((p) => intersects(r, p));
          if (!hit) {
            placed.push(r);
            break;
          }
        }
      };

      img.onerror = () => console.warn("❌ mushroom failed:", img.src);
    }
  }

  function bootScene() {
    if (state.started) return;
    if (!scene || !sceneLayer) {
      console.warn("❌ missing #scene or #sceneLayer");
      return;
    }
    state.started = true;

    clearScene();
    setBackground();

    const w = sceneDims().w;
    spawnMushrooms(w < 650 ? 9 : 13);

    console.log("✅ scene booted");
  }

  // ---- Wire overlay buttons ----
  if (!enterBtn) console.warn("❌ #enterBtn not found");
  if (!muteBtn) console.warn("❌ #muteBtn not found");

  enterBtn?.addEventListener("click", async () => {
    console.log("✅ enter clicked");
    if (bgm) bgm.muted = false;
    await tryPlay();
    closeOverlay();
    bootScene();
  });

  muteBtn?.addEventListener("click", () => {
    console.log("✅ mute clicked");
    if (bgm) bgm.muted = true;
    closeOverlay();
    bootScene();
  });
});
