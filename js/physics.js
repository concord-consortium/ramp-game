import * as c from './sim-constants'

export function calcRampAngle (rampTopX, rampTopY) {
  return Math.atan2(rampTopX - c.rampEndX, rampTopY - c.rampBottomY) + Math.PI * 0.5
}

export function calcRampLength (rampTopX, rampTopY) {
  const x = rampTopX - c.rampEndX
  const y = rampTopY - c.rampBottomY
  return Math.sqrt(x * x + y * y)
}

export function calcDistanceUpRamp (carX, rampAngle) {
  const x = Math.abs(carX - c.rampEndX)
  return x / Math.cos(rampAngle)
}

export function calcRampAcceleration (gravity, surfaceFriction, rampAngle) {
  let parallelAcceleration = gravity * (Math.sin(rampAngle))
  let normalAcceleration = gravity * (Math.cos(rampAngle))
  let rampAcceleration = parallelAcceleration - normalAcceleration * surfaceFriction
  if (rampAcceleration < 0) {
    return 0
  }
  return rampAcceleration
}

export function calcRampDisplacement (rampAcceleration, elapsedTime) {
  return 0.5 * rampAcceleration * elapsedTime * elapsedTime
}

export function calcTimeToGround (startDistanceUpRamp, rampAcceleration) {
  // Based on rampDisplacement formula.
  return Math.sqrt(2 * startDistanceUpRamp / rampAcceleration)
}

export function calcGroundAcceleration (gravity, surfaceFriction) {
  return -1 * gravity * surfaceFriction
}

export function calcGroundDisplacement (velocityAtBottomOfRamp, groundAcceleration, elapsedTime) {
  return (velocityAtBottomOfRamp * elapsedTime) + (0.5 * groundAcceleration * elapsedTime * elapsedTime)
}

export function calcTimeOnGround (velocityAtBottomOfRamp, groundAcceleration) {
  return -velocityAtBottomOfRamp / groundAcceleration
}

export function calcCarY (carX, rampAngle) {
  if (carX < c.rampEndX) {
    return c.rampBottomY - (carX - c.rampEndX) * Math.tan(rampAngle)
  } else {
    return 0
  }
}

export function calcOutputs ({ initialCarX, gravity, surfaceFriction, rampTopX, rampTopY, elapsedTime }) {
  const rampAngle = calcRampAngle(rampTopX, rampTopY)
  const startDistanceUpRamp = calcDistanceUpRamp(initialCarX, rampAngle)
  const rampAcceleration = calcRampAcceleration(gravity, surfaceFriction, rampAngle)
  const timeToGround = calcTimeToGround(startDistanceUpRamp, rampAcceleration)
  const velocityAtBottomOfRamp = rampAcceleration * timeToGround
  const groundAcceleration = calcGroundAcceleration(gravity, surfaceFriction)
  const timeOnGround = calcTimeOnGround(velocityAtBottomOfRamp, groundAcceleration)
  const totalTime = timeToGround + timeOnGround
  let carX
  let carVelocity
  let currentEndDistance
  if (elapsedTime < timeToGround) {
    carX = initialCarX + calcRampDisplacement(rampAcceleration, elapsedTime) * Math.cos(rampAngle)
    carVelocity = rampAcceleration * elapsedTime
    currentEndDistance = null // it won't be shown in UI before car reaches bottom of the ramp
  } else {
    const groundElapsedTime = Math.min(elapsedTime - timeToGround, timeOnGround)
    currentEndDistance = c.rampEndX + calcGroundDisplacement(velocityAtBottomOfRamp, groundAcceleration, groundElapsedTime)
    carX = currentEndDistance
    carVelocity = velocityAtBottomOfRamp + groundAcceleration * groundElapsedTime
  }
  return {
    rampAngle,
    startDistanceUpRamp,
    currentEndDistance,
    velocityAtBottomOfRamp,
    timeToGround,
    carX,
    carY: calcCarY(carX, rampAngle),
    carAngle: carX < c.rampEndX ? rampAngle : 0,
    carVelocity,
    rampLength: calcRampLength(rampTopX, rampTopY),
    startHeightAboveGround: calcCarY(initialCarX, rampAngle),
    totalTime: timeToGround + timeOnGround,
    endDistance: c.rampEndX + calcGroundDisplacement(velocityAtBottomOfRamp, groundAcceleration, timeOnGround),
    simulationFinished: elapsedTime === totalTime
  }
}
