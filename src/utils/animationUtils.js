/**
 * Checks whether the user has requested reduced motion at the OS/browser level.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Promise wrapper around setTimeout that scales down durations gently
 * when reduced motion is enabled while preserving the sequence order.
 */
export function wait(ms, { respectReducedMotion = false } = {}) {
  const duration =
    respectReducedMotion && prefersReducedMotion()
      ? Math.min(ms, 450)
      : ms;
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

/**
 * Waits for the next two animation frames so DOM class changes flush cleanly
 * before triggering CSS transitions.
 */
export function nextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

/**
 * Waits for an element's CSS transition or animation to finish, with a reliable
 * fallback timer so the experience never hangs if a transition event is skipped.
 */
export function waitForAnimationEnd(element, fallbackMs = 1000) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener('transitionend', onEnd);
      element.removeEventListener('animationend', onEnd);
      window.clearTimeout(timerId);
      resolve();
    };

    const onEnd = (event) => {
      if (event.target === element) {
        finish();
      }
    };

    const timeoutDuration = prefersReducedMotion()
      ? Math.min(fallbackMs, 350)
      : fallbackMs + 120;

    const timerId = window.setTimeout(finish, timeoutDuration);
    element.addEventListener('transitionend', onEnd);
    element.addEventListener('animationend', onEnd);
  });
}