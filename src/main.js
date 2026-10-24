import { EXPERIENCE_CONFIG } from './config/lettersConfig.js';
import { APP_STATES, ExperienceStateMachine } from './core/stateMachine.js';
import { wait } from './utils/animationUtils.js';
import { preloadAllVisualAssets } from './utils/assetPreloader.js';
import { AudioController } from './components/audioController.js';
import { IntroScene } from './components/introScene.js';
import { GardenScene } from './components/gardenScene.js';
import { EnvelopeController } from './components/envelopeController.js';
import { LetterViewer } from './components/letterViewer.js';

class BirthdayGardenApp {
  constructor() {
    this.stateMachine = new ExperienceStateMachine(APP_STATES.INTRO);
    this.currentLetterIndex = 0;
    this.hasCompletedSequence = false;

    this._cacheDOM();
    this._initModules();
    this._bindFinalSceneActions();
  }

  _cacheDOM() {
    this.dom = {
      // Garden layers
      foliageLayer: document.getElementById('garden-foliage-layer'),
      petalContainer: document.getElementById('petal-container'),
      scene2BgLayer: document.getElementById('scene2-bg-layer'),

      // Audio UI
      audioToggleBtn: document.getElementById('audio-toggle-btn'),
      audioToggleLabel: document.getElementById('audio-toggle-label'),
      finalMusicBtn: document.getElementById('final-music-btn'),

      // Scene 1: Intro
      introScene: document.getElementById('intro-scene'),
      introMsg1: document.getElementById('intro-msg-1'),
      introMsg2: document.getElementById('intro-msg-2'),

      // Scenes 2–5: Envelope
      envelopeScene: document.getElementById('envelope-scene'),
      envelopeMover: document.getElementById('envelope-mover'),
      envelopeInteractive: document.getElementById('envelope-interactive'),
      envelopeFlap: document.getElementById('envelope-flap'),
      emergingLetterCard: document.getElementById('emerging-letter-card'),
      emergingLetterImg: document.getElementById('emerging-letter-img'),
      envelopePromptText: document.getElementById('envelope-prompt-text'),

      // Scenes 3 & 5: Letter Viewer
      letterViewerScene: document.getElementById('letter-viewer-scene'),
      viewerToolbar: document.getElementById('viewer-toolbar'),
      letterViewport: document.getElementById('letter-viewport'),
      letterTransformLayer: document.getElementById('letter-transform-layer'),
      activeLetterImg: document.getElementById('active-letter-img'),
      zoomInBtn: document.getElementById('zoom-in-btn'),
      zoomOutBtn: document.getElementById('zoom-out-btn'),
      zoomResetBtn: document.getElementById('zoom-reset-btn'),
      zoomIndicator: document.getElementById('zoom-level-indicator'),
      nextLetterBtn: document.getElementById('next-letter-btn'),
      viewerHint: document.getElementById('viewer-hint'),

      // Scene 6: Final State
      finalScene: document.getElementById('final-scene'),
      reopenLetter1Btn: document.getElementById('reopen-letter-1-btn'),
      reopenLetter2Btn: document.getElementById('reopen-letter-2-btn')
    };
  }

  _initModules() {
    this.gardenScene = new GardenScene({
      foliageLayer: this.dom.foliageLayer,
      petalContainer: this.dom.petalContainer,
      scene2BgLayer: this.dom.scene2BgLayer
    });

    this.audioController = new AudioController({
      toggleBtn: this.dom.audioToggleBtn,
      toggleLabel: this.dom.audioToggleLabel,
      finalMusicBtn: this.dom.finalMusicBtn
    });

    this.introScene = new IntroScene({
      sceneEl: this.dom.introScene,
      firstMsgEl: this.dom.introMsg1,
      secondMsgEl: this.dom.introMsg2
    });

    this.envelopeController = new EnvelopeController({
      sceneEl: this.dom.envelopeScene,
      moverEl: this.dom.envelopeMover,
      interactiveEl: this.dom.envelopeInteractive,
      flapEl: this.dom.envelopeFlap,
      emergingCardEl: this.dom.emergingLetterCard,
      emergingImgEl: this.dom.emergingLetterImg,
      promptTextEl: this.dom.envelopePromptText,
      onEnvelopeTap: () => this._handleEnvelopeTapped()
    });

    this.letterViewer = new LetterViewer({
      sceneEl: this.dom.letterViewerScene,
      viewportEl: this.dom.letterViewport,
      transformLayerEl: this.dom.letterTransformLayer,
      imageEl: this.dom.activeLetterImg,
      toolbarEl: this.dom.viewerToolbar,
      zoomInBtn: this.dom.zoomInBtn,
      zoomOutBtn: this.dom.zoomOutBtn,
      zoomResetBtn: this.dom.zoomResetBtn,
      zoomIndicatorEl: this.dom.zoomIndicator,
      nextBtnEl: this.dom.nextLetterBtn,
      hintEl: this.dom.viewerHint,
      onNextClick: () => this._handleNextButtonClicked()
    });
  }

