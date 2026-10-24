export const APP_STATES = Object.freeze({
  INTRO: 'intro',
  GARDEN_READY: 'garden-ready',
  ENVELOPE_OPENING: 'envelope-opening',
  LETTER_REVEALING: 'letter-revealing',
  LETTER_VISIBLE: 'letter-visible',
  TRANSITIONING: 'transitioning',
  NEXT_ENVELOPE_READY: 'next-envelope-ready',
  FINAL_STATE: 'final-state'
});

const VALID_TRANSITIONS = Object.freeze({
  [APP_STATES.INTRO]: [APP_STATES.GARDEN_READY],
  [APP_STATES.GARDEN_READY]: [APP_STATES.ENVELOPE_OPENING],
  [APP_STATES.ENVELOPE_OPENING]: [APP_STATES.LETTER_REVEALING],
  [APP_STATES.LETTER_REVEALING]: [APP_STATES.LETTER_VISIBLE],
  [APP_STATES.LETTER_VISIBLE]: [
    APP_STATES.TRANSITIONING,
    APP_STATES.FINAL_STATE
  ],
  [APP_STATES.TRANSITIONING]: [
    APP_STATES.NEXT_ENVELOPE_READY,
    APP_STATES.FINAL_STATE
  ],
  [APP_STATES.NEXT_ENVELOPE_READY]: [APP_STATES.ENVELOPE_OPENING],
  [APP_STATES.FINAL_STATE]: [APP_STATES.LETTER_VISIBLE]
});

export class ExperienceStateMachine {
  constructor(initialState = APP_STATES.INTRO) {
    this.currentState = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.currentState;
  }

  canTransitionTo(targetState) {
    const allowed = VALID_TRANSITIONS[this.currentState] || [];
    return allowed.includes(targetState);
  }

  transitionTo(targetState, payload = {}) {
    if (!this.canTransitionTo(targetState)) {
      console.warn(
        `[StateMachine] Blocked invalid transition from "${this.currentState}" to "${targetState}".`
      );
      return false;
    }

    const previousState = this.currentState;
    this.currentState = targetState;

    for (const listener of this.listeners) {
      listener({
        previousState,
        currentState: this.currentState,
        payload
      });
    }

    return true;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}