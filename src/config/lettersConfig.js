/**
 * Central configuration for the Personalized Interactive Birthday Letter Garden.
 * All paths match the exact existing files inside YourLife/Assets/.
 */
export const EXPERIENCE_CONFIG = {
  introMessages: {
    first: 'Happy Birthday My Women',
    second: "Congratulations my girl, you're 17 now"
  },

  assets: {
    scene2Background: {
      src: './Assets/Background/scene2background.png',
      width: 675,
      height: 1200,
      targetOpacity: 0.22 // Within the required 20%–25% opacity range
    },
    music: {
      src: './Assets/Music/Music.mp3',
      initialVolume: 0.85
    }
  },

  letters: [
    {
      id: 'letter-1',
      index: 0,
      title: 'First Birthday Letter',
      src: './Assets/Letters/Letter_1.png',
      width: 1024,
      height: 1536,
      aspectRatio: 1024 / 1536,
      promptText: 'Tap the seal to open your first letter'
    },
    {
      id: 'letter-2',
      index: 1,
      title: 'Second Birthday Letter',
      src: './Assets/Letters/Letter_2.png',
      width: 941,
      height: 1672,
      aspectRatio: 941 / 1672,
      promptText: 'Tap the seal to open your second letter'
    }
  ],

  timings: {
    introFirstDurationMs: 3900,
    introGapMs: 250,
    introSecondDurationMs: 4100,
    introFadeOutMs: 1000,
    flapOpenDurationMs: 850,
    letterEmergeDurationMs: 1450,
    envelopeDropDurationMs: 950,
    nextButtonDelayMs: 2400, // 2–3 seconds after reveal animation finishes
    letterExitLeftDurationMs: 850,
    secondEnvelopeEnterDurationMs: 1100
  }
};
