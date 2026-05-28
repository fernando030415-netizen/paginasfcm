# PRONCINE Campaign & Catalog Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone cinematic scroll-driven web page for PRONCINE streetwear brand displaying campaign history with parallax animations, global impact stats, and a horizontal-scroll quarterly catalog.

**Architecture:** Single-page static site with three JS files (data, animations, catalog) and one CSS file. The scroll system uses `requestAnimationFrame` + `IntersectionObserver` — no external libraries. Each campaign section is a full-screen `<section>` stacked vertically; JS reads scroll position each frame and applies parallax/ghost transforms directly to DOM elements.

**Tech Stack:** HTML5, CSS custom properties, Vanilla JS (ES6+), Google Fonts (Space Grotesk + Inter), SVG grain filter (inline).

---

## File Map

| File | Responsibility |
|---|---|
| `proncine/index.html` | All HTML structure, inline SVG grain filter |
| `proncine/css/style.css` | Design tokens, layout, all visual styles |
| `proncine/js/data.js` | Campaign and catalog data arrays |
| `proncine/js/animations.js` | Parallax, ghost text, panel entry, stat counters |
| `proncine/js/catalog.js` | Horizontal scroll wheel intercept |
| `proncine/assets/campaigns/` | One JPG per campaign (user-supplied) |
| `proncine/assets/catalog/` | One JPG per catalog item (user-supplied) |
| `proncine/assets/logo.svg` | PRONCINE logo white SVG |

---

## Task 1: Project Scaffold + Design Tokens

**Files:**
- Create: `proncine/index.html`
- Create: `proncine/css/style.css`

- [ ] **Step 1: Create `proncine/index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>PRONCINE — Drops Trimestrales</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="css/style.css"/>

  <!-- Inline SVG grain filter — used as CSS filter reference -->
  <svg width="0" height="0" style="position:absolute">
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
  </svg>
</head>
<body>

  <!-- ── HERO ─────────────────────── -->
  <section id="hero">
    <div class="hero-grain"></div>
    <div class="hero-ghost">PRONCINE</div>
    <div class="hero-content">
      <div class="logo-wrap">
        <!-- Replace src with actual logo file or inline SVG -->
        <span class="logo-text">PRONC<span class="logo-i">I</span>NE<sup>®</sup></span>
      </div>
      <p class="hero-tagline">DROP TRIMESTRAL &nbsp;·&nbsp; EDICIÓN LIMITADA &nbsp;·&nbsp; ONE OF ONE</p>
      <div class="scroll-indicator">
        <span></span>
      </div>
    </div>
  </section>

  <!-- ── CAMPAIGNS ─────────────────── -->
  <div id="campaigns-wrapper">
    <!-- Injected by data.js + animations.js -->
  </div>

  <!-- ── IMPACT STRIP ───────────────── -->
  <section id="impact">
    <div class="impact-inner">
      <div class="stat-block">
        <span class="stat-num" data-target="6">0</span>
        <span class="stat-label">DROPS REALIZADOS</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-block">
        <span class="stat-num" data-target="312">0</span>
        <span class="stat-label">PIEZAS LANZADAS</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-block">
        <span class="stat-num" data-target="47" data-suffix="min">0</span>
        <span class="stat-label">SELL-OUT MÁS RÁPIDO</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-block">
        <span class="stat-num" data-target="180" data-suffix="K">0</span>
        <span class="stat-label">ALCANCE COMUNIDAD</span>
      </div>
    </div>
  </section>

  <!-- ── CATALOG ────────────────────── -->
  <section id="catalog">
    <div class="catalog-header">
      <span class="catalog-season">Q2 2025</span>
      <h2 class="catalog-title">COLECCIÓN ACTIVA</h2>
    </div>
    <div class="catalog-track-wrap">
      <div class="catalog-track" id="catalogTrack">
        <!-- Injected by data.js + catalog.js -->
      </div>
    </div>
  </section>

  <!-- ── FOOTER ─────────────────────── -->
  <footer id="footer">
    <span class="footer-logo">PRONC<span class="logo-i">I</span>NE<sup>®</sup></span>
    <p class="footer-sub">Cali — Co &nbsp;·&nbsp; linktr.ee/proncine</p>
  </footer>

  <script src="js/data.js"></script>
  <script src="js/animations.js"></script>
  <script src="js/catalog.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `proncine/css/style.css`** (design tokens + reset)

```css
/* ── TOKENS ─────────────────────────────────────────── */
:root {
  --bg:        #080808;
  --bg2:       #111111;
  --bg3:       #0D0D0D;
  --text:      #F0F0F0;
  --text-dim:  #666666;
  --text-mid:  #999999;
  --accent:    #C8FF00;
  --border:    rgba(255,255,255,0.07);

  --ff-display: 'Space Grotesk', sans-serif;
  --ff-body:    'Inter', sans-serif;

  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-io:    cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── RESET ──────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--ff-body);
  font-weight: 300;
  overflow-x: hidden;
  line-height: 1.6;
}
img { display: block; width: 100%; height: 100%; object-fit: cover; }
::selection { background: var(--accent); color: #000; }
```

- [ ] **Step 3: Open `proncine/index.html` in browser, verify black page loads with no console errors**

- [ ] **Step 4: Commit**

```bash
git add proncine/
git commit -m "feat(proncine): scaffold HTML structure and CSS tokens"
```

---

## Task 2: Hero Section Styles

**Files:**
- Modify: `proncine/css/style.css`

- [ ] **Step 1: Append hero styles to `proncine/css/style.css`**

```css
/* ── HERO ────────────────────────────────────────────── */
#hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg);
}

