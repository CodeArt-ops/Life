import { EXPERIENCE_CONFIG } from '../config/lettersConfig.js';

/**
 * Preloads a single image and requests asynchronous bitmap decoding if supported.
 */
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';

    const finalize = () => {
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {}).finally(() => resolve(img));
      } else {
        resolve(img);
      }
    };

    img.onload = finalize;
    img.onerror = () => {
      console.warn(`[AssetPreloader] Could not preload image: ${src}`);
      resolve(null);
    };

    img.src = src;
  });
}

/**
 * Preloads the critical first letter immediately and queues the second letter
 * and background asset in parallel during the intro sequence.
 */
export async function preloadAllVisualAssets() {
  const urls = [
    EXPERIENCE_CONFIG.letters[0].src,
    EXPERIENCE_CONFIG.letters[1].src,
    EXPERIENCE_CONFIG.assets.scene2Background.src
  ];

  await Promise.all(urls.map((url) => preloadImage(url)));
}