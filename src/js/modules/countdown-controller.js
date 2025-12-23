export function initCountdownController({ seconds = 5 } = {}) {
  const overlay = document.getElementById('countdownOverlay');
  const value = overlay?.querySelector('[data-countdown-value]');

  if (!overlay || !value) return;

  let active = false;
  let done = false;
  let timerId = null;
  let scrollY = 0;
  let previousBodyStyles = {
    position: '',
    top: '',
    width: '',
    paddingRight: '',
  };

  function render(remaining) {
    value.textContent = String(remaining);
  }

  function show() {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function lockScroll() {
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    scrollY = window.scrollY;

    previousBodyStyles.position = document.body.style.position;
    previousBodyStyles.top = document.body.style.top;
    previousBodyStyles.width = document.body.style.width;
    previousBodyStyles.paddingRight = document.body.style.paddingRight;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  function unlockScroll() {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.position = previousBodyStyles.position;
    document.body.style.top = previousBodyStyles.top;
    document.body.style.width = previousBodyStyles.width;
    document.body.style.paddingRight = previousBodyStyles.paddingRight;
    window.scrollTo(0, scrollY);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    active = false;
    hide();
    unlockScroll();
    done = true;
  }

  function start(nextSeconds = seconds) {
    if (done || active) return;

    const total = Math.max(1, Math.floor(nextSeconds));
    let remaining = total;

    active = true;
    lockScroll();
    render(remaining);
    show();

    timerId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stop();
        return;
      }
      render(remaining);
    }, 1000);
  }

  function cancel() {
    if (!active) {
      done = true;
      return;
    }
    stop();
  }

  return {
    start,
    cancel,
    cleanup: () => {
      if (timerId) clearInterval(timerId);
      timerId = null;
      if (active) unlockScroll();
      hide();
      active = false;
      done = false;
    },
  };
}