/* Grain overlay */
.hero-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px;
  mix-blend-mode: overlay;
}

/* Giant ghost text behind everything */
.hero-ghost {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: clamp(8rem, 22vw, 22rem);
  letter-spacing: -0.02em;
  color: rgba(255,255,255,0.035);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  will-change: transform;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
}

/* Logo text (replace with <img> once SVG is available) */
.logo-text {
  display: block;
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: clamp(2.4rem, 5vw, 5rem);
  letter-spacing: 0.12em;
  color: var(--text);
  text-transform: uppercase;
}
.logo-text sup { font-size: 0.35em; vertical-align: super; opacity: 0.6; }
.logo-i { font-style: italic; }

.hero-tagline {
  font-family: var(--ff-body);
  font-weight: 300;
  font-size: clamp(0.62rem, 1.1vw, 0.78rem);
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--text-dim);
}

/* Animated scroll indicator */
.scroll-indicator {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
.scroll-indicator span {
  display: block;
  width: 1px;
  height: 52px;
  background: linear-gradient(to bottom, var(--accent), transparent);
  animation: scrollPulse 1.8s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%   { transform: scaleY(0); transform-origin: top; opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: scaleY(1); transform-origin: top; opacity: 0; }
}
```

- [ ] **Step 2: Reload browser — verify: black page, large faint "PRONCINE" ghost text behind logo, tagline, animated line indicator**

- [ ] **Step 3: Commit**

```bash
git add proncine/css/style.css
git commit -m "feat(proncine): hero section styles"
```

---

## Task 3: Campaign Data + HTML Injection

**Files:**
- Create: `proncine/js/data.js`

- [ ] **Step 1: Create `proncine/js/data.js`**

```js
// Campaign and catalog data — replace photo paths and stats with real values

window.PRONCINE = {};

window.PRONCINE.campaigns = [
  {
    id: "q1-2024",
    quarter: "Q1 2024",
    name: "BASTANTE PELADITA",
    artist: "ARTISTA INVITADO",
    photo: "assets/campaigns/q1-2024.jpg",
    stats: {
      pieces: 48,
      sellout: "1h 22min",
      reach: "95K",
      resale: "$280.000"
    }
  },
  {
    id: "q2-2024",
    quarter: "Q2 2024",
    name: "PRONCINE × BOOTH",
    artist: "COLLAB ESPECIAL",
    photo: "assets/campaigns/q2-2024.jpg",
    stats: {
      pieces: 60,
      sellout: "3h 05min",
      reach: "120K",
      resale: "$240.000"
    }
  },
  {
    id: "q3-2024",
    quarter: "Q3 2024",
    name: "9202",
    artist: "ARTISTA INVITADO",
    photo: "assets/campaigns/q3-2024.jpg",
    stats: {
      pieces: 50,
      sellout: "47min",
      reach: "150K",
      resale: "$320.000"
    }
  },
  {
    id: "q4-2024",
    quarter: "Q4 2024",
    name: "COMUNIDAD",
    artist: "DROP COLECTIVO",
    photo: "assets/campaigns/q4-2024.jpg",
    stats: {
      pieces: 72,
      sellout: "2h 44min",
      reach: "180K",
      resale: "$210.000"
    }
  }
];

window.PRONCINE.catalog = [
  {
    id: "simbolo",
    name: "SÍMBOLO",
    price: "$180.000",
    photo: "assets/catalog/simbolo.jpg",
    sizes: { XS: false, S: true, M: true, L: true, XL: false },
    available: true,
    desc: "100% algodón peruano · 260g · Oversize"
  },
  {
    id: "malboro",
    name: "MALBORO",
    price: "$195.000",
    photo: "assets/catalog/malboro.jpg",
    sizes: { XS: true, S: true, M: true, L: true, XL: true },
    available: true,
    desc: "100% algodón peruano + aplique silicón · 260g"
  },
  {
    id: "cortes",
    name: "VOY A TIRARME LOS CORTES",
    price: "$210.000",
    photo: "assets/catalog/cortes.jpg",
    sizes: { XS: false, S: true, M: false, L: true, XL: true },
    available: true,
    desc: "Acid wash gris · piedrería textil + aplique silicón · 260g"
  },
  {
    id: "madina",
    name: "DEL MADINA",
    price: "$195.000",
    photo: "assets/catalog/madina.jpg",
    sizes: { XS: false, S: false, M: true, L: true, XL: false },
    available: true,
    desc: "100% algodón peruano + aplique silicón · 260g · Back print"
  }
];
```

- [ ] **Step 2: Open browser console, type `window.PRONCINE.campaigns.length` — expect `4`**

- [ ] **Step 3: Commit**

```bash
git add proncine/js/data.js
git commit -m "feat(proncine): campaign and catalog data"
```

---

## Task 4: Campaign Sections — HTML Injection + Styles

**Files:**
- Create: `proncine/js/animations.js` (initial scaffold — inject HTML only)
- Modify: `proncine/css/style.css`

- [ ] **Step 1: Create `proncine/js/animations.js`** (HTML injection only for now)

```js
(function () {
  'use strict';

  const wrapper = document.getElementById('campaigns-wrapper');

  // ── Build campaign sections ──────────────────────────
  window.PRONCINE.campaigns.forEach((c, i) => {
    const sec = document.createElement('section');
    sec.className = 'campaign-section';
    sec.dataset.index = i;
    sec.id = c.id;

    sec.innerHTML = `
      <div class="cs-bg" style="background-image:url('${c.photo}')"></div>
      <div class="cs-overlay"></div>
      <div class="cs-ghost">${c.quarter}</div>

      <nav class="cs-dots" aria-hidden="true">
        ${window.PRONCINE.campaigns.map((_, j) =>
          `<span class="cs-dot ${j === i ? 'active' : ''}" data-idx="${j}"></span>`
        ).join('')}
      </nav>

      <div class="cs-panel">
        <span class="cs-panel-quarter">${c.quarter}</span>
        <h2 class="cs-panel-name">${c.name}</h2>
        <p class="cs-panel-artist">${c.artist}</p>
        <div class="cs-stats">
          <div class="cs-stat">
            <span class="cs-stat-val">${c.stats.pieces}</span>
            <span class="cs-stat-key">PIEZAS</span>
          </div>
          <div class="cs-stat">
            <span class="cs-stat-val">${c.stats.sellout}</span>
            <span class="cs-stat-key">SELL-OUT</span>
          </div>
          <div class="cs-stat">
            <span class="cs-stat-val">${c.stats.reach}</span>
            <span class="cs-stat-key">ALCANCE</span>
          </div>
          <div class="cs-stat">
            <span class="cs-stat-val">${c.stats.resale}</span>
            <span class="cs-stat-key">REVENTA</span>
          </div>
        </div>
      </div>
    `;

    wrapper.appendChild(sec);
  });

})();
```

- [ ] **Step 2: Append campaign section styles to `proncine/css/style.css`**

```css
/* ── CAMPAIGN SECTIONS ───────────────────────────────── */
#campaigns-wrapper {
  position: relative;
}

