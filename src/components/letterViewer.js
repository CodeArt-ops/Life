import { EXPERIENCE_CONFIG } from '../config/lettersConfig.js';
import { nextFrame, wait } from '../utils/animationUtils.js';

export class LetterViewer {
  constructor({
    sceneEl,
    viewportEl,
    transformLayerEl,
    imageEl,
    toolbarEl,
    zoomInBtn,
    zoomOutBtn,
    zoomResetBtn,
    zoomIndicatorEl,
    nextBtnEl,
    hintEl,
    onNextClick
  }) {
    this.sceneEl = sceneEl;
    this.viewportEl = viewportEl;
    this.transformLayerEl = transformLayerEl;
    this.imageEl = imageEl;
    this.toolbarEl = toolbarEl;
    this.zoomInBtn = zoomInBtn;
    this.zoomOutBtn = zoomOutBtn;
    this.zoomResetBtn = zoomResetBtn;
    this.zoomIndicatorEl = zoomIndicatorEl;
    this.nextBtnEl = nextBtnEl;
    this.hintEl = hintEl;
    this.onNextClick = onNextClick;

    // Transform state
    this.scale = 1;
    this.minScale = 1;
    this.maxScale = 4;
    this.translateX = 0;
    this.translateY = 0;

    // Gesture tracking
    this.isInteractive = false;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialPinchDistance = null;
    this.initialPinchScale = 1;
    this.lastTapTime = 0;

    this._bindControls();
    this._bindGestures();
  }

