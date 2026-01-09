/* =========================================================
   Forestspace / Myspace vibes
   script.js (FULL FILE — fixed for your repo paths)
   ========================================================= */

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

  // Dragon game elements (must exist in your index.html)
  const stepPickDragon = qs("#stepPickDragon");
  const stepPickTreat = qs("#stepPickTreat");
  const stepResult = qs("#stepResult");
  const resultText = qs("#resultText");
  const rideRow = qs("#rideRow");
  const rideBtn = qs("#rideBtn");
  const resetBtn = qs("#resetBtn");

  // ---------- Now playing ----------
  const playlist = [
    "2010 pop era ✨",
    "Ke$ha-coded chaos 💖",
    "Miley chorus drifting through the trees 🌙",
    "sparkly forest rave 🍄",
  ];
  if (npText) npText.textContent = pick(playlist);

  // ---------- Music gate ----------
  async function tryPlayMusic() {
    if (!bgm) return;
    try { await bgm.play(); } catch {}
  }

  function closeOverlay() {
    if (!enterOverlay) return;
    enterOverlay.classList.add("hidden"); // styles.css must include .overlay.hidden { display:none; }
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
      if (bgm) bgm.muted = false;
      await tryPlayMusic();
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

  // ---------- Scene assets (your repo paths) ----------
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
    orange: { runClass: "kitty orange run", idleClass: "kitty orange idle" },
    black:  { runClass: "kitty black run",  idleClass: "kitty black idle"  },
    grey:   { runClass: "kitty grey walk",  idleClass: "kitty grey idle"   },
  };

  // ---------- Scene state ----------
  const state = {
    mushrooms: [], // { el, placedRect }
    cats: [],      // kitty objects
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

  // ---------- Mushrooms (placed in a ground band) ----------
  function spawnMushrooms(count = 14) {
    const { w, h } = sceneDims();
    const groundMin = h * 0.64;
    const groundMax = h * 0.86;
    const placed = [];

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom";
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";
      img.style.left = "0px";
      img.style.top = "0px";
      sceneLayer.appendChild(img);

      img.onload = () => {
        const mw = img.naturalWidth ? clamp(img.naturalWidth * 0.25, 50, 110) : 84;
        img.style.width = `${mw}px`;

        let tries = 60;
        while (tries-- > 0) {
          const x = rand(20, w - mw - 20);
          const y = rand(groundMin, groundMax);
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;

          const r = rectInScene(img);
          const hit = placed.some(pr => intersects(r, pr));
          if (!hit) {
            placed.push(r);
            state.mushrooms.push({ el: img, rect: r });
            break;
          }
        }

        // If we failed to find a non-overlapping spot, still keep it
        if (!state.mushrooms.find(m => m.el === img)) {
          state.mushrooms.push({ el: img, rect: rectInScene(img) });
        }
      };
    }
  }

  // ---------- Kitties ----------
  function makeKitty(kind, x, y) {
    const el = document.createElement("div");
    el.className = CATS[kind].runClass;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--facing", "1");
    sceneLayer.appendChild(el);

    return {
      kind,
      el,
      x, y,
      vx: rand(0.9, 1.6) * (Math.random() < 0.5 ? -1 : 1),
      mode: "roam", // roam | chase | idle | sleep | hiss
      modeT: 0,
      target: null,
      lastHopAt: 0,
      speedMul: 1,
    };
  }

  function spawnKitties() {
    const { w, h } = sceneDims();
    const baseY = h * 0.74;

    state.cats.push(makeKitty("orange", w * 0.20, baseY));
    state.cats.push(makeKitty("black",  w * 0.55, baseY + 10));
    state.cats.push(makeKitty("grey",   w * 0.40, baseY + 18));

    // grey starts calm
    const grey = state.cats.find(c => c.kind === "grey");
    if (grey) {
      grey.mode = "idle";
      grey.modeT = 220;
      grey.el.className = CATS.grey.idleClass;
    }
  }

  function updateKitty(k, dt) {
    const { w, h } = sceneDims();

    // personality speed
    k.speedMul =
      k.kind === "black" ? 1.25 :
      k.kind === "grey"  ? 0.85 :
                           1.00;

    if (k.modeT > 0) k.modeT -= dt;

    // grey special modes occasionally
    if (k.kind === "grey" && k.modeT <= 0 && Math.random() < 0.003) {
      k.mode = pick(["idle", "sleep", "hiss"]);
      k.modeT = randi(160, 320);
      k.el.className =
        k.mode === "sleep" ? "kitty grey sleep" :
        k.mode === "hiss"  ? "kitty grey hiss"  :
                             "kitty grey idle";
    }

    // if grey is special-mode: barely moves
    if (k.kind === "grey" && (k.mode === "sleep" || k.mode === "idle" || k.mode === "hiss")) {
      k.vx *= 0.92;
      k.x += (k.vx * 0.10) * dt;
      k.x = clamp(k.x, 10, w - 110);
      k.el.style.left = `${k.x}px`;
      return;
    }

    // base class while moving
    if (k.kind === "grey") k.el.className = "kitty grey walk";
    else if (k.kind === "black") k.el.className = "kitty black run";
    else k.el.className = "kitty orange run";

    // chase logic
    if (k.mode === "chase" && k.target) {
      const dx = (k.target.x ?? k.target) - k.x;
      k.vx = clamp(dx * 0.02, -3.2, 3.2);
    } else {
      // gentle wander
      k.vx += rand(-0.02, 0.02) * dt;
      k.vx = clamp(k.vx, -2.2, 2.2);
    }

    // build kitty collision rect (lower half)
    const kRect = { x: k.x + 10, y: k.y + 36, w: 66, h: 44 };

    // find nearest mushroom rect
    let nearest = null;
    let nearestD2 = Infinity;
    for (const m of state.mushrooms) {
      const mr = rectInScene(m.el);
      const dx = (mr.x + mr.w / 2) - (kRect.x + kRect.w / 2);
      const dy = (mr.y + mr.h / 2) - (kRect.y + kRect.h / 2);
      const d2 = dx * dx + dy * dy;
      if (d2 < nearestD2) { nearestD2 = d2; nearest = mr; }
    }

    // avoid + hop
    if (nearest && nearestD2 < 220 * 220) {
      const centerK = kRect.x + kRect.w / 2;
      const centerM = nearest.x + nearest.w / 2;
      const away = centerK - centerM;

      // steer away
      k.vx += clamp(away * 0.0008, -0.5, 0.5) * dt;

      // hop if colliding
      const willHit = intersects(
        kRect,
        { x: nearest.x + 6, y: nearest.y + 16, w: nearest.w - 12, h: nearest.h - 16 }
      );

      const now = performance.now();
      if (willHit && now - k.lastHopAt > 800) {
        k.lastHopAt = now;
        k.el.classList.add("hop");
        setTimeout(() => k.el.classList.remove("hop"), 260);
        k.vx += (k.vx >= 0 ? 0.8 : -0.8);
      }
    }

    // move
    const speed = k.vx * k.speedMul;
    k.x += speed * dt * 0.06;

    // edges
    if (k.x < 8) { k.x = 8; k.vx *= -1; }
    if (k.x > w - 110) { k.x = w - 110; k.vx *= -1; }

    // face direction
    k.el.style.setProperty("--facing", speed >= 0 ? "1" : "-1");

    // ground
    const groundY = h * 0.74 + (k.kind === "black" ? 8 : 0) + (k.kind === "grey" ? 18 : 0);
    k.y = groundY;

    k.el.style.left = `${k.x}px`;
    k.el.style.top = `${k.y}px`;
  }

  // occasional cutscene: black chases orange
  function maybeStartChase(dt) {
    if (state.chaseCooldown > 0) {
      state.chaseCooldown -= dt;
      return;
    }
    if (Math.random() < 0.0025) {
      const orange = state.cats.find(c => c.kind === "orange");
      const black = state.cats.find(c => c.kind === "black");
      if (!orange || !black) return;

      black.mode = "chase";
      black.target = orange;
      black.modeT = randi(140, 260);

      // orange flees a bit
      orange.mode = "chase";
      orange.target = { x: orange.x + (orange.x < (sceneDims().w / 2) ? 260 : -260) };
      orange.modeT = black.modeT;

      state.chaseCooldown = randi(420, 700);
    }
  }

  // ---------- Loop ----------
  let lastT = 0;
  function tick(t) {
    if (!state.started) return;
    const dt = Math.min(32, t - lastT || 16);
    lastT = t;

    maybeStartChase(dt);

    for (const k of state.cats) {
      if (k.mode === "chase" && k.modeT <= 0) {
        k.mode = "roam";
        k.target = null;
      }
      updateKitty(k, dt);
    }

    requestAnimationFrame(tick);
  }

  function bootScene() {
    if (state.started) return;
    if (!scene || !sceneLayer) return;

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

  // ---------- Dragon game wiring (SHOW PNGs) ----------
  // Your repo folder: assets/dragons/*.png
  const DRAGONS = {
    ember: "assets/dragons/ember.png",
    storm: "assets/dragons/storm.png", // if missing, we’ll show fallback text
    moss:  "assets/dragons/moss.png",
  };

  let selectedDragon = null;
  let selectedTreat = null;

  // inject a dragon panel into Step 3
  let dragonPanel = null;
  function ensureDragonPanel() {
    if (dragonPanel) return dragonPanel;
    if (!stepResult) return null;

    const wrap = document.createElement("div");
    wrap.style.marginTop = "12px";
    wrap.style.display = "grid";
    wrap.style.gap = "10px";

    const img = document.createElement("img");
    img.alt = "dragon";
    img.style.width = "min(360px, 100%)";
    img.style.borderRadius = "16px";
    img.style.border = "1px solid rgba(255,255,255,0.18)";
    img.style.boxShadow = "0 14px 40px rgba(0,0,0,0.35)";
    img.style.background = "rgba(0,0,0,0.25)";
    img.loading = "lazy";

    const note = document.createElement("div");
    note.className = "tiny";
    note.textContent = "";

    wrap.appendChild(img);
    wrap.appendChild(note);
    stepResult.appendChild(wrap);

    dragonPanel = { wrap, img, note };
    return dragonPanel;
  }

  function showStep(stepEl) {
    [stepPickDragon, stepPickTreat, stepResult].forEach((s) => s && s.classList.add("hidden"));
    stepEl && stepEl.classList.remove("hidden");
  }

  function outcome(_dragon, treat) {
    if (treat === "spicyJerky") return "fire";
    if (treat === "stardustBerry") return "wings";
    return "bite";
  }

  function renderResult() {
    const out = outcome(selectedDragon, selectedTreat);

    if (rideRow) rideRow.classList.add("hidden");

    if (out === "fire") {
      if (resultText) resultText.textContent = "Your dragon learns FIRE BREATH 🔥 (iconic).";
    } else if (out === "wings") {
      if (resultText) resultText.textContent = "Your dragon grows WINGS 🪽. You may now ride.";
      if (rideRow) rideRow.classList.remove("hidden");
    } else {
      if (resultText) resultText.textContent = "Your dragon BITES you. Not hard. Just disrespectfully.";
    }

    const panel = ensureDragonPanel();
    if (panel) {
      const src = DRAGONS[selectedDragon] || "";
      panel.img.src = src;

      // if file missing, show friendly note
      panel.img.onerror = () => {
        panel.note.innerHTML =
          `Couldn’t load <code>${src}</code>.<br>` +
          `Make sure your dragon PNG exists at <code>assets/dragons/${selectedDragon}.png</code> (or update DRAGONS paths).`;
      };

      panel.note.innerHTML =
        `<div><strong>${(selectedDragon || "").toUpperCase()}</strong> dragon chosen.</div>` +
        `<div>Treat: <strong>${selectedTreat}</strong></div>`;
    }

    showStep(stepResult);
  }

  // bind game buttons
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

})(); // end IIFE
