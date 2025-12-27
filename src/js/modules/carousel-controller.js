import { gsap } from 'gsap';

export function initCarousel() {
  const root = document.getElementById('carousel-root');
  if (!root) return;

  const CONFIG = {
    defaults: {
      colors: { bg: '#f7b299', footer: '#e6673d' },
      figure: { top: '25.55%', activeLeft: '22%', width: '62.55%', height: '65.55%' },
    },
    panels: [
      {
        colors: { bg: '#f7b299', footer: '#e6673d' },
        figure: { width: '62.55%', height: '65.55%', activeLeft: '22%' },
      },
      { colors: { bg: '#e8e0ec', footer: '#3c2841' }, figure: { width: '78%', height: '65.55%' } },
      { colors: { bg: '#d4e2d8', footer: '#3b8e95' }, figure: { width: '62.55%', height: '65.55%' } },
    ],
    animation: {
      bg: { duration: 1.5, ease: 'power3.inOut' },
      panelOut: { duration: 2.5, ease: 'power3.inOut' },
      panelIn: { duration: 1.5, easeNext: 'power2.inOut', easePrev: 'power3.inOut' },
      figure: {
        out: { duration: 1.5, ease: 'power2.inOut' },
        in: { duration: 1.5, easeNext: 'power3.inOut', easePrev: 'power2.inOut' },
      },
      incomingDelay: 0.1,
      lockDuration: 2,
    },
    swipe: { threshold: 50, maxTime: 500, verticalTolerance: 30 },
    layout: { panelOffset: '101%', bgMultiplier: 100 },
  };

  const container = root.querySelector('[data-panel-container]');
  if (!container) return;

  const figureEls = Array.from(root.querySelectorAll('[data-figure-index]')).sort(
    (a, b) => parseInt(a.dataset.figureIndex) - parseInt(b.dataset.figureIndex),
  );

  container.innerHTML = '';
  const registry = figureEls.map((figureEl, i) => {
    const panel = document.createElement('div');
    panel.className = 'carousel-panel absolute top-0 h-full w-full overflow-hidden';
    panel.dataset.panelIndex = i;

    const bg = document.createElement('div');
    bg.className = 'left-0 top-0 absolute w-full h-full';

    const footer = document.createElement('div');
    footer.className = 'absolute left-0 bottom-0 w-full h-[19%]';

    panel.append(bg, footer);
    container.appendChild(panel);

    return { index: i, panel, figureEl, bg, footer, config: CONFIG.panels[i] || {} };
  });

  const panelEls = registry.map((r) => r.panel);
  const panelCount = panelEls.length;

  registry.forEach(({ panel, bg, footer, figureEl, config }) => {
    const colors = config.colors || {};
    const figure = config.figure || {};

    bg.style.backgroundColor = panel.dataset.bgColor ?? colors.bg ?? CONFIG.defaults.colors.bg;
    footer.style.backgroundColor = panel.dataset.footerColor ?? colors.footer ?? CONFIG.defaults.colors.footer;

    if (figureEl) {
      figureEl.style.top = figureEl.dataset.figureTop ?? figure.top ?? CONFIG.defaults.figure.top;
      figureEl.style.width = figureEl.dataset.figureWidth ?? figure.width ?? CONFIG.defaults.figure.width;
      figureEl.style.height = figureEl.dataset.figureHeight ?? figure.height ?? CONFIG.defaults.figure.height;
      config.activeLeft = figureEl.dataset.figureLeft ?? figure.activeLeft ?? CONFIG.defaults.figure.activeLeft;
    }
  });

  const getFigureLeft = (i) => registry[i]?.config.activeLeft || CONFIG.defaults.figure.activeLeft;

  const dotList = root.querySelector('[data-nav-dots]');
  if (dotList) dotList.innerHTML = '';

  const dotEls = panelEls.map((_, i) => {
    const li = document.createElement('li');
    li.className = 'flex w-3 h-3 min-h-3 min-w-3 border-1 border-white rounded-full';
    li.dataset.dotIndex = i;
    if (i === 0) li.classList.add('bg-white');
    if (dotList) dotList.appendChild(li);
    return li;
  });

  const patternOverlay = root.querySelector('#patternOverlay');
  const navPrev = root.querySelector('#navPrev');
  const navNext = root.querySelector('#navNext');

  if (!navPrev || !navNext || !patternOverlay || panelCount === 0) return;
  if (panelEls.some((el) => !el) || figureEls.some((el) => !el)) return;

  patternOverlay.style.width = `${(panelCount + 1) * 100 + 1}%`;

  panelEls.forEach((p, i) => (p.style.left = i === 0 ? '0' : CONFIG.layout.panelOffset));
  figureEls.forEach((f, i) => (f.style.left = i === 0 ? getFigureLeft(i) : CONFIG.layout.panelOffset));
  dotEls.forEach((d, i) => (d.style.background = i === 0 ? '#FFFFFF' : 'none'));

  const state = {
    current: 0,
    isAnimating: false,
    tweens: { lock: null, delay: null, outFigure: null, outPanel: null },
    pointer: { x: 0, y: 0, time: 0 },
  };

  const killTweens = () => {
    Object.values(state.tweens).forEach((t) => t?.kill());
    state.tweens = { lock: null, delay: null, outFigure: null, outPanel: null };
  };

  const lockAnimation = (delay = CONFIG.animation.lockDuration) => {
    state.tweens.lock?.kill();
    state.tweens.lock = gsap.delayedCall(delay, () => (state.isAnimating = false));
  };

  const nextIndex = (dir) => (state.current + dir + panelCount) % panelCount;

  const updateDots = (prev, next) => {
    dotEls[prev] && (dotEls[prev].style.background = 'none');
    dotEls[next] && (dotEls[next].style.background = '#FFFFFF');
  };

  function animateBg(dir) {
    const isNext = dir === 1;
    const m = CONFIG.layout.bgMultiplier;
    const next = nextIndex(dir);

    let offset, shouldReset;

    if (isNext) {
      offset = -(next * m + 1);
      shouldReset = next === 0;
    } else {
      if (state.current === 0) {
        offset = -((panelCount - 1) * m + 1);
      } else if (state.current === 1) {
        offset = -(panelCount * m + 1);
        shouldReset = true;
      } else {
        offset = -(next * m + 1);
      }
    }

    gsap.to(patternOverlay, {
      duration: CONFIG.animation.bg.duration,
      left: `${offset}%`,
      ease: CONFIG.animation.bg.ease,
      onComplete: shouldReset ? () => gsap.set(patternOverlay, { left: '0' }) : undefined,
    });
  }

  function transition(dir) {
    if (state.isAnimating) return;

    killTweens();
    state.isAnimating = true;

    const isNext = dir === 1;
    const prev = state.current;
    const next = nextIndex(dir);

    animateBg(dir);

    const outLeft = isNext ? `-${CONFIG.layout.panelOffset}` : CONFIG.layout.panelOffset;
    const inLeft = isNext ? CONFIG.layout.panelOffset : `-${CONFIG.layout.panelOffset}`;
    const panelEase = isNext ? CONFIG.animation.panelIn.easeNext : CONFIG.animation.panelIn.easePrev;
    const figureEase = isNext ? CONFIG.animation.figure.in.easeNext : CONFIG.animation.figure.in.easePrev;

    state.tweens.outFigure = gsap.to(figureEls[prev], {
      duration: CONFIG.animation.figure.out.duration,
      ease: CONFIG.animation.figure.out.ease,
      left: outLeft,
    });

    state.tweens.outPanel = gsap.to(panelEls[prev], {
      duration: CONFIG.animation.panelOut.duration,
      left: outLeft,
      ease: CONFIG.animation.panelOut.ease,
    });

    updateDots(prev, next);
    state.current = next;

    gsap.set([figureEls[next], panelEls[next]], { left: inLeft });

    state.tweens.delay = gsap.delayedCall(CONFIG.animation.incomingDelay, () => {
      gsap.to(panelEls[next], {
        duration: CONFIG.animation.panelIn.duration,
        left: '0',
        ease: panelEase,
      });

      gsap.to(figureEls[next], {
        duration: CONFIG.animation.figure.in.duration,
        ease: figureEase,
        left: getFigureLeft(next),
      });
    });

    lockAnimation();
  }

  const goNext = () => transition(1);
  const goPrev = () => transition(-1);

  const onPointerDown = (e) => {
    state.pointer = { x: e.clientX, y: e.clientY, time: performance.now() };
    container.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e) => {
    container.releasePointerCapture(e.pointerId);
    if (state.isAnimating) return;

    const dx = e.clientX - state.pointer.x;
    const dy = e.clientY - state.pointer.y;
    const dt = performance.now() - state.pointer.time;

    if (Math.abs(dy) > CONFIG.swipe.verticalTolerance) return;
    if (Math.abs(dx) > CONFIG.swipe.threshold && dt < CONFIG.swipe.maxTime) {
      dx > 0 ? goPrev() : goNext();
    }
  };

  const onPointerCancel = (e) => {
    container.releasePointerCapture(e.pointerId);
    state.pointer = { x: 0, y: 0, time: 0 };
  };

  navNext.addEventListener('click', goNext);
  navPrev.addEventListener('click', goPrev);
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerCancel);

  return () => {
    navNext.removeEventListener('click', goNext);
    navPrev.removeEventListener('click', goPrev);
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('pointercancel', onPointerCancel);
    killTweens();
  };
}
