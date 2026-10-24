import { EXPERIENCE_CONFIG } from '../config/lettersConfig.js';
import { nextFrame, wait } from '../utils/animationUtils.js';

export class IntroScene {
  constructor({ sceneEl, firstMsgEl, secondMsgEl }) {
    this.sceneEl = sceneEl;
    this.firstMsgEl = firstMsgEl;
    this.secondMsgEl = secondMsgEl;

    // Guarantee exact required copy from configuration
    if (this.firstMsgEl) {
      this.firstMsgEl.textContent = EXPERIENCE_CONFIG.introMessages.first;
    }
    if (this.secondMsgEl) {
      this.secondMsgEl.textContent = EXPERIENCE_CONFIG.introMessages.second;
    }
  }

  /**
   * Executes the upward title sequence for both messages and removes the
   * introductory scene from view once finished.
   */
  async playIntroSequence() {
    const {
      introFirstDurationMs,
      introGapMs,
      introSecondDurationMs,
      introFadeOutMs
    } = EXPERIENCE_CONFIG.timings;

    this.sceneEl.classList.remove('is-hidden', 'is-fading-out');
    await nextFrame();

    // 1. Animate "Happy BIrthday My Women" upward across the screen
    this.firstMsgEl.classList.add('is-animating');
    await wait(introFirstDurationMs);
    this.firstMsgEl.classList.remove('is-animating');
    this.firstMsgEl.classList.add('is-complete');

    await wait(introGapMs);

    // 2. Animate "Congratulations my girl, you're 17 now" upward across the screen
    this.secondMsgEl.classList.add('is-animating');
    await wait(introSecondDurationMs);
    this.secondMsgEl.classList.remove('is-animating');
    this.secondMsgEl.classList.add('is-complete');

    // 3. Smoothly fade out the intro overlay into the waiting garden scene
    this.sceneEl.classList.add('is-fading-out');
    await wait(introFadeOutMs);
    this.sceneEl.classList.add('is-hidden');
  }
}