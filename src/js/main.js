import '@/styles/main.scss';
import { initBannerController } from '@/js/modules/banner-controller.js';

let cleanup;

document.addEventListener('DOMContentLoaded', () => {
  cleanup = initBannerController();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanup?.());
}