  _bindFinalSceneActions() {
    this.dom.reopenLetter1Btn?.addEventListener('click', () => {
      this._reopenLetterFromFinale(0);
    });

    this.dom.reopenLetter2Btn?.addEventListener('click', () => {
      this._reopenLetterFromFinale(1);
    });
  }

  async start() {
    // Initialize procedural garden and begin preloading all supplied assets in parallel
    this.gardenScene.init();
    const preloadPromise = preloadAllVisualAssets();

    // SCENE 1: Run the upward birthday introduction sequence
    await this.introScene.playIntroSequence();
    await preloadPromise;

    // SCENE 2: Transition to garden-ready and present the first sealed envelope
    this.stateMachine.transitionTo(APP_STATES.GARDEN_READY);
    const firstLetter = EXPERIENCE_CONFIG.letters[0];
    await this.envelopeController.presentInitialEnvelope(firstLetter);
  }

  /**
   * Handles tapping either the first or second sealed envelope (Scenes 3 & 5).
   */
  async _handleEnvelopeTapped() {
    const currentState = this.stateMachine.getState();
    if (
      currentState !== APP_STATES.GARDEN_READY &&
      currentState !== APP_STATES.NEXT_ENVELOPE_READY
    ) {
      return;
    }

    // 1. Lock interaction and open only the upper flap around its hinge
    this.stateMachine.transitionTo(APP_STATES.ENVELOPE_OPENING);
    const currentLetter = EXPERIENCE_CONFIG.letters[this.currentLetterIndex];
    this.letterViewer.prepareLetter(currentLetter, { buttonLabel: 'next' });

    await this.envelopeController.openUpperFlap();

    // 2. Pull the letter upward from inside the envelope while preserving proportions
    this.stateMachine.transitionTo(APP_STATES.LETTER_REVEALING);
    await this.envelopeController.emergeLetterFromEnvelope();

    // 3. Present the full-resolution interactive letter in center while dropping the envelope downward
    await Promise.all([
      this.envelopeController.dropEnvelopeOutOfView(),
      this.letterViewer.showLetterInteractive()
    ]);

    // 4. Letter is now visible and interactive (zoom/pan active)
    this.stateMachine.transitionTo(APP_STATES.LETTER_VISIBLE);

    // 5. Wait 2–3 seconds after reveal finishes before fading in the "next →" button
    await wait(EXPERIENCE_CONFIG.timings.nextButtonDelayMs);
    if (this.stateMachine.getState() === APP_STATES.LETTER_VISIBLE) {
      this.letterViewer.revealNextButton();
    }
  }

  /**
   * Handles clicking the "next →" button below an open letter (Scenes 4 & 6).
   */
  async _handleNextButtonClicked() {
    if (this.stateMachine.getState() !== APP_STATES.LETTER_VISIBLE) {
      return;
    }

    // 1. Start Assets/Music/Music.mp3 synchronously inside the click handler
    this.audioController.startFromUserGesture();

    // If revisiting a letter from the final keepsake screen, return directly to final state
    if (this.hasCompletedSequence) {
      this.stateMachine.transitionTo(APP_STATES.TRANSITIONING);
      await this.letterViewer.exitLetterToLeft();
      this._presentFinalState();
      return;
    }

    // 2. If we just finished Letter 1, execute Scene 4 transition to Letter 2
    if (this.currentLetterIndex === 0) {
      this.stateMachine.transitionTo(APP_STATES.TRANSITIONING);
      this.currentLetterIndex = 1;
      const secondLetter = EXPERIENCE_CONFIG.letters[1];

      // Fade in Assets/Background/scene2background.png at 22% opacity as first letter exits left
      this.gardenScene.revealScene2Background();
      await this.letterViewer.exitLetterToLeft();

      // Bring the second sealed envelope in from the right side of the screen
      await this.envelopeController.enterSecondEnvelopeFromRight(secondLetter);
      this.stateMachine.transitionTo(APP_STATES.NEXT_ENVELOPE_READY);
      return;
    }

    // 3. Otherwise, we just finished Letter 2 -> transition cleanly to Scene 6 Final State
    this.hasCompletedSequence = true;
    this.stateMachine.transitionTo(APP_STATES.TRANSITIONING);
    await this.letterViewer.exitLetterToLeft();
    this._presentFinalState();
  }

  _presentFinalState() {
    this.stateMachine.transitionTo(APP_STATES.FINAL_STATE);
    this.dom.finalScene.classList.remove('is-hidden');
  }

  async _reopenLetterFromFinale(letterIndex) {
    if (this.stateMachine.getState() !== APP_STATES.FINAL_STATE) return;

    const targetLetter = EXPERIENCE_CONFIG.letters[letterIndex];
    if (!targetLetter) return;

    this.dom.finalScene.classList.add('is-hidden');
    this.currentLetterIndex = letterIndex;
    this.letterViewer.prepareLetter(targetLetter, { buttonLabel: 'back' });

    this.stateMachine.transitionTo(APP_STATES.LETTER_VISIBLE);
    await this.letterViewer.showLetterInteractive();
    this.letterViewer.revealNextButton();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new BirthdayGardenApp();
  app.start();
});