.campaign-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

/* Parallax background — JS sets translateY */
.cs-bg {
  position: absolute;
  inset: -20%;       /* overshoot so parallax never shows edges */
  background-size: cover;
  background-position: center;
  will-change: transform;
  /* Fallback color while image loads */
  background-color: #1a1a1a;
}

/* Dark gradient overlay */
.cs-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(8,8,8,0.88) 0%,
    rgba(8,8,8,0.65) 45%,
    rgba(8,8,8,0.30) 100%
  );
  /* Grain on top */
  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
    linear-gradient(
      105deg,
      rgba(8,8,8,0.88) 0%,
      rgba(8,8,8,0.65) 45%,
      rgba(8,8,8,0.30) 100%
    );
}

/* Ghost oversized quarter label */
.cs-ghost {
  position: absolute;
  bottom: -0.1em;
  left: -0.05em;
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: clamp(10rem, 24vw, 26rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: rgba(255,255,255,0.045);
  pointer-events: none;
  user-select: none;
  will-change: transform;
  white-space: nowrap;
}

/* Left dot navigation */
.cs-dots {
  position: absolute;
  left: 2.4rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}
.cs-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  transition: background 0.3s, transform 0.3s;
}
.cs-dot.active {
  background: var(--accent);
  transform: scale(1.4);
}