  _bindControls() {
    this.zoomInBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isInteractive) return;
      this.zoomBy(0.4);
    });

    this.zoomOutBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isInteractive) return;
      this.zoomBy(-0.4);
    });

    this.zoomResetBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isInteractive) return;
      this.resetView(true);
    });

    // Critical: Execute onNextClick synchronously inside click handler for mobile audio rules
    this.nextBtnEl?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (this.nextBtnEl.disabled) return;
      if (typeof this.onNextClick === 'function') {
        this.onNextClick(event);
      }
    });
  }

  _bindGestures() {
    if (!this.viewportEl) return;

    // Touch gestures: 2-finger pinch-to-zoom & 1-finger pan when zoomed in
    this.viewportEl.addEventListener(
      'touchstart',
      (event) => {
        if (!this.isInteractive) return;
        event.stopPropagation();

        if (event.touches.length === 2) {
          this.isDragging = false;
          this.initialPinchDistance = this._getTouchDistance(event.touches);
          this.initialPinchScale = this.scale;
          this.transformLayerEl.classList.add('is-gesturing');
        } else if (event.touches.length === 1) {
          const now = Date.now();
          if (now - this.lastTapTime < 280) {
            // Double-tap toggles between 1x and 2.2x zoom
            event.preventDefault();
            if (this.scale > 1.05) {
              this.resetView(true);
            } else {
              this.setZoom(2.2, true);
            }
            this.lastTapTime = 0;
            return;
          }
          this.lastTapTime = now;

          if (this.scale > 1.01) {
            this.isDragging = true;
            this.dragStartX = event.touches[0].clientX - this.translateX;
            this.dragStartY = event.touches[0].clientY - this.translateY;
            this.transformLayerEl.classList.add('is-gesturing');
          }
        }
      },
      { passive: false }
    );

    this.viewportEl.addEventListener(
      'touchmove',
      (event) => {
        if (!this.isInteractive) return;
        event.stopPropagation();

        if (event.touches.length === 2 && this.initialPinchDistance) {
          event.preventDefault();
          const currentDistance = this._getTouchDistance(event.touches);
          const ratio = currentDistance / this.initialPinchDistance;
          this.setZoom(this.initialPinchScale * ratio, false);
        } else if (event.touches.length === 1 && this.isDragging && this.scale > 1.01) {
          event.preventDefault();
          const nextX = event.touches[0].clientX - this.dragStartX;
          const nextY = event.touches[0].clientY - this.dragStartY;
          this._setPan(nextX, nextY);
        }
      },
      { passive: false }
    );

    const endTouch = () => {
      this.isDragging = false;
      this.initialPinchDistance = null;
      this.transformLayerEl.classList.remove('is-gesturing');
      if (this.scale <= 1.02) {
        this.resetView(true);
      }
    };

    this.viewportEl.addEventListener('touchend', endTouch);
    this.viewportEl.addEventListener('touchcancel', endTouch);

    // Mouse drag panning & wheel zoom for desktop support
    this.viewportEl.addEventListener('mousedown', (event) => {
      if (!this.isInteractive || this.scale <= 1.01) return;
      event.preventDefault();
      this.isDragging = true;
      this.dragStartX = event.clientX - this.translateX;
      this.dragStartY = event.clientY - this.translateY;
      this.transformLayerEl.classList.add('is-gesturing');
    });

    window.addEventListener('mousemove', (event) => {
      if (!this.isDragging || !this.isInteractive) return;
      const nextX = event.clientX - this.dragStartX;
      const nextY = event.clientY - this.dragStartY;
      this._setPan(nextX, nextY);
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.transformLayerEl.classList.remove('is-gesturing');
    });

    this.viewportEl.addEventListener(
      'wheel',
      (event) => {
        if (!this.isInteractive) return;
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.25 : -0.25;
        this.zoomBy(delta);
      },
      { passive: false }
    );
  }

  _getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  /**
   * Loads a letter's exact image asset and native aspect ratio into the viewer.
   */
  prepareLetter(letterConfig, { buttonLabel = 'next' } = {}) {
    this.resetView(false);
    this.isInteractive = false;

    this.imageEl.src = letterConfig.src;
    this.imageEl.alt = `${letterConfig.title} (${letterConfig.width}×${letterConfig.height})`;
    this.imageEl.style.setProperty(
      '--native-aspect-ratio',
      `${letterConfig.width} / ${letterConfig.height}`
    );

    // Hide and lock the next button until the 2–3s post-reveal timer completes
    this.nextBtnEl.classList.add('is-hidden');
    this.nextBtnEl.classList.remove('is-visible');
    this.nextBtnEl.disabled = true;

    const labelSpan = this.nextBtnEl.querySelector('.next-btn-label');
    if (labelSpan) {
      labelSpan.textContent = buttonLabel;
    }

    this.sceneEl.classList.remove('is-exiting-left');
    this.toolbarEl.classList.add('is-hidden');
  }

  /**
   * Presents the full-resolution interactive letter smoothly in the center of the viewport.
   */
  async showLetterInteractive() {
    this.sceneEl.classList.remove('is-hidden');
    this.sceneEl.classList.add('is-entering');
    await nextFrame();
    this.sceneEl.classList.add('is-active');
    this.toolbarEl.classList.remove('is-hidden');
    await wait(450);
    this.sceneEl.classList.remove('is-entering');
    this.isInteractive = true;
  }

  /**
   * Reveals and enables the `next →` button after the 2–3 second reading pause.
   */
  revealNextButton() {
    this.nextBtnEl.disabled = false;
    this.nextBtnEl.classList.remove('is-hidden');
    window.requestAnimationFrame(() => {
      this.nextBtnEl.classList.add('is-visible');
    });
  }

  /**
   * Animates the current letter horizontally to the left until it exits the viewport.
   */
  async exitLetterToLeft() {
    const { letterExitLeftDurationMs } = EXPERIENCE_CONFIG.timings;
    this.isInteractive = false;
    this.nextBtnEl.disabled = true;
    this.nextBtnEl.classList.remove('is-visible');
    this.toolbarEl.classList.add('is-hidden');

    this.resetView(true);
    this.sceneEl.classList.add('is-exiting-left');
    await wait(letterExitLeftDurationMs);

    this.sceneEl.classList.add('is-hidden');
    this.sceneEl.classList.remove('is-active', 'is-exiting-left');
  }

  zoomBy(delta) {
    this.setZoom(this.scale + delta, true);
  }

  setZoom(targetScale, animate = true) {
    const clamped = Math.min(this.maxScale, Math.max(this.minScale, targetScale));
    this.scale = Number(clamped.toFixed(2));

    if (this.scale <= 1.01) {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    } else {
      const clampedPan = this._clampOffsets(this.translateX, this.translateY);
      this.translateX = clampedPan.x;
      this.translateY = clampedPan.y;
    }

    this.transformLayerEl.classList.toggle('is-gesturing', !animate);
    this._applyTransform();
  }

  _setPan(x, y) {
    const clamped = this._clampOffsets(x, y);
    this.translateX = clamped.x;
    this.translateY = clamped.y;
    this._applyTransform();
  }

  _clampOffsets(x, y) {
    if (!this.viewportEl) return { x: 0, y: 0 };
    const rect = this.viewportEl.getBoundingClientRect();
    const maxOffsetX = ((this.scale - 1) * rect.width) / 2;
    const maxOffsetY = ((this.scale - 1) * rect.height) / 2;

    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, y))
    };
  }

  resetView(animate = true) {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.transformLayerEl?.classList.toggle('is-gesturing', !animate);
    this._applyTransform();
  }

  _applyTransform() {
    if (this.transformLayerEl) {
      this.transformLayerEl.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`;
    }
    if (this.zoomIndicatorEl) {
      this.zoomIndicatorEl.textContent = `${Math.round(this.scale * 100)}%`;
    }
    if (this.viewportEl) {
      this.viewportEl.classList.toggle('is-zoomed', this.scale > 1.01);
    }
    if (this.zoomOutBtn) {
      this.zoomOutBtn.disabled = this.scale <= 1.01;
    }
  }
}