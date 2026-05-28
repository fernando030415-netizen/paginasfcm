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

      <div class="cs-photo-3d">
        <div class="cs-photo-inner" style="background-image:url('${c.photo}')"></div>
      </div>

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

  // ── Scroll animation system ──────────────────────────
  const sections  = document.querySelectorAll('.campaign-section');
  const heroGhost = document.querySelector('.hero-ghost');
  let   ticking   = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function updateParallax() {
    if (window.innerWidth <= 768) { ticking = false; return; }
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
      const photo = sec.querySelector('.cs-photo-3d');
      const centerOffset = rect.top + rect.height / 2 - vh / 2;

      if (bg)    bg.style.transform    = `translateY(${centerOffset * 0.35}px)`;
      if (ghost) ghost.style.transform = `translateX(${centerOffset * -0.18}px)`;
      if (photo) photo.style.transform = `translateY(calc(-50% + ${centerOffset * 0.12}px)) perspective(1000px) rotateY(8deg) rotateX(-2deg)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();

  // ── Panel reveal + active dot via IntersectionObserver ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sec   = entry.target;
      const panel = sec.querySelector('.cs-panel');
      const idx   = parseInt(sec.dataset.index, 10);

      if (entry.isIntersecting) {
        if (panel) panel.classList.add('visible');
        document.querySelectorAll('.cs-dot').forEach(dot => {
          dot.classList.toggle('active', parseInt(dot.dataset.idx, 10) === idx);
        });
      } else {
        if (panel) panel.classList.remove('visible');
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(sec => observer.observe(sec));

  // ── Stat counters (Impact section) ──────────────────
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(n => animateCounter(n));
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const impactSection = document.getElementById('impact');
  if (impactSection) counterObserver.observe(impactSection);

})();