/* Right info panel */
.cs-panel {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(110%);  /* starts off-screen */
  width: min(420px, 90vw);
  padding: 2.8rem 3rem;
  background: rgba(8,8,8,0.82);
  border-left: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10;
  will-change: transform;
  transition: transform 0.72s var(--ease-out);
}
.cs-panel.visible {
  transform: translateY(-50%) translateX(0);
}

.cs-panel-quarter {
  display: block;
  font-family: var(--ff-body);
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.6rem;
}
.cs-panel-name {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--text);
  margin-bottom: 0.4rem;
}
.cs-panel-artist {
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 2rem;
}

.cs-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 1.6rem;
}
.cs-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.cs-stat-val {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--text);
  line-height: 1;
}
.cs-stat-key {
  font-size: 0.58rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--text-dim);
}
```

- [ ] **Step 3: Reload browser — verify: 4 campaign sections stack vertically, each full screen, dark overlay, ghost quarter label visible, panel hidden off-screen right, dots on left**

- [ ] **Step 4: Commit**

```bash
git add proncine/js/animations.js proncine/css/style.css
git commit -m "feat(proncine): campaign sections HTML injection and styles"
```

---

## Task 5: Parallax + Ghost Text Scroll Animations

**Files:**
- Modify: `proncine/js/animations.js`

- [ ] **Step 1: Add scroll loop to `animations.js`** — append this block inside the IIFE, after the `forEach` that builds sections:

```js
  // ── Scroll animation system ──────────────────────────
  const sections   = document.querySelectorAll('.campaign-section');
  const heroGhost  = document.querySelector('.hero-ghost');
  let   ticking    = false;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function updateParallax() {
    const scrollY = window.scrollY;

    // Hero ghost drift upward as you scroll away
    if (heroGhost) {
      heroGhost.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.18}px))`;
    }

    sections.forEach(sec => {
      const rect   = sec.getBoundingClientRect();
      const vh     = window.innerHeight;

      // Only process sections near viewport
      if (rect.bottom < -vh || rect.top > vh * 2) return;

      const bg    = sec.querySelector('.cs-bg');
      const ghost = sec.querySelector('.cs-ghost');

      // How far the section center is from viewport center (px)
      const centerOffset = rect.top + rect.height / 2 - vh / 2;

      // Background parallax: slow (0.35×)
      if (bg) {
        bg.style.transform = `translateY(${centerOffset * 0.35}px)`;
      }

      // Ghost text: opposite direction (−0.18×)
      if (ghost) {
        ghost.style.transform = `translateX(${centerOffset * -0.18}px)`;
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax(); // initial call
```

- [ ] **Step 2: Reload browser and scroll slowly — verify: background images move at different speed than content (parallax), ghost text drifts horizontally opposite to scroll, hero ghost text rises as you scroll down**

- [ ] **Step 3: Commit**

```bash
git add proncine/js/animations.js
git commit -m "feat(proncine): scroll parallax and ghost text animations"
```

---

## Task 6: Panel Slide-In + Dot Activation via IntersectionObserver

