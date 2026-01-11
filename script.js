/* =========================================================
   Forestspace - Enhanced Interactive Script
   script.js v12
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌲 Forestspace loading...");

  // ======== UTILITY FUNCTIONS ========
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ======== DOM ELEMENTS ========
  const enterOverlay = qs("#enterOverlay");
  const enterBtn = qs("#enterBtn");
  const muteBtn = qs("#muteBtn");
  const bgm = qs("#bgm");
  const npText = qs("#npText");
  const toggleMusicBtn = qs("#toggleMusicBtn");
  const scene = qs("#scene");
  const sceneLayer = qs("#sceneLayer");
  const loadingIndicator = qs("#loadingIndicator");

  // ======== GLITTER CURSOR ========
  const glitterCanvas = qs("#glitterCanvas");
  const glitterCtx = glitterCanvas ? glitterCanvas.getContext("2d") : null;
  
  if (glitterCanvas && glitterCtx) {
    glitterCanvas.width = window.innerWidth;
    glitterCanvas.height = window.innerHeight;

    const glitterParticles = [];
    const maxParticles = 30;

    class GlitterParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rand(2, 6);
        this.speedX = rand(-1, 1);
        this.speedY = rand(-1, 1);
        this.life = 1;
        this.decay = rand(0.01, 0.03);
        this.color = pick([
          "rgba(255, 123, 209, ",
          "rgba(140, 255, 194, ",
          "rgba(255, 215, 0, ",
          "rgba(255, 255, 255, "
        ]);
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.98;
      }

      draw() {
        glitterCtx.save();
        glitterCtx.globalAlpha = this.life;
        glitterCtx.fillStyle = this.color + this.life + ")";
        glitterCtx.shadowBlur = 10;
        glitterCtx.shadowColor = this.color + "1)";
        glitterCtx.beginPath();
        glitterCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        glitterCtx.fill();
        glitterCtx.restore();
      }

      isDead() {
        return this.life <= 0 || this.size <= 0.5;
      }
    }

    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Create glitter when mouse moves
      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
      if (dist > 5 && glitterParticles.length < maxParticles) {
        for (let i = 0; i < Math.min(3, Math.floor(dist / 10)); i++) {
          glitterParticles.push(new GlitterParticle(
            mouseX + rand(-5, 5),
            mouseY + rand(-5, 5)
          ));
        }
      }
      
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    });

    function animateGlitter() {
      glitterCtx.clearRect(0, 0, glitterCanvas.width, glitterCanvas.height);

      for (let i = glitterParticles.length - 1; i >= 0; i--) {
        glitterParticles[i].update();
        glitterParticles[i].draw();

        if (glitterParticles[i].isDead()) {
          glitterParticles.splice(i, 1);
        }
      }

      requestAnimationFrame(animateGlitter);
    }

    animateGlitter();

    window.addEventListener("resize", () => {
      glitterCanvas.width = window.innerWidth;
      glitterCanvas.height = window.innerHeight;
    });
  }

  // ======== NOW PLAYING ========
  const playlist = [
    "2010 pop era ✨",
    "Ke$ha-coded chaos 💖",
    "Miley chorus in the distance 🌙",
    "sparkly forest rave 🍄",
    "woodland creature vibes 🦊",
    "glitter & nostalgia mix 💫"
  ];

  if (npText) {
    npText.textContent = pick(playlist);
    setInterval(() => {
      npText.textContent = pick(playlist);
    }, 15000);
  }

  // ======== OVERLAY & MUSIC ========
  function closeOverlay() {
    if (!enterOverlay) return;
    enterOverlay.style.opacity = "0";
    setTimeout(() => {
      enterOverlay.classList.add("hidden");
      enterOverlay.style.display = "none";
      enterOverlay.style.pointerEvents = "none";
    }, 300);
    console.log("✅ Overlay closed");
  }

  async function tryPlayMusic() {
    if (!bgm) return;
    try {
      await bgm.play();
      console.log("🎵 Music playing");
      if (toggleMusicBtn) {
        toggleMusicBtn.classList.add("playing");
      }
    } catch (err) {
      console.log("ℹ️ Autoplay blocked or music file missing:", err.message);
    }
  }

  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", async () => {
      if (!bgm) return;
      
      if (bgm.paused) {
        bgm.muted = false;
        await tryPlayMusic();
      } else {
        bgm.pause();
        toggleMusicBtn.classList.remove("playing");
      }
    });
  }

  // ======== ASSET CONFIGURATION ========
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
    "assets/mushrooms/chanterelle.png"
  ];

  const DRAGONS = {
    ember: "assets/dragons/ember.png",
    storm: "assets/dragons/storm.png",
    moss: "assets/dragons/moss.png"
  };

  const DRAGON_INFO = {
    ember: {
      name: "Ember",
      type: "Fire Dragon",
      personality: "Bold and passionate"
    },
    storm: {
      name: "Storm",
      type: "Sky Dragon",
      personality: "Free-spirited and adventurous"
    },
    moss: {
      name: "Moss",
      type: "Earth Dragon",
      personality: "Wise and nurturing"
    }
  };

  const CAT_CLASSES = {
    orange: { run: "kitty orange run" },
    black: { run: "kitty black run" },
    grey: { run: "kitty grey walk" }
  };

  // ======== PRELOAD ASSETS ========
  function preloadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, ok: true });
      img.onerror = () => resolve({ url, ok: false });
      img.src = url;
    });
  }

  async function preloadAllAssets() {
    const urls = [
      BG,
      ...MUSHROOMS,
      "assets/cats/orange_run.png",
      "assets/cats/black_run.png",
      "assets/cats/grey_walk.png",
      ...Object.values(DRAGONS),
      "assets/cursor/cursor.png"
    ];

    const results = await Promise.all(urls.map(preloadImage));
    const missing = results.filter(r => !r.ok).map(r => r.url);

    if (missing.length) {
      console.warn("⚠️ Some assets failed to load:", missing);
      console.log("ℹ️ The site will still work, but some visuals may be missing.");
    } else {
      console.log("✅ All assets loaded successfully");
    }

    return missing;
  }

  // ======== GEOMETRY HELPERS ========
  function intersects(a, b) {
    return !(
      a.x + a.w < b.x ||
      a.x > b.x + b.w ||
      a.y + a.h < b.y ||
      a.y > b.y + b.h
    );
  }

  function sceneDims() {
    const r = scene.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function rectInScene(el) {
    const sr = scene.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - sr.left,
      y: r.top - sr.top,
      w: r.width,
      h: r.height
    };
  }

  // ======== SCENE STATE ========
  const state = {
    started: false,
    mushrooms: [],
    cats: []
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

  // ======== MUSHROOM SPAWNING ========
  function spawnMushrooms(count = 14) {
    const { w, h } = sceneDims();

    // Grass band region (adjusted for your forest image)
    const yMin = h * 0.60;
    const yMax = h * 0.85;

    const placed = [];

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "mushroom";
      img.src = pick(MUSHROOMS);
      img.alt = "mushroom";

      // Initial positioning
      img.style.left = `${rand(20, w - 140)}px`;
      img.style.top = `${rand(yMin, yMax)}px`;

      sceneLayer.appendChild(img);

      img.onload = () => {
        const mw = clamp((img.naturalWidth || 300) * 0.18, 45, 95);
        img.style.width = `${mw}px`;

        // Anti-overlap placement
        let tries = 100;
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

      img.onerror = () => {
        console.warn("⚠️ Mushroom image failed to load:", img.src);
      };
    }

    console.log(`🍄 Spawned ${count} mushrooms`);
  }

  // ======== KITTY SPAWNING & ANIMATION ========
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
      // Slower, more natural movement
      vx: rand(0.15, 0.35) * (Math.random() < 0.5 ? -1 : 1),
      pauseTimer: 0,
      isPaused: false
    };
  }

  function spawnKitties() {
    const { w, h } = sceneDims();

    // Position cats in the grass area
    const baseY = h * 0.68;

    state.cats.push(makeKitty("orange", w * 0.20, baseY));
    state.cats.push(makeKitty("black", w * 0.55, baseY + 15));
    state.cats.push(makeKitty("grey", w * 0.38, baseY + 25));

    console.log("🐱 Spawned cats:", state.cats.map(c => c.kind).join(", "));
  }

  function updateKitties(dt) {
    const { w, h } = sceneDims();

    for (const k of state.cats) {
      // Speed multipliers for different cats
      const speedMul =
        k.kind === "black" ? 1.1 :
        k.kind === "grey" ? 0.65 :
        0.85;

      // Random pausing behavior
      if (k.isPaused) {
        k.pauseTimer -= dt;
        if (k.pauseTimer <= 0) {
          k.isPaused = false;
        }
        continue;
      } else if (Math.random() < 0.001) {
        // Randomly pause
        k.isPaused = true;
        k.pauseTimer = rand(1000, 3000);
        continue;
      }

      // Gentle wandering
      k.vx += rand(-0.005, 0.005) * dt;
      k.vx = clamp(k.vx, -0.7, 0.7);

      const speed = k.vx * speedMul;

      // Slower movement
      k.x += speed * dt * 0.025;

      // Bounce at edges
      if (k.x < 8) {
        k.x = 8;
        k.vx *= -1;
      }
      if (k.x > w - 130) {
        k.x = w - 130;
        k.vx *= -1;
      }

      // Face direction
      k.el.style.setProperty("--facing", speed >= 0 ? "1" : "-1");

      // Keep in grass band
      const baseY = h * 0.68;
      const offset =
        k.kind === "black" ? 15 :
        k.kind === "grey" ? 25 : 0;
      k.y = baseY + offset;

      k.el.style.left = `${k.x}px`;
      k.el.style.top = `${k.y}px`;
    }
  }

  // ======== SCENE BOOT ========
  async function bootScene() {
    if (state.started) return;
    if (!scene || !sceneLayer) {
      console.warn("⚠️ Missing scene elements");
      return;
    }

    state.started = true;

    clearScene();
    setBackground();

    const w = sceneDims().w;
    const mushroomCount = w < 650 ? 10 : 14;

    spawnMushrooms(mushroomCount);
    spawnKitties();

    // Animation loop
    let lastT = 0;
    function tick(t) {
      const dt = Math.min(32, t - lastT || 16);
      lastT = t;
      updateKitties(dt);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    console.log("✅ Scene booted successfully");
  }

  // ======== OVERLAY BUTTON HANDLERS ========
  if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
      console.log("✅ Enter button clicked");
      
      if (loadingIndicator) {
        loadingIndicator.classList.remove("hidden");
      }

      if (bgm) bgm.muted = false;
      await tryPlayMusic();
      
      const missing = await preloadAllAssets();
      
      closeOverlay();
      await bootScene();
      
      if (loadingIndicator) {
        setTimeout(() => {
          loadingIndicator.classList.add("hidden");
        }, 500);
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", async () => {
      console.log("✅ Mute button clicked");
      
      if (loadingIndicator) {
        loadingIndicator.classList.remove("hidden");
      }

      if (bgm) bgm.muted = true;
      
      const missing = await preloadAllAssets();
      
      closeOverlay();
      await bootScene();
      
      if (loadingIndicator) {
        setTimeout(() => {
          loadingIndicator.classList.add("hidden");
        }, 500);
      }
    });
  }

  // ======== DRAGON GAME ========
  const stepPickDragon = qs("#stepPickDragon");
  const stepHatching = qs("#stepHatching");
  const stepPickTreat = qs("#stepPickTreat");
  const stepGrowing = qs("#stepGrowing");
  const stepResult = qs("#stepResult");
  const dragonImg = qs("#dragonImg");
  const dragonStats = qs("#dragonStats");
  const dragonNameDisplay = qs("#dragonNameDisplay");
  const dragonFullName = qs("#dragonFullName");
  const resultText = qs("#resultText");
  const resetBtn = qs("#resetBtn");
  const interactionFeedback = qs("#interactionFeedback");

  let selectedDragon = null;
  let selectedTreat = null;
  let dragonLevel = 1;
  let dragonHappiness = 100;
  let dragonEnergy = 100;

  function showStep(step) {
    [stepPickDragon, stepHatching, stepPickTreat, stepGrowing, stepResult].forEach(s => {
      if (s) s.classList.remove("active");
    });
    if (step) step.classList.add("active");
  }

  function getOutcome(treat) {
    if (treat === "spicyJerky") return "fire";
    if (treat === "stardustBerry") return "wings";
    return "bite";
  }

  function updateDragonStats() {
    if (!dragonStats) return;

    const info = DRAGON_INFO[selectedDragon];
    dragonStats.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Type:</span>
        <span class="stat-value">${info.type}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Level:</span>
        <span class="stat-value">${dragonLevel}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Happiness:</span>
        <span class="stat-value">${dragonHappiness}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Energy:</span>
        <span class="stat-value">${dragonEnergy}%</span>
      </div>
    `;
  }

  function renderDragonResult() {
    if (!selectedDragon || !selectedTreat) return;

    if (dragonImg) {
      dragonImg.src = DRAGONS[selectedDragon] || "";
      dragonImg.alt = `${DRAGON_INFO[selectedDragon].name} the dragon`;
      dragonImg.style.display = "block";
    }

    if (dragonNameDisplay) {
      dragonNameDisplay.textContent = DRAGON_INFO[selectedDragon].name;
    }

    if (dragonFullName) {
      dragonFullName.textContent = `${DRAGON_INFO[selectedDragon].name} the ${DRAGON_INFO[selectedDragon].type}`;
    }

    const outcome = getOutcome(selectedTreat);
    let resultMessage = "";

    if (outcome === "fire") {
      resultMessage = `🔥 ${DRAGON_INFO[selectedDragon].name} learns FIRE BREATH! Watch out—this dragon is hot stuff. Literally. The spicy jerky was the perfect choice for unlocking this explosive ability.`;
      dragonLevel = 2;
      dragonHappiness = 95;
    } else if (outcome === "wings") {
      resultMessage = `🪽 ${DRAGON_INFO[selectedDragon].name} grows magnificent WINGS! The stardust berry's magic flows through your dragon, granting the power of flight. Prepare for sky-high adventures!`;
      dragonLevel = 2;
      dragonHappiness = 98;
    } else {
      resultMessage = `😼 ${DRAGON_INFO[selectedDragon].name} gives you a playful nip. Not hard, just... disrespectfully. The marshmallow made your dragon mischievous and full of chaotic energy. This will be interesting.`;
      dragonLevel = 1;
      dragonHappiness = 85;
    }

    if (resultText) {
      resultText.textContent = resultMessage;
    }

    updateDragonStats();

    // Delay showing result for dramatic effect
    setTimeout(() => {
      showStep(stepResult);
    }, 100);
  }

  // Dragon selection
  qsa("[data-dragon]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      selectedDragon = btn.getAttribute("data-dragon");
      selectedTreat = null;
      dragonLevel = 1;
      dragonHappiness = 100;
      dragonEnergy = 100;

      console.log("🥚 Selected dragon:", selectedDragon);

      // Show hatching animation
      showStep(stepHatching);

      // Wait for hatching
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show treat selection
      if (dragonNameDisplay) {
        dragonNameDisplay.textContent = DRAGON_INFO[selectedDragon].name;
      }
      showStep(stepPickTreat);
    });
  });

  // Treat selection
  qsa("[data-treat]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      selectedTreat = btn.getAttribute("data-treat");
      
      console.log("🍖 Selected treat:", selectedTreat);

      // Show growing animation
      showStep(stepGrowing);

      // Wait for growing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show result
      renderDragonResult();
    });
  });

  // Dragon interactions
  qsa(".interactionBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      let feedback = "";

      switch (action) {
        case "pet":
          dragonHappiness = Math.min(100, dragonHappiness + 5);
          feedback = `You pet ${DRAGON_INFO[selectedDragon].name}. They purr contentedly (yes, dragons purr). Happiness +5! 💕`;
          break;
        case "play":
          dragonEnergy = Math.max(0, dragonEnergy - 10);
          dragonHappiness = Math.min(100, dragonHappiness + 10);
          feedback = `You play fetch with ${DRAGON_INFO[selectedDragon].name}! They're having so much fun. Happiness +10, Energy -10. 🎾`;
          break;
        case "feed":
          dragonEnergy = Math.min(100, dragonEnergy + 20);
          dragonHappiness = Math.min(100, dragonHappiness + 5);
          feedback = `You feed ${DRAGON_INFO[selectedDragon].name} a snack. *munch munch* Energy +20, Happiness +5! 🍖`;
          break;
        case "train":
          if (dragonEnergy < 20) {
            feedback = `${DRAGON_INFO[selectedDragon].name} is too tired to train right now. Try feeding them first! 😴`;
          } else {
            dragonEnergy = Math.max(0, dragonEnergy - 20);
            dragonLevel += 0.5;
            feedback = `Training session complete! ${DRAGON_INFO[selectedDragon].name} is getting stronger. Level up progress! ⚔️`;
          }
          break;
      }

      if (interactionFeedback) {
        interactionFeedback.textContent = feedback;
        interactionFeedback.style.animation = "none";
        setTimeout(() => {
          interactionFeedback.style.animation = "fadeIn 0.4s ease-out";
        }, 10);
      }

      updateDragonStats();
    });
  });

  // Reset game
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedDragon = null;
      selectedTreat = null;
      dragonLevel = 1;
      dragonHappiness = 100;
      dragonEnergy = 100;

      if (dragonImg) dragonImg.style.display = "none";
      if (interactionFeedback) interactionFeedback.textContent = "";

      showStep(stepPickDragon);

      console.log("🔄 Game reset");
    });
  }

  // Initialize game
  showStep(stepPickDragon);

  console.log("✨ Forestspace loaded successfully!");
});
