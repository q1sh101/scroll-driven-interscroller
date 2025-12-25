export function initSnapController({ onSnapped } = {}) {
  const adSection = document.getElementById('adSection');
  if (!adSection) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alignThreshold = 1;
  const gateOffsetRatio = 0.12;
  const settleTimeoutMs = 2000;
  let scrollTimer = null;
  let hasSnapped = false;
  let gateActive = true;
  let isSnapping = false;
  let settleRaf = 0;
  let gateRaf = 0;
  let settleStartTime = 0;

  function notifySnapped() {
    if (hasSnapped) return;
    hasSnapped = true;
    gateActive = false;
    onSnapped?.();
  }

  function alignToSection() {
    const rect = adSection.getBoundingClientRect();
    const target = Math.round(window.scrollY + rect.top);
    window.scrollTo({ top: target, behavior: 'auto' });
  }

  function getGateOffset(viewportHeight = window.innerHeight) {
    return Math.round(viewportHeight * gateOffsetRatio);
  }

  function startSnap(target) {
    isSnapping = true;
    settleStartTime = performance.now();
    window.scrollTo({
      top: target,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
    settleRaf = requestAnimationFrame(settle);
  }

  function settle() {
    if (performance.now() - settleStartTime > settleTimeoutMs) {
      isSnapping = false;
      settleRaf = 0;
      return;
    }
    const rect = adSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.bottom <= 0 || rect.top >= viewportHeight) {
      isSnapping = false;
      settleRaf = 0;
      hasSnapped = false;
      return;
    }
    if (Math.abs(rect.top) <= alignThreshold) {
      isSnapping = false;
      settleRaf = 0;
      alignToSection();
      notifySnapped();
      return;
    }
    settleRaf = requestAnimationFrame(settle);
  }

  function snapToSection() {
    if (isSnapping) return;

    const rect = adSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const gateOffset = getGateOffset(viewportHeight);

    if (rect.bottom <= 0 || rect.top >= viewportHeight) {
      hasSnapped = false;
      return;
    }

    if (gateActive && rect.top > gateOffset) return;

    if (hasSnapped) return;

    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const ratio = (visibleBottom - visibleTop) / viewportHeight;

    if (ratio < 0.7) return;

    const target = window.scrollY + rect.top;

    if (Math.abs(rect.top) <= alignThreshold) {
      alignToSection();
      notifySnapped();
      return;
    }

    startSnap(target);
  }

  function checkAligned() {
    if (hasSnapped) return;
    const rect = adSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.bottom <= 0 || rect.top >= viewportHeight) return;
    const gateOffset = getGateOffset(viewportHeight);
    if (gateActive && rect.top > gateOffset) return;

    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const ratio = (visibleBottom - visibleTop) / viewportHeight;

    if (ratio < 0.7) return;

    if (Math.abs(rect.top) <= alignThreshold) {
      alignToSection();
      notifySnapped();
    }
  }

  function handleScroll() {
    if (isSnapping) {
      if (gateActive) return;
      cancelAnimationFrame(settleRaf);
      settleRaf = 0;
      isSnapping = false;
    }
    if (gateActive && !hasSnapped) {
      if (!gateRaf) {
        gateRaf = requestAnimationFrame(() => {
          gateRaf = 0;
          if (!gateActive || hasSnapped || isSnapping) return;
          const rect = adSection.getBoundingClientRect();
          const gateOffset = getGateOffset();
          if (rect.top <= gateOffset) {
            clearTimeout(scrollTimer);
            startSnap(window.scrollY + rect.top);
          }
        });
      }
      return;
    }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(snapToSection, 150);
  }

  function handleVisibilityChange() {
    if (!document.hidden) return;
    if (gateRaf) {
      cancelAnimationFrame(gateRaf);
      gateRaf = 0;
    }
    if (!isSnapping) return;
    cancelAnimationFrame(settleRaf);
    settleRaf = 0;
    isSnapping = false;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);
  requestAnimationFrame(checkAligned);

  return () => {
    clearTimeout(scrollTimer);
    if (settleRaf) cancelAnimationFrame(settleRaf);
    if (gateRaf) cancelAnimationFrame(gateRaf);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
