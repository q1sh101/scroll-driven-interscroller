export function initSnapController({ onSnapped } = {}) {
  const adSection = document.getElementById('adSection');
  if (!adSection) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollTimer = null;
  let hasSnapped = false;
  let isSnapping = false;
  let snapTargetY = 0;
  let settleRaf = 0;
  let settleAttempts = 0;

  function notifySnapped() {
    if (hasSnapped) return;
    hasSnapped = true;
    onSnapped?.();
  }

  function settle() {
    if (++settleAttempts > 120) {
      isSnapping = false;
      settleRaf = 0;
      return;
    }
    const current = window.scrollY;
    if (Math.abs(current - snapTargetY) <= 2) {
      isSnapping = false;
      settleRaf = 0;
      onSnapped?.();
      return;
    }
    settleRaf = requestAnimationFrame(settle);
  }

  function snapToSection() {
    if (hasSnapped) return;

    const rect = adSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.bottom <= 0 || rect.top >= viewportHeight) return;

    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const ratio = (visibleBottom - visibleTop) / viewportHeight;

    if (ratio < 0.7) return;

    const target = window.scrollY + rect.top;

    if (Math.abs(rect.top) <= 2) {
      notifySnapped();
      return;
    }

    hasSnapped = true;
    snapTargetY = target;
    isSnapping = true;
    settleAttempts = 0;

    window.scrollTo({
      top: target,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });

    settleRaf = requestAnimationFrame(settle);
  }

  function checkAligned() {
    if (hasSnapped) return;
    const rect = adSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.bottom <= 0 || rect.top >= viewportHeight) return;

    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const ratio = (visibleBottom - visibleTop) / viewportHeight;

    if (ratio < 0.7) return;

    if (Math.abs(rect.top) <= 2) {
      notifySnapped();
    }
  }

  function handleScroll() {
    if (isSnapping) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(snapToSection, 150);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  requestAnimationFrame(checkAligned);

  return () => {
    clearTimeout(scrollTimer);
    if (settleRaf) cancelAnimationFrame(settleRaf);
    window.removeEventListener('scroll', handleScroll);
  };
}
