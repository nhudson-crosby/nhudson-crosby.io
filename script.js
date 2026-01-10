/* Forestspace - script.js (fixed: NO Python allowed in browser) */
(() => {
  const qs = (s) => document.querySelector(s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  console.log("✅ script.js loaded");

  // Elements
  const enterOverlay = qs("#enterOverlay");
  const enterBtn = qs("#enterBtn");
  const muteBtn = qs("#muteBtn");
  const bgm = qs("#bgm");

  const scene = qs("#scene");
  const sceneLayer = qs("#sceneLayer");

  // -------- Overlay / Music --------
  function closeOverlay() {
    if (!enterOverlay) return;
    enterOverlay.classList.add("hidden");
    enterOverlay.style.display = "none";
    enterOverlay.style.pointerEvents = "none";
    console.log("✅ overlay closed");
  }

  async function tryPlay() {
    if (!bgm) return;
    try {
      await bgm.play();
    } catch (e) {
      // autoplay blocked is fine
      console.log("ℹ️ autoplay blocked (expected)");
    }
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
      if (bgm) bgm.muted = false;
      await tryPlay();
      closeOverlay();
      bootScene();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (bgm) bgm.muted = true;
      closeOverlay();
      bootScene();
    });
  }

  // -------- Scene assets --------
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

  // Helpers for placement
  function rectInScene(el) {
    const sr = scene.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
  }
  function intersects(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  const state = { started: false, mushrooms: [] };

  function clearScene() {
    if (!sceneLayer) return;
    sceneLayer.innerHTML = "";
    state.mushrooms = [];
  }

  function sceneDims() {
    const r = scene.getBoundingClientRect();
    return { w: r.width, h: r.height };
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

    // Put them on the grass area (upper part of bottom third)
    const yMin = h * 0.62;
    const yMax = h * 0.82;

    const placed = [];

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom";
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";
      img.decoding = "async";
      img.loading = "lazy";

      sceneLayer.appendChild(img);

      img.onload = () => {
        // smaller, more natural
        const mw = clamp((img.naturalWidth || 300) * 0.18, 45, 95);
        img.style.width = `${mw}px`;

        let tries = 80;
        while (tries-- > 0) {
          const x = rand(20, w - mw - 20);
          const y = rand(yMin, yMax);
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;

          const r = rectInScene(img);
          const hit = placed.some((pr) => intersects(r, pr));
          if (!hit) {
            placed.push(r);
            break;
          }
        }

        state.mushrooms.push(img);
      };
    }
  }

  function bootScene() {
    if (state.started) return;
    state.started = true;

    if (!scene || !sceneLayer) return;

    clearScene();
    setBackground();

    const w = sceneDims().w;
    spawnMushrooms(w < 650 ? 9 : 13);

    console.log("✅ scene booted");
  }

})();
