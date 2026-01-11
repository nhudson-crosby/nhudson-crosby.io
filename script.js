/* Forestspace - script.js (FULL FILE: overlay + background + mushrooms + kitties + dragons) */

document.addEventListener("DOMContentLoaded", () => {
  const qs = (s) => document.querySelector(s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  console.log("✅ script.js loaded (DOMContentLoaded)");

  // Elements
  const enterOverlay = qs("#enterOverlay");
  const enterBtn = qs("#enterBtn");
  const muteBtn = qs("#muteBtn");
  const bgm = qs("#bgm");

  const npText = qs("#npText");
  const toggleMusicBtn = qs("#toggleMusicBtn");

  const scene = qs("#scene");
  const sceneLayer = qs("#sceneLayer");

  // Dragon game elements
  const stepPickDragon = qs("#stepPickDragon");
  const stepPickTreat = qs("#stepPickTreat");
  const stepResult = qs("#stepResult");
  const resultText = qs("#resultText");
  const resetBtn = qs("#resetBtn");
  const dragonImg = qs("#dragonImg");

  // ---- Now Playing ----
  const playlist = [
    "2010 pop era ✨",
    "Ke$ha-coded chaos 💖",
    "Miley chorus in the distance 🌙",
    "sparkly forest rave 🍄",
  ];
  if (npText) npText.textContent = pick(playlist);

  // ---- Overlay close (hard) ----
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
      console.log("✅ music playing");
    } catch {
      console.log("ℹ️ autoplay blocked or music missing (normal)");
    }
  }

  // Music toggle
  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", async () => {
      if (!bgm) return;
      if (bgm.paused) {
        bgm.muted = false;
        await tryPlay();
      } else {
        bgm.pause();
      }
    });
  }

  // ---- Assets ----
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

  const DRAGONS = {
    ember: "assets/dragons/ember.png",
    storm: "assets/dragons/storm.png",
    moss:  "assets/dragons/moss.png",
  };

  const CAT_CLASSES = {
    orange: { run: "kitty orange run" },
    black:  { run: "kitty black run"  },
    grey:   { run: "kitty grey walk"  },
  };

  // ---- Preload (logs missing assets) ----
  function preloadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, ok: true });
      img.onerror = () => resolve({ url, ok: false });
      img.src = url;
    });
  }

  async function preloadAll() {
    const urls = [
      BG,
      ...MUSHROOMS,
      "assets/cats/orange_run.png",
      "assets/cats/black_run.png",
      "assets/cats/grey_walk.png",
      ...Object.values(DRAGONS),
      "assets/cursor/cursor.png",
    ];

    const results = await Promise.all(urls.map(preloadImage));
    const missing = results.filter(r => !r.ok).map(r => r.url);

    if (missing.length) {
      console.warn("❌ Missing / failing assets:", missing);
    } else {
      console.log("✅ All assets loaded OK");
    }
  }

  // ---- Geometry helpers ----
  function intersects(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  function sceneDims() {
    const r = scene.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function rectInScene(el) {
    const sr = scene.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
  }

  // ---- State ----
  const state = {
    started: false,
    mushrooms: [],
    cats: [],
  };

  function clearScene() {
    if (!sceneLayer) return;
    sceneLayer.innerHTML = "";
    state.mushrooms = [];
    state.cats = [];
  }

  function setBackground() {
    if (!sceneLayer) return;
    sceneLayer.style.backgroundImage = `url("${BG}")`;
    sceneLayer.style.backgroundSize = "cover";
    sceneLayer.style.backgroundPosition = "center";
    sceneLayer.style.backgroundRepeat = "no-repeat";
  }

  // ---- Mushrooms ----
  function spawnMushrooms(count = 12) {
    const { w, h } = sceneDims();

    // A “grass band” region — tune if your stream is higher/lower
    const yMin = h * 0.62;
    const yMax = h * 0.82;

    const placed = [];

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom";
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";

      // prevent stacking while loading
      img.style.left = `${rand(20, w - 140)}px`;
      img.style.top = `${rand(yMin, yMax)}px`;

      sceneLayer.appendChild(img);

      img.onload = () => {
        const mw = clamp((img.naturalWidth || 300) * 0.18, 45, 95);
        img.style.width = `${mw}px`;

        let tries = 120;
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

        state.mushrooms.push(img);
      };

      img.onerror = () => console.warn("❌ mushroom failed:", img.src);
    }
  }

  // ---- Kitties ----
  function makeKitty(kind, x, y) {
    const el = document.createElement("div");
    el.className = CAT_CLASSES[kind].run;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--facing", "1");
    sceneLayer.appendChild(el);

    return {
      kind,
      el,
      x,
      y,
      // ✅ much slower base speed
      vx: rand(0.22, 0.45) * (Math.random() < 0.5 ? -1 : 1),
    };
  }

  function spawnKitties() {
    const { w, h } = sceneDims();

    // Put them higher (more grass, less stream)
    const baseY = h * 0.66;

    state.cats.push(makeKitty("orange", w * 0.18, baseY));
    state.cats.push(makeKitty("black",  w * 0.52, baseY + 12));
    state.cats.push(makeKitty("grey",   w * 0.36, baseY + 22));

    console.log("✅ kitties spawned:", state.cats.map(c => c.kind).join(", "));
  }

  function updateKitties(dt) {
    const { w, h } = sceneDims();

    for (const k of state.cats) {
      const speedMul =
        k.kind === "black" ? 1.00 :
        k.kind === "grey"  ? 0.70 :
                             0.85;

      // gentle wander
      k.vx += rand(-0.006, 0.006) * dt;
      k.vx = clamp(k.vx, -0.85, 0.85);

      const speed = k.vx * speedMul;

      // ✅ slower movement step
      k.x += speed * dt * 0.03;

      // bounce edges
      if (k.x < 8) { k.x = 8; k.vx *= -1; }
      if (k.x > w - 140) { k.x = w - 140; k.vx *= -1; }

      // face direction
      k.el.style.setProperty("--facing", speed >= 0 ? "1" : "-1");

      // keep them on “grass band”
      const baseY = h * 0.66;
      const off = (k.kind === "black" ? 12 : 0) + (k.kind === "grey" ? 22 : 0);
      k.y = baseY + off;

      k.el.style.left = `${k.x}px`;
      k.el.style.top = `${k.y}px`;
    }
  }

  // ---- Main scene boot + loop ----
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

    // Debug-friendly count: enough to show variety but not overload
    spawnMushrooms(w < 650 ? 10 : 14);
    spawnKitties();

    let lastT = 0;
    function tick(t) {
      const dt = Math.min(32, t - lastT || 16);
      lastT = t;
      updateKitties(dt);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    console.log("✅ scene booted");
  }

  // ---- Wire overlay buttons ----
  enterBtn?.addEventListener("click", async () => {
    console.log("✅ enter clicked");
    if (bgm) bgm.muted = false;
    await tryPlay();
    closeOverlay();
    preloadAll(); // logs missing assets
    bootScene();
  });

  muteBtn?.addEventListener("click", () => {
    console.log("✅ mute clicked");
    if (bgm) bgm.muted = true;
    closeOverlay();
    preloadAll(); // logs missing assets
    bootScene();
  });

  // ---- Dragon game ----
  let selectedDragon = null;
  let selectedTreat = null;

  function showStep(el) {
    [stepPickDragon, stepPickTreat, stepResult].forEach(s => s?.classList.add("hidden"));
    el?.classList.remove("hidden");
  }

  function outcome(treat) {
    if (treat === "spicyJerky") return "fire";
    if (treat === "stardustBerry") return "wings";
    return "bite";
  }

  function renderDragonResult() {
    if (!selectedDragon || !selectedTreat) return;

    if (dragonImg) {
      dragonImg.src = DRAGONS[selectedDragon] || "";
      dragonImg.style.display = "block";
    }

    const out = outcome(selectedTreat);
    if (out === "fire") {
      resultText.textContent = "Your dragon learns FIRE BREATH 🔥 Dramatic. Powerful. Iconic.";
    } else if (out === "wings") {
      resultText.textContent = "Your dragon grows WINGS 🪽 Congratulations: you may ride (in your imagination).";
    } else {
      resultText.textContent = "Your dragon bites you. Not hard. Just disrespectfully.";
    }

    showStep(stepResult);
  }

  // Dragon pick
  document.querySelectorAll("[data-dragon]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDragon = btn.getAttribute("data-dragon");
      selectedTreat = null;
      showStep(stepPickTreat);
    });
  });

  // Treat pick
  document.querySelectorAll("[data-treat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedTreat = btn.getAttribute("data-treat");
      renderDragonResult();
    });
  });

  // Reset
  resetBtn?.addEventListener("click", () => {
    selectedDragon = null;
    selectedTreat = null;
    if (dragonImg) dragonImg.style.display = "none";
    showStep(stepPickDragon);
  });
});
