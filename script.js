/* =========================================================
   Forestspace / Myspace vibes
   script.js (FULL FILE) — crash-proof overlay wiring
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Helpers ----------
  const qs = (sel) => document.querySelector(sel);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function intersects(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  // ---------- Elements ----------
  const enterOverlay = qs("#enterOverlay");
  const enterBtn = qs("#enterBtn");
  const muteBtn = qs("#muteBtn");
  const bgm = qs("#bgm");

  const npText = qs("#npText");
  const toggleMusicBtn = qs("#toggleMusicBtn");

  const scene = qs("#scene");
  const sceneLayer = qs("#sceneLayer");

  // Dragon game (all optional)
  const stepPickDragon = qs("#stepPickDragon");
  const stepPickTreat = qs("#stepPickTreat");
  const stepResult = qs("#stepResult");
  const resultText = qs("#resultText");
  const rideRow = qs("#rideRow");
  const rideBtn = qs("#rideBtn");
  const resetBtn = qs("#resetBtn");

  // ---------- Safety: if script is loaded on a page without these, do nothing ----------
  // (But keep overlay working if it exists.)
  if (!enterOverlay) {
    console.warn("No #enterOverlay found. Overlay wiring skipped.");
  }

  // ---------- Now playing ----------
  const playlist = [
    "2010 pop era ✨",
    "Ke$ha-coded chaos 💖",
    "Miley chorus in the distance 🌙",
    "sparkly forest rave 🍄",
  ];
  if (npText) npText.textContent = pick(playlist);

  // ---------- Music ----------
  let musicEnabled = false;

  async function tryPlayMusic() {
    if (!bgm) return;
    try {
      await bgm.play();
      musicEnabled = true;
      if (toggleMusicBtn) toggleMusicBtn.textContent = "♫";
    } catch (e) {
      musicEnabled = false;
      if (toggleMusicBtn) toggleMusicBtn.textContent = "♫";
      // Autoplay blocked is normal until a user gesture.
    }
  }

  function setMuted(muted) {
    if (!bgm) return;
    bgm.muted = muted;
    if (!muted) tryPlayMusic();
  }

  function closeOverlay() {
    if (!enterOverlay) return;
    // Works even if you forgot to define .hidden in CSS
    enterOverlay.classList.add("hidden");
    enterOverlay.style.display = "none";
    enterOverlay.style.pointerEvents = "none";
  }

  // ---------- Scene assets ----------
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

  const CATS = {
    orange: { runClass: "orange run", idleClass: "orange idle" },
    black: { runClass: "black run", idleClass: "black idle" },
    grey: { runClass: "grey walk", idleClass: "grey idle" },
  };

  // ---------- Scene state ----------
  const state = {
    mushrooms: [],
    cats: [],
    started: false,
    chaseCooldown: 0,
  };

  function sceneDims() {
    if (!scene) return { w: 0, h: 0, left: 0, top: 0 };
    const r = scene.getBoundingClientRect();
    return { w: r.width, h: r.height, left: r.left, top: r.top };
  }

  function rectInScene(el) {
    const sr = scene.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
  }

  function clearScene() {
    if (!sceneLayer) return;
    sceneLayer.innerHTML = "";
    state.mushrooms = [];
    state.cats = [];
  }

  // Place mushrooms in a “grass band” (not the stream)
  function spawnMushrooms(count = 12) {
    if (!sceneLayer || !scene) return;
    const { w, h } = sceneDims();

    // Tune these if needed: higher = lower on screen
    const bandYMin = h * 0.62;
    const bandYMax = h * 0.82;

    const placed = [];
    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom " + (Math.random() < 0.45 ? "twinkle" : "");
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";

      sceneLayer.appendChild(img);

      img.onload = () => {
        const mw = img.naturalWidth ? clamp(img.naturalWidth * 0.22, 55, 110) : 88;
        img.style.width = mw + "px";

        let tries = 80;
        while (tries-- > 0) {
          const x = rand(22, w - mw - 22);
          const y = rand(bandYMin, bandYMax);
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

      img.onerror = () => {
        console.warn("Mushroom failed to load:", img.src);
      };
    }
  }

  function makeKitty(kind, x, y) {
    const el = document.createElement("div");
    el.className = `kitty ${CATS[kind].runClass}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--facing", "1");
    sceneLayer.appendChild(el);

    return {
      kind,
      el,
      x,
      y,
      vx: rand(0.6, 1.1) * (Math.random() < 0.5 ? -1 : 1), // slower base
      mode: "roam",
      modeT: 0,
      target: null,
      lastHopAt: 0,
    };
  }

  function spawnKitties() {
    if (!sceneLayer || !scene) return;
    const { w, h } = sceneDims();

    // Move them up onto grass (less “stream overlap”)
    const groundY = h * 0.70;

    state.cats.push(makeKitty("orange", w * 0.18, groundY));
    state.cats.push(makeKitty("black", w * 0.58, groundY + 10));
    state.cats.push(makeKitty("grey", w * 0.40, groundY + 18));

    // Grey starts bored
    const grey = state.cats.find((c) => c.kind === "grey");
    if (grey) {
      grey.mode = "idle";
      grey.modeT = 200;
      grey.el.className = "kitty grey idle";
      grey.vx *= 0.3;
    }
  }

  function updateKitty(kitty, dt) {
    if (!scene) return;
    const { w, h } = sceneDims();

    // personality speed multipliers — slower overall
    const speedMul =
      kitty.kind === "black" ? 1.15 :
      kitty.kind === "grey"  ? 0.75 :
                               0.92;

    if (kitty.modeT > 0) kitty.modeT -= dt;

    // Grey occasionally sleeps/hisses
    if (kitty.kind === "grey" && kitty.modeT <= 0 && Math.random() < 0.003) {
      kitty.mode = pick(["idle", "sleep", "hiss"]);
      kitty.modeT = randi(160, 300);
      kitty.el.className =
        kitty.mode === "sleep" ? "kitty grey sleep" :
        kitty.mode === "hiss"  ? "kitty grey hiss"  :
                                 "kitty grey idle";
    }

    // If grey is in special mode, barely moves
    if (kitty.kind === "grey" && (kitty.mode === "sleep" || kitty.mode === "idle" || kitty.mode === "hiss")) {
      kitty.vx *= 0.92;
      kitty.x += kitty.vx * 0.03 * dt;
      kitty.x = clamp(kitty.x, 10, w - 110);
      kitty.el.style.left = `${kitty.x}px`;
      return;
    }

    // Default animation classes
    if (kitty.kind === "grey") kitty.el.className = "kitty grey walk";
    else if (kitty.kind === "black") kitty.el.className = "kitty black run";
    else kitty.el.className = "kitty orange run";

    // Wander
    kitty.vx += rand(-0.012, 0.012) * dt;
    kitty.vx = clamp(kitty.vx, -1.55, 1.55);

    // Avoid mushrooms (simple)
    const kRect = { x: kitty.x + 10, y: kitty.y + 36, w: 66, h: 44 };

    let nearest = null;
    let nearestDist = Infinity;
    for (const m of state.mushrooms) {
      const mr = rectInScene(m);
      const dx = (mr.x + mr.w / 2) - (kRect.x + kRect.w / 2);
      const dy = (mr.y + mr.h / 2) - (kRect.y + kRect.h / 2);
      const d2 = dx * dx + dy * dy;
      if (d2 < nearestDist) {
        nearestDist = d2;
        nearest = mr;
      }
    }

    if (nearest && nearestDist < 180 * 180) {
      const centerK = kRect.x + kRect.w / 2;
      const centerM = nearest.x + nearest.w / 2;
      const away = centerK - centerM;

      kitty.vx += clamp(away * 0.0007, -0.35, 0.35) * dt;

      const willHit = intersects(kRect, { x: nearest.x + 6, y: nearest.y + 16, w: nearest.w - 12, h: nearest.h - 16 });
      const now = performance.now();
      if (willHit && now - kitty.lastHopAt > 900) {
        kitty.lastHopAt = now;
        kitty.el.classList.add("hop");
        setTimeout(() => kitty.el.classList.remove("hop"), 260);
        kitty.vx += (kitty.vx >= 0 ? 0.45 : -0.45);
      }
    }

    // Move
    const speed = kitty.vx * speedMul;
    kitty.x += speed * dt * 0.055;

    // bounce edges
    if (kitty.x < 8) { kitty.x = 8; kitty.vx *= -1; }
    if (kitty.x > w - 110) { kitty.x = w - 110; kitty.vx *= -1; }

    kitty.el.style.setProperty("--facing", speed >= 0 ? "1" : "-1");

    // Place on “grass”
    const baseY = h * 0.70;
    const kindOffset = (kitty.kind === "black" ? 8 : 0) + (kitty.kind === "grey" ? 18 : 0);
    kitty.y = baseY + kindOffset;

    kitty.el.style.left = `${kitty.x}px`;
    kitty.el.style.top = `${kitty.y}px`;
  }

  function bootScene() {
    if (state.started) return;
    if (!scene || !sceneLayer) {
      console.warn("Scene missing (#scene / #sceneLayer). Skipping scene boot.");
      return;
    }

    state.started = true;
    clearScene();

    const w = sceneDims().w;
    const mushCount = w < 650 ? 9 : 13;

    spawnMushrooms(mushCount);
    spawnKitties();

    document.querySelectorAll(".card").forEach((c) => c.classList.add("glitter-hover"));

    let lastT = 0;
    function tick(t) {
      const dt = Math.min(32, t - lastT || 16);
      lastT = t;

      for (const k of state.cats) updateKitty(k, dt);

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Overlay wiring ----------
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      setMuted(false);
      closeOverlay();
      bootScene();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      setMuted(true);
      closeOverlay();
      bootScene();
    });
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (!enterOverlay) return;
    // Only when overlay is visible
    const visible = enterOverlay.style.display !== "none" && !enterOverlay.classList.contains("hidden");
    if (!visible) return;

    if (e.key === "Enter") {
      e.preventDefault();
      enterBtn?.click();
    }
    if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      muteBtn?.click();
    }
  });

  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", async () => {
      if (!bgm) return;
      if (bgm.paused) {
        bgm.muted = false;
        await tryPlayMusic();
      } else {
        bgm.pause();
      }
    });
  }

  // ---------- Dragon game (optional; won’t crash) ----------
  const DRAGONS = {
    ember: "assets/dragons/ember.png",
    storm: "assets/dragons/storm.png",
    moss:  "assets/dragons/moss.png",
  };

  let dragonPanel = null;
  function ensureDragonPanel() {
    if (!stepResult) return null;
    if (dragonPanel) return dragonPanel;

    const wrap = document.createElement("div");
    wrap.className = "dragonStage";

    const card = document.createElement("div");
    card.className = "dragonCard";
    const img = document.createElement("img");
    img.alt = "dragon";
    img.src = "";
    card.appendChild(img);

    wrap.appendChild(card);
    stepResult.appendChild(wrap);

    dragonPanel = { wrap, img };
    return dragonPanel;
  }

  function showStep(stepEl) {
    if (!stepPickDragon || !stepPickTreat || !stepResult) return;
    [stepPickDragon, stepPickTreat, stepResult].forEach((s) => s.classList.add("hidden"));
    stepEl.classList.remove("hidden");
  }

  function outcome(treat) {
    if (treat === "spicyJerky") return "fire";
    if (treat === "stardustBerry") return "wings";
    return "bite";
  }

  let selectedDragon = null;
  let selectedTreat = null;

  function renderResult() {
    if (!resultText || !rideRow || !stepResult) return;

    const out = outcome(selectedTreat);
    const panel = ensureDragonPanel();
    if (panel) panel.img.src = DRAGONS[selectedDragon] || "";

    rideRow.classList.add("hidden");
    if (out === "fire") {
      resultText.textContent = "Your dragon learns FIRE BREATH 🔥";
    } else if (out === "wings") {
      resultText.textContent = "Your dragon grows WINGS 🪽. You may now ride.";
      rideRow.classList.remove("hidden");
    } else {
      resultText.textContent = "Your dragon BITES you. Disrespectfully.";
    }

    showStep(stepResult);
  }

  document.querySelectorAll("[data-dragon]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDragon = btn.getAttribute("data-dragon");
      selectedTreat = null;
      if (stepPickTreat) showStep(stepPickTreat);
    });
  });

  document.querySelectorAll("[data-treat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedTreat = btn.getAttribute("data-treat");
      renderResult();
    });
  });

  resetBtn?.addEventListener("click", () => {
    selectedDragon = null;
    selectedTreat = null;
    if (stepPickDragon) showStep(stepPickDragon);
  });

  rideBtn?.addEventListener("click", () => {
    alert("You ride into the night sky like a tiny legendary icon. ✨🪽🐉");
  });
});
