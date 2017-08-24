export const MIN_SCORE_TO_ADVANCE = 33

export function calcGameScore (carX, targetX, targetWidth) {
  const dist = Math.min(targetWidth * 0.5, Math.abs(targetX - carX))
  return Math.round(100 * (1 - dist / (targetWidth * 0.5)))
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

export function getScoreMessage (score, challengeIdx, stepIdx) {
  const challenge = challenges[challengeIdx]
  let stars = ''
  for (let i = 0, len = calcStarsCount(score); i < len; i++) {
    stars += '★'
  }
  if (score >= MIN_SCORE_TO_ADVANCE && stepIdx + 1 < challenge.steps) {
    return `Congratulations! You earned ${stars}! You advance a step and the target gets smaller.`
  } else if (score >= MIN_SCORE_TO_ADVANCE && challenges[challengeIdx + 1]) {
    return `Congratulations! You earned ${stars}! You advance to a new challenge!`
  } else if (score >= MIN_SCORE_TO_ADVANCE && !challenges[challengeIdx + 1]) {
    return `Congratulations! You have completed all the challenges!`
  }
  return `Not so good. Try again. You have to get ★ to advance.`
}

export const challenges = [
  {
    steps: 3,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: true,
    disabledInputs: ['mass', 'gravity', 'surfaceFriction'],
    message: `Make the car stop in the middle of the red zone.
              Place the car on the ramp by clicking on it and
              dragging it. As you get better, the red target will get smaller.`,
    targetX (step) {
      return 2.91
    },
    targetWidth (step) {
      return 0.9 - step * 0.12
    }
  },
  {
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: true,
    disabledInputs: ['mass', 'gravity', 'surfaceFriction'],
    message: `Make the car stop in the center of the
              red area by changing the car's starting
              position. Watch out! The red band now moves each trial.`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.12
    }
  },
  {
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.2,
    carDragging: true,
    disabledInputs: ['mass', 'gravity', 'surfaceFriction'],
    message: `Make a new car stop in the red area.
              This car has less friction.`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.12
    }
  },
  {
    steps: 3,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: false,
    initialCarX: -1,
    disabledInputs: ['mass', 'gravity'],
    message: `Now make the car stop in the center of the red area by changing the friction slider.`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.12
    }
  }
]
