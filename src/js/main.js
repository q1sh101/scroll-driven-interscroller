import '@/styles/main.scss';
import { initBannerController } from '@/js/modules/banner-controller.js';
import { initEmblaCarousel } from '@/js/modules/carousel-controller.js';

let bannerCleanup;
let carouselCleanup;

document.addEventListener('DOMContentLoaded', () => {
  carouselCleanup = initEmblaCarousel();
  bannerCleanup = initBannerController();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    carouselCleanup?.();
    bannerCleanup?.();
  });
}
