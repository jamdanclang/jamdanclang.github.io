(() => {
  'use strict';
  const button = document.getElementById('motion-toggle');
  const pieces = document.querySelectorAll("ascii-art");
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userChoice = null;
  try { const saved = localStorage.getItem('jamdan-motion'); if (saved !== null) userChoice = saved === 'on'; } catch (_) { /* Storage is optional. */ }
  let moving = userChoice ?? !preference.matches;
  function update() {
    button.textContent = moving ? 'Motion: on' : 'Motion: off';
    button.setAttribute('aria-pressed', String(moving));
    document.documentElement.dataset.motion = moving ? 'on' : 'off';
    // Every ASCII piece shares the page's pause control.
    pieces.forEach(piece => {
      if (moving) piece.removeAttribute("fps");
      else piece.setAttribute("fps", "0");
    });
  }
  button.hidden = false;
  button.addEventListener('click', () => {
    moving = !moving; userChoice = moving;
    try { localStorage.setItem('jamdan-motion', moving ? 'on' : 'off'); } catch (_) { /* Storage is optional. */ }
    update();
  });
  preference.addEventListener('change', () => { userChoice = null; moving = !preference.matches; update(); });
  document.addEventListener('visibilitychange', update);
  update();
})();
