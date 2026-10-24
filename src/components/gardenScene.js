import { EXPERIENCE_CONFIG } from '../config/lettersConfig.js';

export class GardenScene {
  constructor({ foliageLayer, petalContainer, scene2BgLayer }) {
    this.foliageLayer = foliageLayer;
    this.petalContainer = petalContainer;
    this.scene2BgLayer = scene2BgLayer;
    this.isScene2BgVisible = false;
  }

  init() {
    this._setupScene2BackgroundAsset();
    this._renderGardenBotanicals();
    this._spawnFloatingPetals(18);
  }

  _setupScene2BackgroundAsset() {
    if (!this.scene2BgLayer) return;
    const { src, targetOpacity } = EXPERIENCE_CONFIG.assets.scene2Background;
    this.scene2BgLayer.style.backgroundImage = `url('${src}')`;
    this.scene2BgLayer.style.setProperty('--scene2-target-opacity', String(targetOpacity));
  }

  /**
   * Fades in Assets/Background/scene2background.png gradually at 22% opacity
   * as an independent background layer when transitioning to the second letter.
   */
  revealScene2Background() {
    if (!this.scene2BgLayer || this.isScene2BgVisible) return;
    this.isScene2BgVisible = true;
    this.scene2BgLayer.classList.add('is-visible');
  }

  _renderGardenBotanicals() {
    if (!this.foliageLayer) return;

    // Corner and foreground rose clusters crafted with inline SVG so they stay crisp at any screen size
    this.foliageLayer.innerHTML = `
      <svg class="garden-svg garden-svg--top-left" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-10 220 C50 160, 130 120, 240 25" stroke="rgba(116, 168, 126, 0.45)" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="95" cy="145" rx="22" ry="10" transform="rotate(-32 95 145)" fill="rgba(110, 162, 122, 0.48)"/>
        <ellipse cx="155" cy="95" rx="20" ry="9" transform="rotate(-24 155 95)" fill="rgba(128, 180, 138, 0.45)"/>
        <ellipse cx="52" cy="185" rx="24" ry="11" transform="rotate(18 52 185)" fill="rgba(96, 148, 108, 0.5)"/>
        <!-- Rose Bloom 1 -->
        <g transform="translate(65, 88)">
          <circle cx="0" cy="0" r="34" fill="rgba(232, 132, 158, 0.35)"/>
          <circle cx="-5" cy="-4" r="25" fill="rgba(244, 162, 184, 0.55)"/>
          <path d="M-14 -4 C-6 -18, 14 -16, 16 2 C14 16, -10 18, -14 2 Z" fill="rgba(252, 198, 212, 0.78)"/>
          <circle cx="2" cy="1" r="7" fill="rgba(255, 228, 235, 0.9)"/>
        </g>
        <!-- Small Blossom -->
        <g transform="translate(175, 52)">
          <circle cx="0" cy="0" r="16" fill="rgba(247, 178, 197, 0.55)"/>
          <circle cx="0" cy="0" r="7" fill="rgba(255, 235, 240, 0.85)"/>
        </g>
      </svg>

      <svg class="garden-svg garden-svg--top-right" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M330 210 C260 150, 190 100, 85 18" stroke="rgba(116, 168, 126, 0.45)" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="220" cy="130" rx="22" ry="10" transform="rotate(30 220 130)" fill="rgba(110, 162, 122, 0.46)"/>
        <ellipse cx="155" cy="80" rx="18" ry="8" transform="rotate(22 155 80)" fill="rgba(128, 180, 138, 0.42)"/>
        <!-- Rose Bloom 2 -->
        <g transform="translate(248, 78)">
          <circle cx="0" cy="0" r="32" fill="rgba(225, 118, 148, 0.38)"/>
          <circle cx="4" cy="-3" r="23" fill="rgba(245, 158, 182, 0.58)"/>
          <path d="M-12 -3 C-4 -15, 12 -14, 14 2 C12 14, -8 15, -12 2 Z" fill="rgba(254, 205, 218, 0.82)"/>
          <circle cx="0" cy="0" r="6" fill="rgba(255, 234, 240, 0.92)"/>
        </g>
      </svg>

      <svg class="garden-svg garden-svg--bottom-left" viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-15 290 C65 230, 140 195, 250 175" stroke="rgba(96, 148, 110, 0.5)" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="115" cy="222" rx="28" ry="12" transform="rotate(-20 115 222)" fill="rgba(98, 150, 112, 0.55)"/>
        <ellipse cx="185" cy="195" rx="22" ry="10" transform="rotate(-12 185 195)" fill="rgba(118, 170, 130, 0.5)"/>
        <!-- Lush Foreground Rose -->
        <g transform="translate(74, 232)">
          <circle cx="0" cy="0" r="42" fill="rgba(214, 98, 132, 0.42)"/>
          <circle cx="4" cy="-4" r="30" fill="rgba(238, 142, 170, 0.62)"/>
          <circle cx="-2" cy="2" r="19" fill="rgba(250, 184, 204, 0.78)"/>
          <circle cx="1" cy="0" r="9" fill="rgba(255, 228, 236, 0.92)"/>
        </g>
        <g transform="translate(158, 246)">
          <circle cx="0" cy="0" r="24" fill="rgba(236, 146, 172, 0.5)"/>
          <circle cx="0" cy="0" r="12" fill="rgba(252, 202, 216, 0.8)"/>
        </g>
      </svg>

      <svg class="garden-svg garden-svg--bottom-right" viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M375 290 C295 230, 220 195, 110 175" stroke="rgba(96, 148, 110, 0.5)" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="245" cy="222" rx="28" ry="12" transform="rotate(20 245 222)" fill="rgba(98, 150, 112, 0.55)"/>
        <ellipse cx="175" cy="195" rx="22" ry="10" transform="rotate(12 175 195)" fill="rgba(118, 170, 130, 0.5)"/>
        <!-- Lush Foreground Rose -->
        <g transform="translate(286, 232)">
          <circle cx="0" cy="0" r="42" fill="rgba(214, 98, 132, 0.42)"/>
          <circle cx="-4" cy="-4" r="30" fill="rgba(238, 142, 170, 0.62)"/>
          <circle cx="2" cy="2" r="19" fill="rgba(250, 184, 204, 0.78)"/>
          <circle cx="-1" cy="0" r="9" fill="rgba(255, 228, 236, 0.92)"/>
        </g>
        <g transform="translate(202, 246)">
          <circle cx="0" cy="0" r="24" fill="rgba(236, 146, 172, 0.5)"/>
          <circle cx="0" cy="0" r="12" fill="rgba(252, 202, 216, 0.8)"/>
        </g>
      </svg>
    `;
  }

  _spawnFloatingPetals(count = 18) {
    if (!this.petalContainer) return;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'rose-petal';

      const leftPercent = (i * (100 / count) + (i % 3) * 4) % 98;
      const durationSec = 11 + (i % 7) * 2.2;
      const delaySec = -(i * 1.35);
      const sizePx = 11 + (i % 5) * 3;
      const swayPx = 22 + (i % 4) * 12;

      petal.style.setProperty('--petal-left', `${leftPercent.toFixed(1)}%`);
      petal.style.setProperty('--petal-duration', `${durationSec.toFixed(1)}s`);
      petal.style.setProperty('--petal-delay', `${delaySec.toFixed(2)}s`);
      petal.style.setProperty('--petal-size', `${sizePx}px`);
      petal.style.setProperty('--petal-sway', `${swayPx}px`);

      fragment.appendChild(petal);
    }

    this.petalContainer.appendChild(fragment);
  }
}