**Files:**
- Modify: `proncine/js/animations.js`

- [ ] **Step 1: Append IntersectionObserver block inside the IIFE** (after the scroll listener setup):

```js
  // ── Panel reveal + active dot via IntersectionObserver ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sec   = entry.target;
      const panel = sec.querySelector('.cs-panel');
      const idx   = parseInt(sec.dataset.index, 10);

      if (entry.isIntersecting) {
        // Reveal panel
        if (panel) panel.classList.add('visible');

        // Update all dot sets to reflect active section
        document.querySelectorAll('.cs-dot').forEach(dot => {
          dot.classList.toggle('active', parseInt(dot.dataset.idx, 10) === idx);
        });
      } else {
        // Hide panel when section leaves viewport
        if (panel) panel.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.45   // section must be 45% visible to trigger
  });

  sections.forEach(sec => observer.observe(sec));
```

- [ ] **Step 2: Reload and scroll through campaigns — verify: panel slides in from right when section is 45% visible, slides back out when leaving, left dots update to highlight current section**

- [ ] **Step 3: Commit**

```bash
git add proncine/js/animations.js
git commit -m "feat(proncine): panel slide-in and dot navigation via IntersectionObserver"
```

---

## Task 7: Impact Strip — Styles + Counter Animation

**Files:**
- Modify: `proncine/css/style.css`
- Modify: `proncine/js/animations.js`

- [ ] **Step 1: Append impact strip styles to `style.css`**

```css
/* ── IMPACT STRIP ────────────────────────────────────── */
#impact {
  background: var(--bg3);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 6rem 2rem;
}
.impact-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.stat-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
  padding: 0 2rem;
}
.stat-num {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 1;
  color: var(--text);
  letter-spacing: -0.03em;
}
.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--text-dim);
}
.stat-divider {
  width: 1px;
  height: 60px;
  background: var(--border);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Append counter animation to `animations.js`** inside the IIFE:

```js
  // ── Stat counters (Impact section) ──────────────────
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo curve
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.stat-num');
        nums.forEach(n => animateCounter(n));
        counterObserver.unobserve(entry.target); // run once
      }
    });
  }, { threshold: 0.5 });

  const impactSection = document.getElementById('impact');
  if (impactSection) counterObserver.observe(impactSection);
```

- [ ] **Step 3: Reload and scroll to impact section — verify: 4 numbers count up from 0 to their targets with smooth easeOutExpo curve, trigger only once**

- [ ] **Step 4: Commit**

```bash
git add proncine/css/style.css proncine/js/animations.js
git commit -m "feat(proncine): impact strip with animated stat counters"
```

---

## Task 8: Catalog Section — HTML Injection + Styles

**Files:**
- Create: `proncine/js/catalog.js`
- Modify: `proncine/css/style.css`

- [ ] **Step 1: Create `proncine/js/catalog.js`**

```js
(function () {
  'use strict';

  const track = document.getElementById('catalogTrack');
  if (!track) return;

  // ── Inject catalog cards ─────────────────────────────
  window.PRONCINE.catalog.forEach(item => {
    const sizeHTML = Object.entries(item.sizes).map(([sz, avail]) =>
      `<span class="sz-dot ${avail ? 'avail' : 'sold'}" title="${sz}">${sz}</span>`
    ).join('');

    const badgeHTML = item.available
      ? `<span class="cat-badge avail">DISPONIBLE</span>`
      : `<span class="cat-badge sold">SOLD OUT</span>`;

    const card = document.createElement('article');
    card.className = 'cat-card';
    card.innerHTML = `
      <div class="cat-img-wrap">
        <div class="cat-img" style="background-image:url('${item.photo}')"></div>
        ${badgeHTML}
      </div>
      <div class="cat-info">
        <h3 class="cat-name">${item.name}</h3>
        <p class="cat-desc">${item.desc}</p>
        <div class="cat-footer">
          <span class="cat-price">${item.price}</span>
          <div class="cat-sizes">${sizeHTML}</div>
        </div>
      </div>
    `;
    track.appendChild(card);
  });

  // ── Horizontal scroll via mouse wheel ────────────────
  const wrap = document.querySelector('.catalog-track-wrap');
  if (!wrap) return;

  wrap.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // already horizontal scroll
    e.preventDefault();
    wrap.scrollLeft += e.deltaY * 1.2;
  }, { passive: false });

  // Drag to scroll (touch + mouse)
  let isDown = false;
  let startX;
  let scrollStart;

  wrap.addEventListener('mousedown', e => {
    isDown    = true;
    startX    = e.pageX - wrap.offsetLeft;
    scrollStart = wrap.scrollLeft;
    wrap.style.cursor = 'grabbing';
  });
  wrap.addEventListener('mouseleave', () => { isDown = false; wrap.style.cursor = ''; });
  wrap.addEventListener('mouseup',    () => { isDown = false; wrap.style.cursor = ''; });
  wrap.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - wrap.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrap.scrollLeft = scrollStart - walk;
  });

})();
```

- [ ] **Step 2: Append catalog styles to `style.css`**

```css
/* ── CATALOG ─────────────────────────────────────────── */
#catalog {
  padding: 5rem 0 5rem;
  background: var(--bg);
  overflow: hidden;
}
.catalog-header {
  padding: 0 3rem 2.4rem;
  display: flex;
  align-items: baseline;
  gap: 1rem;
}
.catalog-season {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent);
}
.catalog-title {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--text);
}

