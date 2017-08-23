export function calcGameScore (carX, targetX, targetWidth) {
  const dist = Math.min(targetWidth * 0.5, Math.abs(targetX - carX))
  return Math.round(100 * (1 - dist / (targetWidth * 0.5)))
}

export function getScoreMessage (score, challengeIdx, stepIdx) {
  const challenge = challenges[challengeIdx]
  if (score >= challenge.minScore && stepIdx + 1 < challenge.steps) {
    return `Congratulations! You earned ${score} points! You advance a step and the target gets smaller.`
  } else if (score >= challenge.minScore && challenges[challengeIdx + 1]) {
    return `Congratulations! You earned ${score} points! You advance to a new challenge!`
  } else if (score >= challenge.minScore && !challenges[challengeIdx + 1]) {
    return `Congratulations! You have completed all the challenges!`
  } else if (score >= challenge.prevStepScore) {
    return `OK! You earned ${score} points. Try again. You have to get ${challenge.minScore} points to advance.`
  } else if (stepIdx > 0) {
    return `Not so good. You score ${score} points. Since your score was less than 25 you now get a larger target.`
  }
  return `Not so good. You score ${score} points. Try again. You have to get ${challenge.minScore} points to advance.`
}

export const challenges = [
  {
    steps: 3,
    minScore: 67,
    prevStepScore: 25,
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
    minScore: 67,
    prevStepScore: 25,
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
    minScore: 67,
    prevStepScore: 25,
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
    minScore: 67,
    prevStepScore: 25,
    mass: 0.1,
    surfaceFriction: 0.3,
    carDragging: true,
    disabledInputs: ['mass', 'gravity', 'surfaceFriction'],
    message: `Make this heavier car stop in the center of the red area.
              This car is twice the mass of the last car, but the friction is back to what it was before.`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.12
    }
  },
  {
    steps: 3,
    minScore: 67,
    prevStepScore: 25,
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
