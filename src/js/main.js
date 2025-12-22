import '@/styles/main.scss';
import { initBannerController } from '@/js/modules/banner-controller.js';
import { initEmblaCarousel } from '@/js/modules/carousel-controller.js';
import { initSnapController } from '@/js/modules/snap-controller.js';
import { initCountdownController } from '@/js/modules/countdown-controller.js';

let bannerCleanup;
let carouselCleanup;
let snapCleanup;
let countdownCleanup;

document.addEventListener('DOMContentLoaded', () => {
  carouselCleanup = initEmblaCarousel();
  bannerCleanup = initBannerController();
  const countdown = initCountdownController({ seconds: 5 });
  countdownCleanup = countdown?.cleanup;
  snapCleanup = initSnapController({
    onSnapped: () => countdown?.start(),
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    carouselCleanup?.();
    bannerCleanup?.();
    snapCleanup?.();
    countdownCleanup?.();
  });
}
