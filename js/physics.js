import c from './sim-constants'

export function rampAngle (rampTopX, rampTopY) {
  return Math.atan2(rampTopX - c.rampEndX, rampTopY - c.rampBottomY) + Math.PI * 0.5
}

export function rampLength (rampTopX, rampTopY) {
  const x = rampTopX - c.rampEndX
  const y = rampTopY - c.rampBottomY
  return Math.sqrt(x * x + y * y)
}

export function carRampDist (initialCarX, rampTopX, rampTopY) {
  const x = initialCarX - c.rampEndX
  const y = carY(initialCarX, rampTopX, rampTopY) - c.rampBottomY
  return Math.sqrt(x * x + y * y)
}

export function rampAcceleration (gravity, rampFriction, rampAngle) {
  let parallelAcceleration = gravity * (Math.sin(rampAngle))
  let normalAcceleration = gravity * (Math.cos(rampAngle))
  let rampAcceleration = parallelAcceleration - normalAcceleration * rampFriction
  if (rampAcceleration < 0) {
    return 0
  }
  return rampAcceleration
}

export function rampDisplacement (rampAcceleration, elapsedTime) {
  return 0.5 * rampAcceleration * elapsedTime * elapsedTime
}

export function rampTravelTime (rampDist, rampAcceleration) {
  // Based on rampDisplacement formula.
  return Math.sqrt(2 * rampDist / rampAcceleration)
}

export function groundAcceleration (gravity, groundFriction) {
  return -1 * gravity * groundFriction
}

export function groundDisplacement (initialVelocity, groundAcceleration, elapsedTime) {
  return (initialVelocity * elapsedTime) + (0.5 * groundAcceleration * elapsedTime * elapsedTime)
}

export function groundTravelTime (initialVelocity, groundAcceleration) {
  return -initialVelocity / groundAcceleration
}

export function carX ({ initialCarX, gravity, rampFriction, groundFriction, rampTopX, rampTopY, elapsedTime }) {
  const cRampDist = carRampDist(initialCarX, rampTopX, rampTopY)
  const rAngle = rampAngle(rampTopX, rampTopY)
  const rAcceleration = rampAcceleration(gravity, rampFriction, rAngle)
  const rTravelTime = rampTravelTime(cRampDist, rAcceleration)
  if (elapsedTime < rTravelTime) {
    return initialCarX + rampDisplacement(rAcceleration, elapsedTime) * Math.cos(rAngle)
  } else {
    const gAcceleration = groundAcceleration(gravity, groundFriction)
    const gElapsedTime = elapsedTime - rTravelTime
    const gInitialVelocity = rAcceleration * rTravelTime
    const gTravelTime = groundTravelTime(gInitialVelocity, gAcceleration)
    if (gElapsedTime < gTravelTime) {
      return c.rampEndX + groundDisplacement(gInitialVelocity, gAcceleration, gElapsedTime)
    } else {
      return c.rampEndX + groundDisplacement(gInitialVelocity, gAcceleration, gTravelTime)
    }
  }
}

export function carY (carX, rampTopX, rampTopY) {
  if (carX < c.rampEndX) {
    return c.rampBottomY - (carX - c.rampEndX) * Math.tan(rampAngle(rampTopX, rampTopY))
  } else {
    return 0
  }
}

export function simulationTime ({ initialCarX, gravity, rampFriction, groundFriction, rampTopX, rampTopY }) {
  const cRampDist = carRampDist(initialCarX, rampTopX, rampTopY)
  const rAngle = rampAngle(rampTopX, rampTopY)
  const rAcceleration = rampAcceleration(gravity, rampFriction, rAngle)
  const rTravelTime = rampTravelTime(cRampDist, rAcceleration)

  const gInitialVelocity = rAcceleration * rTravelTime
  const gAcceleration = groundAcceleration(gravity, groundFriction)
  const gTravelTime = groundTravelTime(gInitialVelocity, gAcceleration)

  return rTravelTime + gTravelTime
}
