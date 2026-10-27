(() => {
  const stage = document.getElementById('fog-stage');
  const button = document.getElementById('fog-fullscreen');
  const frame = stage.querySelector('iframe');
  const nativeFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement;
  const expanded = () => nativeFullscreen() === stage || stage.classList.contains('is-expanded');
  function syncButton() {
    const active = expanded();
    button.textContent = active ? 'Exit fullscreen ↙' : 'Fullscreen ↗';
    button.setAttribute('aria-pressed', String(active));
  }
  function setFallback(active) {
    stage.classList.toggle('is-expanded', active);
    document.documentElement.classList.toggle('fog-expanded', active);
    syncButton();
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      if (stage.classList.contains('is-expanded')) setFallback(false);
      else if (nativeFullscreen() === stage) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        await exit.call(document);
      } else {
        const enter = stage.requestFullscreen || stage.webkitRequestFullscreen;
        // Keep a usable window-filling view when native fullscreen is unavailable.
        if (enter) {
          try { await enter.call(stage); } catch { setFallback(true); }
        } else setFallback(true);
      }
    } finally {
      button.disabled = false;
      syncButton();
    }
  });
  document.addEventListener('fullscreenchange', syncButton);
  document.addEventListener('webkitfullscreenchange', syncButton);
  function escapeFallback(event) {
    if (event.key === 'Escape' && stage.classList.contains('is-expanded')) setFallback(false);
  }
  document.addEventListener('keydown', escapeFallback);
  // The artwork has its own document, so Escape must also work with iframe focus.
  frame.addEventListener('load', () => {
    frame.contentDocument?.addEventListener('keydown', escapeFallback);
  });
})();
