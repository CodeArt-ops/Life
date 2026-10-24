import { EXPERIENCE_CONFIG } from '../config/lettersConfig.js';

export class AudioController {
  constructor({ toggleBtn, toggleLabel, finalMusicBtn }) {
    this.toggleBtn = toggleBtn;
    this.toggleLabel = toggleLabel;
    this.finalMusicBtn = finalMusicBtn;

    this.audio = new Audio(EXPERIENCE_CONFIG.assets.music.src);
    this.audio.preload = 'auto';
    this.audio.loop = true;
    this.audio.volume = EXPERIENCE_CONFIG.assets.music.initialVolume;

    this.hasStartedOnce = false;
    this.isPlaying = false;

    this._bindEvents();
  }

  _bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.togglePlayback();
      });
    }

    if (this.finalMusicBtn) {
      this.finalMusicBtn.addEventListener('click', () => {
        this.togglePlayback();
      });
    }

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this._syncUI();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this._syncUI();
    });

    this.audio.addEventListener('error', () => {
      this.isPlaying = false;
      this._syncUI(true);
    });
  }

  /**
   * Must be invoked directly inside the user click handler for the first `next →` button.
   * Does not restart the track if it is already playing on subsequent clicks.
   */
  startFromUserGesture() {
    if (this.hasStartedOnce) {
      if (this.audio.paused) {
        this.audio.play().catch(() => {
          this._syncUI();
        });
      }
      return;
    }

    this.hasStartedOnce = true;
    this.toggleBtn?.classList.remove('is-hidden');

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this._syncUI();
        })
        .catch((err) => {
          console.warn('[AudioController] Playback prevented or failed:', err);
          this.isPlaying = false;
          this._syncUI();
        });
    }
  }

  togglePlayback() {
    if (this.audio.paused) {
      this.audio
        .play()
        .then(() => {
          this.hasStartedOnce = true;
          this.isPlaying = true;
          this._syncUI();
        })
        .catch(() => {
          this.isPlaying = false;
          this._syncUI();
        });
    } else {
      this.audio.pause();
      this.isPlaying = false;
      this._syncUI();
    }
  }

  _syncUI(hasError = false) {
    if (this.toggleBtn) {
      this.toggleBtn.classList.remove('is-hidden');
      this.toggleBtn.classList.toggle('is-playing', this.isPlaying);
      this.toggleBtn.setAttribute('aria-pressed', String(this.isPlaying));
      this.toggleBtn.setAttribute(
        'aria-label',
        this.isPlaying ? 'Pause background music' : 'Play background music'
      );
    }

    if (this.toggleLabel) {
      if (hasError) {
        this.toggleLabel.textContent = 'Music Unavailable';
      } else {
        this.toggleLabel.textContent = this.isPlaying ? 'Music On' : 'Play Music';
      }
    }

    if (this.finalMusicBtn) {
      this.finalMusicBtn.textContent = this.isPlaying
        ? 'Pause Garden Music'
        : 'Resume Garden Music';
    }
  }
}