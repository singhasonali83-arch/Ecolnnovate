/* =============================================
   EcoInnovate — Interactive JavaScript
   Footstep | Rain | Biobin | Seed | Algae | Solar
   ============================================= */

'use strict';

/* ==========================================
   PARTICLE BACKGROUND
   ========================================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 2 + 0.5;
    this.alpha = Math.random() * 0.4 + 0.1;
    this.color = ['#22d47a', '#00d4ff', '#a78bfa', '#ffb347'][Math.floor(Math.random() * 4)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================
   FILTER BAR
   ========================================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.idea-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        requestAnimationFrame(() => { card.style.animation = 'fadeInUp 0.5s ease'; });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ==========================================
   NAVBAR SCROLL EFFECT
   ========================================== */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(5,11,15,0.95)';
  } else {
    nav.style.background = 'rgba(5,11,15,0.8)';
  }
});

/* ==========================================
   IMPACT COUNTER ANIMATION
   ========================================== */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString();
  }, 16);
}

const impactObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.impact-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      impactObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const impactSection = document.getElementById('impact');
if (impactSection) impactObserver.observe(impactSection);

/* ==========================================
   MODAL SYSTEM
   ========================================== */
function openModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    initPrototype(id);
  }
}

function closeModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    stopPrototype(id);
  }
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      const id = overlay.id.replace('modal-', '');
      closeModal(id);
    }
  });
});

/* ==========================================
   PROTOTYPE 1: FOOTSTEP ELECTRICITY
   ========================================== */
let footstepCount = 0;
let totalEnergy = 0;

function initFootstepPrototype() {
  const grid = document.getElementById('floorGrid');
  if (!grid || grid.children.length > 0) return;
  for (let i = 0; i < 48; i++) {
    const tile = document.createElement('div');
    tile.className = 'floor-tile';
    tile.dataset.id = i;
    tile.addEventListener('click', onTileStep);
    tile.addEventListener('mouseenter', e => {
      if (e.buttons === 1) onTileStep({ target: tile });
    });
    grid.appendChild(tile);
  }
}

function onTileStep(e) {
  const tile = e.target.closest('.floor-tile');
  if (!tile) return;
  tile.classList.add('stepped');
  tile.textContent = '⚡';
  setTimeout(() => { tile.textContent = ''; tile.classList.remove('stepped'); }, 600);

  footstepCount++;
  totalEnergy += 6.5; // avg mW per step

  document.getElementById('footstep-count').textContent = footstepCount;
  document.getElementById('energy-gen').textContent = totalEnergy.toFixed(1);

  const bulb = document.getElementById('bulb-status');
  if (totalEnergy >= 50) {
    bulb.textContent = '💡 ON ✅';
    bulb.style.color = '#ffb347';
  } else {
    bulb.textContent = '💡 OFF';
    bulb.style.color = '';
  }
}

/* ==========================================
   PROTOTYPE 2: RAIN COLLECTOR
   ========================================== */
let rainInterval = null;
let tankLevel = 0;
let litersCollected = 0;
let litersSaved = 0;
let raining = false;

function toggleRain() {
  raining = !raining;
  const btn = document.getElementById('rainToggle');
  if (raining) {
    btn.textContent = '🌤️ Stop Rain';
    btn.style.background = 'rgba(255,180,0,0.1)';
    btn.style.borderColor = 'rgba(255,180,0,0.3)';
    btn.style.color = '#ffb347';
    startRain();
  } else {
    btn.textContent = '🌧️ Start Rain';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    stopRainAnimation();
  }
}

function startRain() {
  const sky = document.getElementById('raindrops');
  if (!sky) return;
  sky.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.height = (Math.random() * 12 + 8) + 'px';
    drop.style.animationDuration = (Math.random() * 0.5 + 0.4) + 's';
    drop.style.animationDelay = (Math.random() * 1) + 's';
    sky.appendChild(drop);
  }

  rainInterval = setInterval(() => {
    if (!raining) return;
    if (tankLevel < 100) {
      tankLevel = Math.min(100, tankLevel + 1.5);
      litersCollected += 0.8;
      document.getElementById('tankFill').style.height = tankLevel + '%';
      document.getElementById('tankLevel').textContent = Math.round(tankLevel) + '%';
      document.getElementById('litersCollected').textContent = litersCollected.toFixed(0) + 'L';
    }
  }, 300);
}

