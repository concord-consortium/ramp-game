export const MIN_SCORE_TO_ADVANCE = 33
export const GAME_INPUTS = ['surfaceFriction']

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

export const challenges = [
  {
    steps: 3,
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
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Welcome to Challenge 2. The target will now move each time, 
              so trial and error may not be a successful strategy here.`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    }
  },
  {
    steps: 4,
    mass: 0.05,
    surfaceFriction: 0.2,
    carDragging: true,
    disabledInputs: ['surfaceFriction'],
    message: `Welcome Challenge 3. The surface has been changed to have less friction. Can you still hit the target?`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    }
  },
  {
    steps: 3,
    mass: 0.05,
    surfaceFriction: 0.3,
    carDragging: false,
    initialCarX: -1,
    disabledInputs: [],
    message: `Welcome to Challenge 4. Now you control the friction rather than the starting height.`,
    targetX (step) {
      return Math.random() * 3 + 1
    },
    targetWidth (step) {
      return 0.9 - step * 0.14
    }
  }
]
