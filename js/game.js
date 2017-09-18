import { showWebView } from './codap-handler'

export const MIN_SCORE_TO_ADVANCE = 33
export const MIN_SCORE_TO_AVOID_HINTS = MIN_SCORE_TO_ADVANCE
export const MIN_SCORE_TO_AVOID_REMEDIATION = MIN_SCORE_TO_ADVANCE
export const GAME_INPUTS = ['surfaceFriction']
export const GAME_OUTPUTS = ['startHeightAboveGround', 'startDistanceUpRamp', 'currentEndDistance']
const HINT_COMPONENT_TITLE = 'Ramp Game Hints'

export function calcGameScore (carX, targetX, targetWidth) {
  const targetRadius = 0.5 * targetWidth
  const dist = Math.min(targetRadius, Math.abs(targetX - carX))
  return 50 * (1 + Math.cos(Math.PI * dist / targetRadius))
}

export function calcStarsCount (score) {
  if (score >= 95) {
    return 3
  } else if (score >= 75) {
    return 2
  } else if (score >= MIN_SCORE_TO_ADVANCE) {
    return 1
  }
  return 0
}

export const challenges = [
  {
    /** * Challenge 1 ***/
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Make the car stop in the middle of the red zone.
              Place the car on the ramp by clicking on it and
              dragging it. As you get better, the red target will get smaller.`,
    targetX (step) {
      return 2.91
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    }
  },
  {
    /** * Challenge 2 ***/
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Welcome to Challenge 2. The target will now move each time,
              so trial and error may not be a successful strategy here.`,
    minTargetMove (targetWidth) {
      return targetWidth ? 0.3 * targetWidth : 0
    },
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    },
    hint (state) {
      if (state.runsInStep >= 3) {
        showWebView({
          title: HINT_COMPONENT_TITLE,
          width: 415,
          height: 560,
          URL: 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange2-make-a-graph.html'
        })
      }
    },
    loseStep (state) {
      return state.remedialScores >= 3
    }
  },
  {
    /** * Challenge 3 ***/
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.2,
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Welcome Challenge 3. The surface has been changed to have less friction. Can you still hit the target?`,
    minTargetMove (targetWidth) {
      return targetWidth ? 0.3 * targetWidth : 0
    },
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    },
    hint (state) {
      if (state.hintableScores >= 3) {
        showWebView({
          title: HINT_COMPONENT_TITLE,
          width: 375,
          height: 415,
          URL: 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange3-movable-line.html'
        })
      }
    },
    loseStep (state) {
      return state.remedialScores >= 3
    }
  },
  {
    /** * Challenge 4 ***/
    steps: 4,
    mass: 0.05,
    carDragging: false,
    initialCarX: -1,
    disabledInputs: ['startDistanceUpRamp', 'startHeightAboveGround'],
    message: `Welcome to Challenge 4. Now you control the friction rather than the starting height.`,
    unallowedCarDragMsg: 'Remember you can only adjust surface friction in this challenge.',
    minTargetMove (targetWidth) {
      return targetWidth ? 0.3 * targetWidth : 0
    },
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    },
    hint (state) {
      const urls = [
        'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-axis-legend-selection.html',
        'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-axis-selection.html',
        'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-legend-selection.html',
        'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-selection.html'
      ]
      const randomIndex = Math.floor(Math.random() * urls.length)
      if (state.hintableScores >= 3) {
        showWebView({
          title: HINT_COMPONENT_TITLE,
          width: 405,
          height: 615,
          URL: urls[randomIndex]
        })
      }
    },
    loseStep (state) {
      return state.remedialScores >= 3
    }
  }
]
