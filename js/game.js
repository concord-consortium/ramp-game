import { showWebView } from './codap-handler'

export const MIN_SCORE_TO_ADVANCE = 33
export const MIN_SCORE_TO_AVOID_HINTS = MIN_SCORE_TO_ADVANCE
export const MIN_SCORE_TO_AVOID_REMEDIATION = MIN_SCORE_TO_ADVANCE
export const GAME_INPUTS = ['surfaceFriction']
export const GAME_OUTPUTS = ['startHeightAboveGround', 'startDistanceUpRamp', 'currentEndDistance']
const HINT_COMPONENT_TITLE = 'Ramp Game Hints'
const CH2_GRAPH_HINT_URL = 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange2-make-a-graph.html'
const CH2_MOVABLE_LINE_HINT_URL = 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange3-movable-line.html'
const CH3_GRAPH_CONFIG_HINT_URL = 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-axis-legend-selection.html'
const CH3_AXIS_CONFIG_HINT_URL = 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-axis-selection.html'
const CH3_LEGEND_CONFIG_HINT_URL = 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-legend-selection.html'
const CH3_SELECTION_HINT_URL = 'https://inquiryspace-resources.concord.org/ramp-game-hints/challange4-selection.html'

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
    maxRunsInChallenge: 12,
    steps: 4,
    mass: 0.05,
    surfaceFriction (attemptSet) {
      return 0.3
    },
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Make the car stop in the middle of the red zone.
              Place the car on the ramp by clicking on it and
              dragging it. As you get better, the red target will get smaller.`,
    runsExhaustedMsg: "Oh no! You've used up all of your cars. Try again.",
    targetX (attemptSet) {
      return [2.91, 1.46, 3.67][attemptSet % 3]
    },
    targetWidth (step) {
      return 0.7 - step * 0.14
    },
    runFeedback (state) {
      if (!state.attemptSet && (state.runsInChallenge === 1) && (state.score < MIN_SCORE_TO_ADVANCE)) {
        return 'Try adjusting the position of the car to get closer to the center of the target.'
      } else if ((state.successesInChallenge === 1) && (state.score >= MIN_SCORE_TO_ADVANCE)) {
        return 'Congratulations on finishing the first of four steps in this challenge. Your targets will now get smaller.'
      }
      return null
    }
  },
  {
    /** * Challenge 2 ***/
    maxRunsInChallenge: 12,
    steps: 4,
    mass: 0.05,
    surfaceFriction (attemptSet) {
      return [0.3, 0.2, 0.4][attemptSet % 3]
    },
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Welcome to Challenge 2. The target will now move each time,
              so trial and error may not be a successful strategy here.`,
    runsExhaustedMsg: "Oh no! You've used up all of your cars. The surface friction has now changed!",
    minTargetMove (runOffLength) {
      return runOffLength ? 0.3 * runOffLength : 0
    },
    targetX (attemptSet) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.7 - step * 0.14
    },
    hint (state, codapActions) {
      if (state.hintableScores >= 3) {
        showWebView({
          title: HINT_COMPONENT_TITLE,
          width: 415,
          height: 560,
          URL: codapActions.hasSeenGraphHint ? CH2_MOVABLE_LINE_HINT_URL : CH2_GRAPH_HINT_URL
        })
        codapActions.hasSeenGraphHint = true
        return true
      }
    },
    loseStep (state) {
      return state.remedialScores >= 3
    }
  },
  {
    /** * Challenge 3 ***/
    maxRunsInChallenge: 12,
    steps: 4,
    mass: 0.05,
    carDragging: false,
    initialCarX (attemptSet) {
      return [-1, -1.5, -0.75][attemptSet % 3]
    },
    disabledInputs: ['startDistanceUpRamp', 'startHeightAboveGround'],
    message: `Welcome to Challenge 3. Now you control the friction rather than the starting height.`,
    unallowedCarDragMsg: 'Remember you can only adjust surface friction in this challenge.',
    runsExhaustedMsg: "Oh no! You've used up all of your cars. Now you have to start at a different position up the ramp.",
    minTargetMove (runOffLength) {
      return runOffLength ? 0.3 * runOffLength : 0
    },
    targetX (attemptSet) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.7 - step * 0.14
    },
    hint (state, codapActions) {
      if (state.hintableScores >= 3) {
        let url = CH3_GRAPH_CONFIG_HINT_URL
        const hasConfiguredAxes = codapActions.hasPutFrictionOnAxis &&
                                    codapActions.hasPutEndDistanceOnAxis
        const hasConfiguredLegend = codapActions.hasPutChallengeOnLegend
        if (hasConfiguredAxes && hasConfiguredLegend) {
          url = CH3_SELECTION_HINT_URL
        } else if (hasConfiguredAxes && !hasConfiguredLegend) {
          url = CH3_LEGEND_CONFIG_HINT_URL
        } else if (!hasConfiguredAxes && hasConfiguredLegend) {
          url = CH3_AXIS_CONFIG_HINT_URL
        }
        showWebView({
          title: HINT_COMPONENT_TITLE,
          width: 405,
          height: 615,
          URL: url
        })
        return true
      }
    },
    loseStep (state) {
      return state.remedialScores >= 3
    }
  }
]
