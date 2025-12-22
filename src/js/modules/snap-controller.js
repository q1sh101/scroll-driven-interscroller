export function initSnapController({ onSnapped } = {}) {
  const adSection = document.getElementById('adSection');
  if (!adSection) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollTimer = null;
  let hasSnapped = false;

  function notifySnapped() {
    if (hasSnapped) return;
    hasSnapped = true;
    onSnapped?.();
  }

  function snapToSection() {
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

    window.scrollTo({
      top: target,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
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
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(snapToSection, 150);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  requestAnimationFrame(checkAligned);

  return () => {
    clearTimeout(scrollTimer);
    window.removeEventListener('scroll', handleScroll);
  };
}
