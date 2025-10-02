/* 1) Inline SVG loader:
   Replaces any element with class 'svg-inline' + data-src by fetching SVG text and inserting it.
   This gives you style control over the svg (stroke/fill) via CSS after inlining.
*/
async function inlineSvgs() {
  const nodes = document.querySelectorAll('.svg-inline[data-src]');
  await Promise.all(Array.from(nodes).map(async node => {
    const url = node.dataset.src;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed ' + url);
      const text = await res.text();
      node.innerHTML = text;
      node.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
    } catch (err) {
      console.error('Failed to inline SVG', url, err);
    }
  }));
}

/* 2) Lazy-load videos removed (no longer used) */
function lazyLoadMedia() { /* noop */ }

/* 3) Minimal keyboard handling for icon buttons (optional): activate with Enter/Space */
function wireIconButtons() {
  const btns = document.querySelectorAll('.icon-btn');
  btns.forEach(b => {
    b.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        b.click();
      }
    });
    b.addEventListener('click', () => {
      console.log('icon clicked:', b.getAttribute('aria-label'));
    });
  });
}

/* Initialize everything once DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  inlineSvgs().then(()=>{});
  lazyLoadMedia();
  wireIconButtons();
});