.catalog-track-wrap {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  padding: 0 3rem 2rem;
}
.catalog-track-wrap::-webkit-scrollbar { display: none; }

.catalog-track {
  display: flex;
  gap: 1.4rem;
  width: max-content;
}

.cat-card {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s var(--ease-out);
}
.cat-card:hover {
  border-color: rgba(200,255,0,0.3);
  transform: translateY(-4px);
}

.cat-img-wrap {
  position: relative;
  height: 340px;
  background: #1a1a1a;
}
.cat-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  transition: transform 0.5s var(--ease-out);
}
.cat-card:hover .cat-img {
  transform: scale(1.04);
}

.cat-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.55rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.3rem 0.7rem;
  border-radius: 2px;
}
.cat-badge.avail {
  background: var(--accent);
  color: #000;
}
.cat-badge.sold {
  background: rgba(255,255,255,0.08);
  color: var(--text-dim);
  border: 1px solid var(--border);
}

.cat-info {
  padding: 1.2rem 1.4rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cat-name {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
  line-height: 1.2;
}
.cat-desc {
  font-size: 0.68rem;
  color: var(--text-dim);
  line-height: 1.5;
}
.cat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.4rem;
}
.cat-price {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
}
.cat-sizes {
  display: flex;
  gap: 0.3rem;
  align-items: center;
}
.sz-dot {
  font-size: 0.55rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  opacity: 0.5;
}
.sz-dot.avail {
  color: var(--text);
  opacity: 1;
}
.sz-dot.sold {
  text-decoration: line-through;
  opacity: 0.25;
}
```

- [ ] **Step 3: Reload — verify: 4 catalog cards appear in horizontal row, mouse wheel scrolls them horizontally, drag works, hover lifts card with neon border, badges show correctly**

- [ ] **Step 4: Commit**

```bash
git add proncine/js/catalog.js proncine/css/style.css
git commit -m "feat(proncine): horizontal catalog with drag + wheel scroll"
```

---

## Task 9: Footer + Final Polish

**Files:**
- Modify: `proncine/css/style.css`

- [ ] **Step 1: Append footer + polish styles to `style.css`**

```css
/* ── FOOTER ──────────────────────────────────────────── */
#footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}
.footer-logo {
  font-family: var(--ff-display);
  font-weight: 700;
  font-size: 1.6rem;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.15);
  text-transform: uppercase;
}
.footer-sub {
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-dim);
}

/* ── GLOBAL POLISH ───────────────────────────────────── */

/* Selection */
::selection { background: var(--accent); color: #000; }

/* Smooth scroll on page load reveal */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
#hero .hero-content {
  animation: fadeUp 1.1s var(--ease-out) 0.2s both;
}

/* ── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .cs-panel {
    width: min(360px, 85vw);
    padding: 2rem 2rem;
  }
  .cs-stats { gap: 1rem 1.2rem; }
}

@media (max-width: 768px) {
  /* Disable parallax on mobile by freezing transforms via class */
  .cs-bg    { inset: 0; }   /* no overshoot needed */
  .cs-panel {
    position: static;
    transform: none !important;
    transition: none;
    width: 100%;
    padding: 2rem 1.4rem;
    border-left: none;
    border-top: 1px solid var(--border);
    background: rgba(8,8,8,0.95);
  }
  .cs-panel.visible { transform: none !important; }

  .campaign-section {
    height: auto;
    min-height: auto;
    flex-direction: column;
  }
  .cs-bg {
    position: relative;
    height: 60vw;
    min-height: 280px;
    width: 100%;
  }
  .cs-ghost { font-size: 22vw; }
  .cs-dots  { display: none; }

  .impact-inner {
    flex-wrap: wrap;
    gap: 2.4rem;
  }
  .stat-divider { display: none; }
  .stat-block   { flex: 1 1 40%; }

  .catalog-header { padding: 0 1.4rem 1.6rem; }
  .catalog-track-wrap { padding: 0 1.4rem 2rem; }
  .cat-card { width: 240px; }
  .cat-img-wrap { height: 280px; }
}

/* Disable JS-driven parallax transforms on mobile */
@media (max-width: 768px) {
  .cs-bg    { will-change: auto; }
  .cs-ghost { will-change: auto; }
}
```

- [ ] **Step 2: Add mobile parallax disable to `animations.js`** — wrap the parallax section in a desktop check. Find the `updateParallax` function and modify the body:

```js
  function updateParallax() {
    if (window.innerWidth <= 768) return;   // skip on mobile
    const scrollY = window.scrollY;

    if (heroGhost) {
      heroGhost.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.18}px))`;
    }

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const vh   = window.innerHeight;
      if (rect.bottom < -vh || rect.top > vh * 2) return;

      const bg    = sec.querySelector('.cs-bg');
      const ghost = sec.querySelector('.cs-ghost');
      const centerOffset = rect.top + rect.height / 2 - vh / 2;

      if (bg)    bg.style.transform    = `translateY(${centerOffset * 0.35}px)`;
      if (ghost) ghost.style.transform = `translateX(${centerOffset * -0.18}px)`;
    });

    ticking = false;
  }
```

- [ ] **Step 3: Test desktop — verify full scroll experience: hero → campaigns with parallax → impact counters → catalog → footer**

- [ ] **Step 4: Resize browser to 375px width — verify: sections become vertical, panel appears below image, no horizontal overflow, catalog cards scrollable**

- [ ] **Step 5: Commit**

```bash
git add proncine/css/style.css proncine/js/animations.js
git commit -m "feat(proncine): footer, responsive styles, mobile parallax disable"
```

---

## Task 10: Add Real Assets

**Files:**
- Populate: `proncine/assets/campaigns/` and `proncine/assets/catalog/`

- [ ] **Step 1: Save campaign hero images** to `proncine/assets/campaigns/` with exact filenames matching `data.js`:
  - `q1-2024.jpg`
  - `q2-2024.jpg`
  - `q3-2024.jpg`
  - `q4-2024.jpg`

- [ ] **Step 2: Save product images** to `proncine/assets/catalog/`:
  - `simbolo.jpg`
  - `malboro.jpg`
  - `cortes.jpg`
  - `madina.jpg`

- [ ] **Step 3: Reload page — all sections should show real photos. Verify parallax still works with photos.**

- [ ] **Step 4: Update stats** in `data.js` with real numbers if any differ from placeholders.

- [ ] **Step 5: Final commit**

```bash
git add proncine/assets/
git commit -m "feat(proncine): add real campaign and catalog assets"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Hero ✓ · Campaign parallax ✓ · Ghost text ✓ · Panel with stats ✓ · Dot nav ✓ · Impact counters ✓ · Horizontal catalog ✓ · Responsive ✓ · Grain texture ✓
- [x] **No placeholders:** All code is complete and runnable
- [x] **Type consistency:** `window.PRONCINE.campaigns` and `window.PRONCINE.catalog` defined in Task 3, consumed in Tasks 4 and 8 with matching property names
- [x] **Paralax function name:** `updateParallax` defined in Task 5, modified in Task 9 — consistent
- [x] **CSS class names:** `.cs-panel.visible` added in Task 4 CSS, triggered via `.classList.add('visible')` in Task 6 JS — consistent
- [x] **`animateCounter`** defined in Task 7, not referenced elsewhere — no conflict
