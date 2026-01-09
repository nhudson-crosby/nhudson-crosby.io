(() => {
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

  // Dragon game
  const stepPickDragon = qs("#stepPickDragon");
  const stepPickTreat = qs("#stepPickTreat");
  const stepResult = qs("#stepResult");
  const resultText = qs("#resultText");
  const rideRow = qs("#rideRow");
  const rideBtn = qs("#rideBtn");
  const resetBtn = qs("#resetBtn");
  const dragonImg = qs("#dragonImg");
  const dragonMeta = qs("#dragonMeta");

  // ---------- Now playing ----------
  const playlist = [
    "2010 pop era ✨",
    "Ke$ha-coded chaos 💖",
    "Miley chorus in the distance 🌙",
    "sparkly forest rave 🍄"
  ];
  if (npText) npText.textContent = pick(playlist);

  // ---------- Music gate ----------
  async function tryPlayMusic() {
    if (!bgm) return;
    try { await bgm.play(); } catch (e) {}
  }

  function setMuted(muted) {
    if (!bgm) return;
    bgm.muted = muted;
    if (!muted) tryPlayMusic();
  }

  function closeOverlay() {
    if (!enterOverlay) return;
    enterOverlay.classList.add("hidden");
  }

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

  // ---------- Scene assets (YOUR REAL PATHS) ----------
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
    black:  { runClass: "black run",  idleClass: "black idle"  },
    grey:   { runClass: "grey walk",  idleClass: "grey idle"   },
  };

  // ---------- Scene state ----------
  const state = {
    mushrooms: [],
    cats: [],
    started: false,
    chaseCooldown: 0,
  };

  function clearScene() {
    if (!sceneLayer) return;
    sceneLayer.innerHTML = "";
    state.mushrooms = [];
    state.cats = [];
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

  // Place mushrooms in a ground band; avoid overlap
  function spawnMushrooms(count = 14) {
    const { w, h } = sceneDims();
    const groundYMin = h * 0.60;
    const groundYMax = h * 0.86;

    const placedRects = [];

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom";
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";

      // IMPORTANT: don't leave everything at 0,0 while loading
      img.style.left = `${rand(20, w - 120)}px`;
      img.style.top = `${rand(groundYMin, groundYMax)}px`;

      sceneLayer.appendChild(img);

      img.onload = () => {
        const mw = img.naturalWidth
          ? clamp(img.naturalWidth * 0.22, 44, 120)
          : 88;
        img.style.width = mw + "px";

        let tries = 80;
        while (tries-- > 0) {
          const x = rand(16, w - mw - 16);
          const y = rand(groundYMin, groundYMax);
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;

          const r = rectInScene(img);
          const hit = placedRects.some(pr => intersects(r, pr));
          if (!hit) {
            placedRects.push(r);
            state.mushrooms.push(img);
            return;
          }
        }

        // if we failed to place after tries, still keep it (but it's rare)
        state.mushrooms.push(img);
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
      vx: rand(0.9, 1.6) * (Math.random() < 0.5 ? -1 : 1),
      mode: "roam",
      modeT: 0,
      target: null,
      lastHopAt: 0,
    };
  }

  function spawnKitties() {
    const { w, h } = sceneDims();
    const baseY = h * 0.72;

    state.cats.push(makeKitty("orange", w * 0.20, baseY));
    state.cats.push(makeKitty("black",  w * 0.60, baseY + 10));
    state.cats.push(makeKitty("grey",   w * 0.40, baseY + 18));

    // grey starts bored sometimes
    const grey = state.cats.find(c => c.kind === "grey");
    if (grey) {
      grey.mode = "idle";
      grey.modeT = 180;
      grey.el.className = "kitty grey idle";
    }
  }

  function updateKitty(kitty, dt) {
    const { w, h } = sceneDims();

    // personalities
    const speedMul =
      kitty.kind === "black" ? 1.25 :
      kitty.kind === "grey"  ? 0.85 : 1.0;

    if (kitty.modeT > 0) kitty.modeT -= dt;

    // grey special modes occasionally
    if (kitty.kind === "grey" && kitty.modeT <= 0 && Math.random() < 0.003) {
      const mode = pick(["idle", "sleep", "hiss"]);
      kitty.mode = mode;
      kitty.modeT = randi(180, 320);
      kitty.el.className =
        mode === "sleep" ? "kitty grey sleep" :
        mode === "hiss"  ? "kitty grey hiss"  :
                           "kitty grey idle";
    }

    // if grey is idle/sleep/hiss, minimal movement
    if (kitty.kind === "grey" && (kitty.mode === "sleep" || kitty.mode === "idle" || kitty.mode === "hiss")) {
      kitty.x += kitty.vx * 0.02 * dt;
      kitty.x = clamp(kitty.x, 10, w - 130);
      kitty.el.style.left = `${kitty.x}px`;
      return;
    }

    // default anim classes
    if (kitty.kind === "grey") kitty.el.className = "kitty grey walk";
    if (kitty.kind === "black") kitty.el.className = "kitty black run";
    if (kitty.kind === "orange") kitty.el.className = "kitty orange run";

    // wander
    kitty.vx += rand(-0.02, 0.02) * dt;
    kitty.vx = clamp(kitty.vx, -2.2, 2.2);

    // avoid mushrooms + hop
    const kRect = { x: kitty.x + 16, y: kitty.y + 44, w: 72, h: 48 };
    let nearest = null;
    let nearestDist = Infinity;

    for (const m of state.mushrooms) {
      const mr = rectInScene(m);
      const dx = (mr.x + mr.w/2) - (kRect.x + kRect.w/2);
      const dy = (mr.y + mr.h/2) - (kRect.y + kRect.h/2);
      const d2 = dx*dx + dy*dy;
      if (d2 < nearestDist) { nearestDist = d2; nearest = mr; }
    }

    if (nearest && nearestDist < 220*220) {
      const away = (kRect.x + kRect.w/2) - (nearest.x + nearest.w/2);
      kitty.vx += clamp(away * 0.0008, -0.55, 0.55) * dt;

      const willHit = intersects(
        kRect,
        { x: nearest.x + 8, y: nearest.y + 18, w: nearest.w - 16, h: nearest.h - 18 }
      );

      const now = performance.now();
      if (willHit && now - kitty.lastHopAt > 800) {
        kitty.lastHopAt = now;
        kitty.el.classList.add("hop");
        setTimeout(() => kitty.el.classList.remove("hop"), 260);
        kitty.vx += (kitty.vx >= 0 ? 0.9 : -0.9);
      }
    }

    // move
    const speed = kitty.vx * speedMul;
    kitty.x += speed * dt * 0.06;

    // bounce edges
    if (kitty.x < 8) { kitty.x = 8; kitty.vx *= -1; }
    if (kitty.x > w - 130) { kitty.x = w - 130; kitty.vx *= -1; }

    // face direction
    kitty.el.style.setProperty("--facing", speed >= 0 ? "1" : "-1");

    // ground y
    const groundY = h * 0.72 + (kitty.kind === "black" ? 10 : 0) + (kitty.kind === "grey" ? 18 : 0);
    kitty.y = groundY;

    kitty.el.style.left = `${kitty.x}px`;
    kitty.el.style.top  = `${kitty.y}px`;
  }

  let lastT = 0;
  function tick(t) {
    if (!state.started) return;
    const dt = Math.min(32, t - lastT || 16);
    lastT = t;

    for (const k of state.cats) updateKitty(k, dt);
    requestAnimationFrame(tick);
  }

  function bootScene() {
    if (state.started) return;
    state.started = true;

    clearScene();

    const w = sceneDims().w;
    const mushCount = w < 650 ? 10 : 16;

    spawnMushrooms(mushCount);
    spawnKitties();

    requestAnimationFrame((t) => {
      lastT = t;
      requestAnimationFrame(tick);
    });
  }

  // ---------- Dragon game wiring (YOUR REAL PATHS) ----------
  const DRAGONS = {
    ember: "assets/dragons/ember.png",
    storm: "assets/dragons/storm.png",
    moss:  "assets/dragons/moss.png",
  };

  let selectedDragon = null;
  let selectedTreat = null;

  function showStep(stepEl) {
    [stepPickDragon, stepPickTreat, stepResult].forEach((s) => s.classList.add("hidden"));
    stepEl.classList.remove("hidden");
  }

  function outcome(dragon, treat) {
    if (treat === "spicyJerky") return "fire";
    if (treat === "stardustBerry") return "wings";
    return "bite";
  }

  function renderResult() {
    const out = outcome(selectedDragon, selectedTreat);

    if (dragonImg) dragonImg.src = DRAGONS[selectedDragon] || "";
    if (dragonMeta) {
      dragonMeta.innerHTML = `
        <div><strong>${selectedDragon.toUpperCase()}</strong> dragon chosen.</div>
        <div>Treat: <strong>${selectedTreat}</strong>.</div>
      `;
    }

    if (rideRow) rideRow.classList.add("hidden");

    if (out === "fire") {
      resultText.textContent = "Your dragon learns FIRE BREATH 🔥 (it’s a little dramatic but we love that).";
    } else if (out === "wings") {
      resultText.textContent = "Your dragon grows WINGS 🪽. Congratulations: you may now ride.";
      if (rideRow) rideRow.classList.remove("hidden");
    } else {
      resultText.textContent = "Your dragon BITES you. Not hard. Just… disrespectfully.";
    }

    showStep(stepResult);
  }

  document.querySelectorAll("[data-dragon]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDragon = btn.getAttribute("data-dragon");
      selectedTreat = null;
      showStep(stepPickTreat);
    });
  });

  document.querySelectorAll("[data-treat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedTreat = btn.getAttribute("data-treat");
      renderResult();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedDragon = null;
      selectedTreat = null;
      showStep(stepPickDragon);
    });
  }

  if (rideBtn) {
    rideBtn.addEventListener("click", () => {
      alert("You ride into the night sky like a tiny legendary icon. ✨🪽🐉");
    });
  }

})();
