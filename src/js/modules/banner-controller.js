export function initBannerController() {
  const adSection = document.getElementById('adSection');
  const fixedBanner = document.getElementById('fixedBanner');
  const bannerAd = document.getElementById('fixedBannerAd');
  const scrollPrompt = fixedBanner?.querySelector('[data-scroll-prompt]');
  const closeButton = document.getElementById('closeAdButton');

  if (!adSection || !fixedBanner || !bannerAd || !scrollPrompt) return;

  let lastScrollY = window.scrollY;
  let isScrollingDown = true;
  let isBannerVisible = true;

  function updateScrollPromptOpacity() {
    const currentScrollY = window.scrollY;
    isScrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    if (!isBannerVisible) {
      scrollPrompt.style.opacity = 0;
      return;
    }

    const triggerPoint = adSection.offsetTop - window.innerHeight;

    if (triggerPoint <= 0) {
      scrollPrompt.style.opacity = 0;
      return;
    }

    const progress = 1 - currentScrollY / triggerPoint;
    const clamped = Math.max(0, Math.min(1, progress));
    const opacity = isScrollingDown && currentScrollY > 0 ? Math.min(0.5, clamped) : clamped;

    scrollPrompt.style.opacity = opacity;
  }

  function handleIntersection(entries) {
    const entry = entries[0];

    if (entry.isIntersecting && isScrollingDown) {
      bannerAd.classList.remove('translate-y-0');
      bannerAd.classList.add('translate-y-full');
      fixedBanner.classList.add('pointer-events-none');
      isBannerVisible = false;
    } else if (!entry.isIntersecting && !isScrollingDown) {
      bannerAd.classList.remove('translate-y-full');
      bannerAd.classList.add('translate-y-0');
      fixedBanner.classList.remove('pointer-events-none');
      isBannerVisible = true;
    }
  }

  function handleCloseClick(e) {
    e.preventDefault();
    bannerAd.classList.add('opacity-0', 'invisible', 'pointer-events-none');
  }

  const observer = new IntersectionObserver(handleIntersection, { threshold: 0 });

  observer.observe(adSection);
  window.addEventListener('scroll', updateScrollPromptOpacity, { passive: true });
  window.addEventListener('load', updateScrollPromptOpacity, { once: true });

  bannerAd.classList.add('translate-y-0');
  updateScrollPromptOpacity();

  if (closeButton) {
    closeButton.addEventListener('click', handleCloseClick);
  }

  return () => {
    observer.disconnect();
    window.removeEventListener('scroll', updateScrollPromptOpacity);
    window.removeEventListener('load', updateScrollPromptOpacity);
    if (closeButton) {
      closeButton.removeEventListener('click', handleCloseClick);
    }
  };
}
