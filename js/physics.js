/* global  performance */
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
  const parallelAcceleration = gravity * (Math.sin(rampAngle))
  const normalAcceleration = gravity * (Math.cos(rampAngle))
  const rampAcceleration = parallelAcceleration - normalAcceleration * surfaceFriction
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

// Based on Gilbert Model with point charges
// see https://en.wikipedia.org/wiki/Force_between_magnets
export function calcMagneticForce (distanceMeters, chargeM1, chargeM2) {
  const permiability = 0.8 // Uh?
  const fallOff = 4 * Math.PI * (distanceMeters * distanceMeters)
  const forceNewtons = (permiability * chargeM1 * chargeM2) / fallOff
  return forceNewtons
}

export function calcAcceleration (forceN, massKg) {
  const metersPerS2 = forceN / massKg
  return metersPerS2
}

export function calcVelocity (previousV, mass, acc, deltaS) {
  return previousV * mass + acc * deltaS
}

export function calcPosition (previousX, vel, deltaS) {
  return previousX + (vel * deltaS)
}

export function crashSimulation (startX, _endX, carMass, chargeM1) {
  let lastTime = performance.now()
  let lastX = startX
  let lastV = 0
  const timestep = 0.02
  const endX = _endX
  const mass = carMass
  const charge = chargeM1
  const computeX = (timeNow) => {
    const deltaT = (timeNow - lastTime) / 1000
    if (deltaT < timestep) {
      return lastX
    }
    const distance = Math.abs(_endX - lastX)
    lastTime = timeNow
    const force = calcMagneticForce(distance, charge, charge)
    const acc = calcAcceleration(force, mass)
    lastV = calcVelocity(lastV, mass, acc, deltaT)
    lastX = calcPosition(lastX, lastV, deltaT)
    if (lastX > endX) {
      lastX = endX
    }
    return lastX
  }
  return computeX
}
