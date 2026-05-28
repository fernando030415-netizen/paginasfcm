# PRONCINE — Campaign History & Catalog Page Design Spec

**Date:** 2026-05-28  
**Project:** Standalone web page, independent from DSE Inmobiliaria  
**Brand:** PRONCINE — Cali, Colombia streetwear, quarterly limited drops, artist collabs  
**Tech:** Pure HTML / CSS / JS (no framework, no build step)

---

## 1. Overview

A single-page cinematic experience displaying PRONCINE's campaign history, impact metrics, and the current quarterly catalog. Inspired by the Percival scroll-parallax animation reference, adapted to a dark urban aesthetic matching PRONCINE's DNA.

---

## 2. Page Structure

```
/ (root)
├── #hero          — Full-screen brand intro
├── #campaigns     — Scroll-driven campaign history (one full-screen section per drop)
├── #impact        — Global impact stats strip
└── #catalog       — Current quarter horizontal scroll catalog
```

---

## 3. Section Designs

### 3.1 Hero

- **Background:** `#080808` solid black with grain texture overlay (CSS noise via SVG filter)
- **Content center:** PRONCINE logo (white), tagline `DROP TRIMESTRAL · EDICIÓN LIMITADA · ONE OF ONE` in caps, wide letter-spacing
- **Ghost text:** Quarter label (e.g. `PRONCINE`) at 20vw, white 4% opacity, slow upward drift on scroll entry
- **CTA:** Subtle downward scroll indicator (animated line)
- **No video/photo background** — black establishes brand tone before campaigns begin

### 3.2 Campaign History (scroll-driven)

Each past drop = one `100vh` section. Sections stack vertically.

**Per-campaign elements:**
- **Background layer:** Campaign photo, `object-fit: cover`, parallax at 0.4× scroll speed
- **Overlay:** `linear-gradient(to right, rgba(8,8,8,0.85) 40%, rgba(8,8,8,0.4) 100%)` + grain
- **Ghost text:** Quarter label (e.g. `Q1 2025`) at 18vw, white 5% opacity, translates in opposite scroll direction (Percival effect)
- **Left sidebar:** Vertical line + dot indicators for each campaign (active = `#C8FF00`)
- **Right panel:** Slides in `translateX(100%) → translateX(0)` on section enter, easing `cubic-bezier(0.16, 1, 0.3, 1)` 0.6s
  - Drop name (bold, 2rem)
  - Artist collaborator name (light, 0.9rem, wide tracking)
  - 4 stat blocks with count-up animation:
    - Piezas lanzadas
    - Tiempo agotado (e.g. "2h 14min")
    - Alcance en redes
    - Precio de reventa

**Scroll behavior:**
- Vanilla JS `requestAnimationFrame` scroll listener
- Parallax: `transform: translateY(scrollOffset * 0.4)`
- Ghost text: `transform: translateX(scrollOffset * -0.15)`
- IntersectionObserver triggers panel entry + stat counters

### 3.3 Impact Strip

- Full-width dark section (`#0D0D0D`)
- 4 large animated counters, centered horizontally:
  - Total drops
  - Total piezas lanzadas
  - Sell-out más rápido
  - Alcance total comunidad
- Counters animate 0 → value over 1.4s with `easeOutExpo` on viewport entry
- Label below each number in caps, 0.7rem, `#888`
- Divider lines between stats
- No background image — data is the visual

### 3.4 Catalog (Current Quarter)

- Sticky section title: `Q2 2025 — COLECCIÓN ACTIVA`
- Horizontal scroll container (activated by mouse wheel via JS intercept)
- Cards: `#111111` background, `280px` wide, `420px` tall (portrait ratio)
  - Product photo (top 60% of card)
  - Name in caps, bold
  - Price
  - Size availability: dots row `● ● ○ ●` (filled = available, empty = sold out)
  - Badge: `DISPONIBLE` (neon green) or `SOLD OUT` (white, strikethrough opacity)
- Smooth scroll with `scroll-behavior: smooth` + momentum JS

---

## 4. Design Tokens

```css
:root {
  --bg:       #080808;
  --bg2:      #111111;
  --bg3:      #0D0D0D;
  --text:     #F0F0F0;
  --text-dim: #888888;
  --accent:   #C8FF00;   /* neon green — urban, high contrast */
  --border:   rgba(255,255,255,0.08);

  --font-display: 'Space Grotesk', sans-serif;  /* Black 700, uppercase */
  --font-body:    'Inter', sans-serif;           /* 300 light */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 5. Animation System

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Panel right | Section enters viewport | translateX(100%→0) | 0.6s | cubic-bezier(0.16,1,0.3,1) |
| Ghost text | Scroll position | translateX (opposite) | continuous | linear |
| Background | Scroll position | translateY parallax 0.4× | continuous | linear |
| Stat counters | Panel visible | count 0→value | 1.4s | easeOutExpo |
| Hero ghost text | Scroll from top | translateY slow drift | continuous | linear |
| Catalog cards | Hover | scale(1.02) + border accent | 0.3s | ease |

---

## 6. Responsive

- **Desktop (>1024px):** Full layout as described
- **Tablet (768–1024px):** Panel moves below photo, not overlaid
- **Mobile (<768px):** Parallax disabled (performance), panel full-width below image, catalog becomes vertical scroll grid 2-col

---

## 7. Data Structure (hardcoded JS array for now)

```js
const campaigns = [
  {
    quarter: "Q1 2025",
    name: "DROP NAME",
    artist: "ARTIST NAME",
    photo: "assets/campaigns/q1-2025.jpg",
    stats: {
      pieces: 50,
      selloutTime: "2h 14min",
      reach: "180K",
      resalePrice: "$320.000"
    }
  }
  // ...more campaigns
];

const catalog = [
  {
    name: "PIEZA NAME",
    price: "$180.000",
    photo: "assets/catalog/pieza-01.jpg",
    sizes: { XS: false, S: true, M: true, L: false, XL: true },
    available: true
  }
];
```

---

## 8. File Structure

```
proncine/
├── index.html
├── assets/
│   ├── campaigns/     ← hero photos per drop
│   ├── catalog/       ← product photos
│   └── logo.svg
└── (no external CSS/JS files — everything inline for simplicity)
```

---

## 9. Out of Scope

- CMS / dynamic data (hardcoded for v1)
- E-commerce / cart / checkout
- Multi-language
- Authentication
