import EmblaCarousel from 'embla-carousel';

export function initEmblaCarousel() {
  const emblaNode = document.getElementById('embla-viewport');
  if (!emblaNode) return;

  const prevBtn = document.getElementById('embla-prev');
  const nextBtn = document.getElementById('embla-next');
  const dotsContainer = document.getElementById('embla-dots');

  const options = { loop: true };
  const emblaApi = EmblaCarousel(emblaNode, options);

  function generateDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    emblaApi.scrollSnapList().forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'w-3 h-3 rounded-full bg-white/40 hover:bg-white/60 transition-colors';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => emblaApi.scrollTo(index));
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsContainer) return;

    const selected = emblaApi.selectedScrollSnap();
    const dots = dotsContainer.querySelectorAll('button');

    dots.forEach((dot, index) => {
      if (index === selected) {
        dot.classList.add('bg-white');
        dot.classList.remove('bg-white/40');
        dot.setAttribute('aria-current', 'page');
      } else {
        dot.classList.remove('bg-white');
        dot.classList.add('bg-white/40');
        dot.removeAttribute('aria-current');
      }
    });
  }

  function handlePrevClick() {
    emblaApi.scrollPrev();
  }

  function handleNextClick() {
    emblaApi.scrollNext();
  }

  function handleInit() {
    generateDots();
    updateDots();
  }

  function handleSelect() {
    updateDots();
  }

  function handleReInit() {
    generateDots();
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener('click', handlePrevClick);
  if (nextBtn) nextBtn.addEventListener('click', handleNextClick);

  emblaApi.on('init', handleInit);
  emblaApi.on('select', handleSelect);
  emblaApi.on('reInit', handleReInit);

  return () => {
    if (prevBtn) prevBtn.removeEventListener('click', handlePrevClick);
    if (nextBtn) nextBtn.removeEventListener('click', handleNextClick);
    emblaApi.off('init', handleInit);
    emblaApi.off('select', handleSelect);
    emblaApi.off('reInit', handleReInit);
    emblaApi.destroy();
  };
}
