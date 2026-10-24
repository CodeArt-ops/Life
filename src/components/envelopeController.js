import { EXPERIENCE_CONFIG } from '../config/lettersConfig.js';
import { nextFrame, wait } from '../utils/animationUtils.js';

export class EnvelopeController {
  constructor({
    sceneEl,
    moverEl,
    interactiveEl,
    flapEl,
    emergingCardEl,
    emergingImgEl,
    promptTextEl,
    onEnvelopeTap
  }) {
    this.sceneEl = sceneEl;
    this.moverEl = moverEl;
    this.interactiveEl = interactiveEl;
    this.flapEl = flapEl;
    this.emergingCardEl = emergingCardEl;
    this.emergingImgEl = emergingImgEl;
    this.promptTextEl = promptTextEl;
    this.onEnvelopeTap = onEnvelopeTap;

    this.isInteractive = false;
    this._bindEvents();
  }

  _bindEvents() {
    if (!this.interactiveEl) return;

    this.interactiveEl.addEventListener('click', (event) => {
      event.preventDefault();
      this._handleTrigger();
    });

    this.interactiveEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._handleTrigger();
      }
    });
  }

  _handleTrigger() {
    if (!this.isInteractive) return;
    // Immediately lock interaction to prevent duplicate taps
    this.setInteractive(false);
    if (typeof this.onEnvelopeTap === 'function') {
      this.onEnvelopeTap();
    }
  }

  setInteractive(enabled) {
    this.isInteractive = Boolean(enabled);
    if (!this.interactiveEl) return;
    this.interactiveEl.classList.toggle('is-interactive', this.isInteractive);
    this.interactiveEl.setAttribute('aria-disabled', String(!this.isInteractive));
  }

  /**
   * Configures the envelope for a given letter config (Letter 1 or Letter 2),
   * resetting the upper flap, wax seal, and internal rising letter aspect ratio.
   */
  configureForLetter(letterConfig) {
    if (this.emergingImgEl) {
      this.emergingImgEl.src = letterConfig.src;
      this.emergingImgEl.alt = letterConfig.title;
    }

    if (this.emergingCardEl) {
      this.emergingCardEl.style.setProperty(
        '--letter-aspect-ratio',
        `${letterConfig.width} / ${letterConfig.height}`
      );
    }

    if (this.promptTextEl && letterConfig.promptText) {
      this.promptTextEl.textContent = letterConfig.promptText;
    }

    this.interactiveEl?.classList.remove(
      'is-flap-open',
      'is-letter-emerging',
      'is-letter-extracted'
    );
    this.moverEl?.classList.remove(
      'is-dropping-down',
      'is-offscreen-right',
      'is-entering-from-right'
    );
  }

  /**
   * Shows the first sealed envelope in the center of the garden.
   */
  async presentInitialEnvelope(letterConfig) {
    this.configureForLetter(letterConfig);
    this.sceneEl.classList.remove('is-hidden');
    this.moverEl.classList.add('is-initial-fade-in');
    await nextFrame();
    this.moverEl.classList.add('is-visible');
    await wait(700);
    this.moverEl.classList.remove('is-initial-fade-in');
    this.setInteractive(true);
  }

  /**
   * Step 1 of opening: rotates only the upper flap around its top hinge.
   */
  async openUpperFlap() {
    const { flapOpenDurationMs } = EXPERIENCE_CONFIG.timings;
    this.interactiveEl.classList.add('is-flap-open');
    await wait(flapOpenDurationMs);
  }

  /**
   * Step 2 of opening: pulls the letter image upward out of the envelope pocket
   * while maintaining its original proportions.
   */
  async emergeLetterFromEnvelope() {
    const { letterEmergeDurationMs } = EXPERIENCE_CONFIG.timings;
    this.interactiveEl.classList.add('is-letter-emerging');
    await wait(letterEmergeDurationMs);
    this.interactiveEl.classList.add('is-letter-extracted');
  }

  /**
   * Step 3 of opening: animates the envelope downward out of the viewport.
   */
  async dropEnvelopeOutOfView() {
    const { envelopeDropDurationMs } = EXPERIENCE_CONFIG.timings;
    this.moverEl.classList.add('is-dropping-down');
    await wait(envelopeDropDurationMs);
    this.sceneEl.classList.add('is-hidden');
  }

  /**
   * Scene 4 transition: brings the second sealed envelope in from the right side
   * of the screen and settles it into the center position.
   */
  async enterSecondEnvelopeFromRight(letterConfig) {
    const { secondEnvelopeEnterDurationMs } = EXPERIENCE_CONFIG.timings;

    this.configureForLetter(letterConfig);
    this.moverEl.classList.add('is-offscreen-right');
    this.sceneEl.classList.remove('is-hidden');

    await nextFrame();
    this.moverEl.classList.remove('is-offscreen-right');
    this.moverEl.classList.add('is-entering-from-right');

    await wait(secondEnvelopeEnterDurationMs);
    this.moverEl.classList.remove('is-entering-from-right');
    this.setInteractive(true);
  }
}