function stopRainAnimation() {
  const sky = document.getElementById('raindrops');
  if (sky) sky.innerHTML = '';
  if (rainInterval) { clearInterval(rainInterval); rainInterval = null; }
}

function useTankWater() {
  if (tankLevel <= 0) return;
  const usage = Math.min(20, tankLevel);
  tankLevel = Math.max(0, tankLevel - usage);
  litersSaved += usage * 0.5;
  document.getElementById('tankFill').style.height = tankLevel + '%';
  document.getElementById('tankLevel').textContent = Math.round(tankLevel) + '%';
  document.getElementById('litersSaved').textContent = litersSaved.toFixed(0) + 'L';
}

function resetRain() {
  stopRainAnimation();
  raining = false;
  tankLevel = 0;
  litersCollected = 0;
  litersSaved = 0;
  const fill = document.getElementById('tankFill');
  if (fill) { fill.style.height = '0%'; }
  const level = document.getElementById('tankLevel');
  if (level) level.textContent = '0%';
  const btn = document.getElementById('rainToggle');
  if (btn) { btn.textContent = '🌧️ Start Rain'; btn.style.cssText = ''; }
}

/* ==========================================
   PROTOTYPE 3: BIO-BIN AI SORTER
   ========================================== */
let draggedType = null;
const binCounts = { plastic: 0, organic: 0, paper: 0, glass: 0 };

const wasteInfo = {
  plastic: { label: '🥤 Plastic detected!', comp: 'comp-plastic', color: '#ffb347' },
  organic: { label: '🌱 Organic waste detected!', comp: 'comp-organic', color: '#22d47a' },
  paper:   { label: '📄 Paper detected!', comp: 'comp-paper', color: '#00d4ff' },
  glass:   { label: '🫙 Glass detected!', comp: 'comp-glass', color: '#a78bfa' }
};

function dragWaste(event) {
  draggedType = event.target.dataset.type;
  event.target.style.opacity = '0.5';
  event.target.addEventListener('dragend', () => { event.target.style.opacity = '1'; }, { once: true });
  const area = document.getElementById('scanArea');
  if (area) area.classList.add('drag-over');
}

function dropWaste(event) {
  event.preventDefault();
  const area = document.getElementById('scanArea');
  if (area) area.classList.remove('drag-over');
  if (!draggedType) return;

  // Simulate AI scanning
  const result = document.getElementById('scanResult');
  result.textContent = '🤖 Analyzing...';
  result.style.color = '#a78bfa';

  setTimeout(() => {
    const info = wasteInfo[draggedType];
    if (!info) return;
    result.textContent = info.label;
    result.style.color = info.color;

    // Highlight correct compartment
    document.querySelectorAll('.compartment').forEach(c => c.classList.remove('active'));
    const comp = document.getElementById(info.comp);
    if (comp) {
      comp.classList.add('active');
      binCounts[draggedType]++;
      comp.querySelector('.comp-count').textContent = binCounts[draggedType];
    }

    setTimeout(() => {
      document.querySelectorAll('.compartment').forEach(c => c.classList.remove('active'));
      result.textContent = '✅ Sorted correctly!';
      result.style.color = '#22d47a';
    }, 1200);

    draggedType = null;
  }, 600);
}

/* ==========================================
   PROTOTYPE 4: SEED BOMB GARDEN
   ========================================== */
let bombsThrown = 0;
let plantsGrowing = 0;
let pollinatorCount = 0;
let hasRained = false;
const bombs = [];

function initSeedGarden() {
  const land = document.getElementById('landArea');
  if (!land) return;
  land.addEventListener('click', throwBomb);
}

