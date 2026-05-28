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

  // ── 3D tilt on hover ─────────────────────────────────
  track.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // ── Horizontal scroll via mouse wheel ────────────────
  const wrap = document.querySelector('.catalog-track-wrap');
  if (!wrap) return;

  wrap.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    wrap.scrollLeft += e.deltaY * 1.2;
  }, { passive: false });

  // Drag to scroll
  let isDown = false, startX, scrollStart;

  wrap.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - wrap.offsetLeft;
    scrollStart = wrap.scrollLeft;
    wrap.style.cursor = 'grabbing';
  });
  wrap.addEventListener('mouseleave', () => { isDown = false; wrap.style.cursor = ''; });
  wrap.addEventListener('mouseup',    () => { isDown = false; wrap.style.cursor = ''; });
  wrap.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    wrap.scrollLeft = scrollStart - (e.pageX - wrap.offsetLeft - startX) * 1.5;
  });

})();