function throwBomb(e) {
  const land = document.getElementById('landArea');
  if (!land) return;
  const rect = land.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  // Create bomb dot
  const dot = document.createElement('div');
  dot.className = 'seed-bomb-dot';
  dot.style.left = x + '%';
  dot.style.top = y + '%';
  land.appendChild(dot);

  bombs.push({ el: dot, x, y, grown: false });
  bombsThrown++;
  document.getElementById('bombsThrown').textContent = bombsThrown;

  // Remove label
  const lbl = land.querySelector('.land-label');
  if (lbl) lbl.style.opacity = '0';

  if (hasRained) growBomb(land, dot, x, y);
}

function growBomb(land, dot, x, y) {
  const plants = ['🌸', '🌼', '🌿', '🌺', '🌻', '🍀', '🌱'];
  const plant = document.createElement('div');
  plant.className = 'seedling';
  plant.textContent = plants[Math.floor(Math.random() * plants.length)];
  plant.style.left = x + '%';
  plant.style.top = y + '%';
  land.appendChild(plant);
  if (dot.parentNode) dot.parentNode.removeChild(dot);

  plantsGrowing++;
  document.getElementById('plantsGrowing').textContent = plantsGrowing;

  // After some plants, add pollinators
  if (plantsGrowing > 0 && plantsGrowing % 3 === 0) addPollinator(land);
}

function addPollinator(land) {
  const pols = ['🐝', '🦋', '🐛', '🐞'];
  const pol = document.createElement('div');
  pol.className = 'pollinator';
  pol.textContent = pols[Math.floor(Math.random() * pols.length)];
  pol.style.left = Math.random() * 80 + 10 + '%';
  pol.style.top = Math.random() * 60 + 10 + '%';
  land.appendChild(pol);
  pollinatorCount++;
  document.getElementById('pollinators').textContent = pollinatorCount;
}

function triggerRain() {
  hasRained = true;
  const land = document.getElementById('landArea');
  if (!land) return;
  land.style.background = 'linear-gradient(180deg, #0d2e0d, #1a4020)';

  bombs.forEach(b => {
    if (!b.grown) {
      b.grown = true;
      growBomb(land, b.el, b.x, b.y);
    }
  });

  // Rain effect
  land.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)';
  setTimeout(() => { land.style.boxShadow = ''; }, 2000);
}

function clearGarden() {
  const land = document.getElementById('landArea');
  if (!land) return;
  // Remove all dynamic children
  land.querySelectorAll('.seed-bomb-dot, .seedling, .pollinator').forEach(el => el.remove());
  bombs.length = 0;
  bombsThrown = 0; plantsGrowing = 0; pollinatorCount = 0; hasRained = false;
  document.getElementById('bombsThrown').textContent = '0';
  document.getElementById('plantsGrowing').textContent = '0';
  document.getElementById('pollinators').textContent = '0';
  land.style.background = 'linear-gradient(180deg, #0a1a0a, #1a2e1a)';

  // Restore label
  let lbl = land.querySelector('.land-label');
  if (!lbl) {
    lbl = document.createElement('div');
    lbl.className = 'land-label';
    lbl.textContent = '🏚️ Barren Land — Click to throw seed bombs!';
    land.appendChild(lbl);
  }
  lbl.style.opacity = '1';
}

/* ==========================================
   PROTOTYPE 5: ALGAE AIR PURIFIER
   ========================================== */
let algaeAnimTimer = null;

function updateAlgae() {
  const light = parseInt(document.getElementById('sunlightSlider').value);
  document.getElementById('lightLevel').textContent = light + '%';

  let growthLabel, co2Rate, o2Rate;
  if (light < 20) { growthLabel = 'Slow ⚠️'; co2Rate = Math.round(light * 0.8); o2Rate = Math.round(light * 0.6); }
  else if (light < 60) { growthLabel = 'Medium 🌿'; co2Rate = Math.round(light * 2.2); o2Rate = Math.round(light * 1.8); }
  else if (light < 85) { growthLabel = 'High ✨'; co2Rate = Math.round(light * 3); o2Rate = Math.round(light * 2.5); }
  else { growthLabel = 'Optimal 🚀'; co2Rate = Math.round(light * 3.5); o2Rate = Math.round(light * 3); }

  document.getElementById('algaeGrowth').textContent = growthLabel;
  document.getElementById('co2Absorbed').textContent = co2Rate;
  document.getElementById('o2Released').textContent = o2Rate;

  // Update algae panel fill
  const content = document.getElementById('algaeContent');
  if (content) content.style.height = Math.min(95, light * 0.9) + '%';

  // Pollution cloud opacity
  const cloud = document.getElementById('pollutionCloud');
  if (cloud) cloud.style.opacity = (1 - light / 120).toFixed(2);
}

/* ==========================================
   PROTOTYPE 6: SOLAR WATER PURIFIER
   ========================================== */
let solarTimer = null;
let evaporatedTotal = 0;
let purifiedTotal = 0;
let solarHeat = 0;

function updateSolar() {
  solarHeat = parseInt(document.getElementById('heatSlider').value);
  const temp = Math.round(25 + solarHeat * 0.75);
  document.getElementById('solarTemp').textContent = temp + '°C';

  if (solarTimer) clearInterval(solarTimer);
  if (solarHeat > 20) {
    solarTimer = setInterval(() => {
      const rate = solarHeat / 200;
      const dirtyEl = document.getElementById('dirtyWater');
      const cleanEl = document.getElementById('cleanWater');

      const curDirty = parseFloat(dirtyEl.style.height) || 70;
      const curClean = parseFloat(cleanEl.style.height) || 0;

      if (curDirty > 5) {
        const newDirty = Math.max(5, curDirty - rate * 0.5);
        const newClean = Math.min(90, curClean + rate * 0.4);
        dirtyEl.style.height = newDirty + '%';
        cleanEl.style.height = newClean + '%';
        evaporatedTotal += rate * 3;
        purifiedTotal += rate * 2.5;
        document.getElementById('evaporated').textContent = Math.round(evaporatedTotal);
        document.getElementById('purified').textContent = Math.round(purifiedTotal);
      } else {
        clearInterval(solarTimer);
      }
    }, 200);
  } else {
    if (solarTimer) clearInterval(solarTimer);
  }
}

/* ==========================================
   PROTOTYPE INIT / STOP ROUTER
   ========================================== */
const protoInitialized = {};

function initPrototype(id) {
  if (id === 'footstep') initFootstepPrototype();
  if (id === 'rain' && !protoInitialized.rain) {
    protoInitialized.rain = true;
    resetRain();
  }
  if (id === 'biobin') {
    // Reset counts on open
  }
  if (id === 'seed' && !protoInitialized.seed) {
    protoInitialized.seed = true;
    setTimeout(initSeedGarden, 50);
  }
  if (id === 'algae') {
    setTimeout(updateAlgae, 50);
  }
  if (id === 'solar') {
    // Initial state already set by HTML
  }
}

function stopPrototype(id) {
  if (id === 'rain') resetRain();
  if (id === 'solar' && solarTimer) { clearInterval(solarTimer); solarTimer = null; }
}

/* ==========================================
   SMOOTH SCROLL & ACTIVE NAV LINKS
   ========================================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ==========================================
   INTERSECTION OBSERVER — CARD ANIMATIONS
   ========================================== */
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = (i * 0.1) + 's';
      entry.target.style.opacity = '1';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.idea-card').forEach((card, i) => {
  card.style.opacity = '0';
  cardObserver.observe(card);
});

/* ==========================================
   KEYBOARD ESCAPE TO CLOSE MODALS
   ========================================== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(overlay => {
      const id = overlay.id.replace('modal-', '');
      closeModal(id);
    });
  }
});

/* ==========================================
   TOUCH SUPPORT FOR FLOOR TILES
   ========================================== */
document.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (el && el.classList.contains('floor-tile')) {
    onTileStep({ target: el });
  }
}, { passive: true });

console.log('%c🌿 EcoInnovate Loaded!', 'color:#22d47a;font-size:1.2rem;font-weight:bold;');
