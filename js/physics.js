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
  const epsilon = 0.00001
  const effectiveDistance = Math.max(epsilon, distanceMeters)
  const permeability = 0.8
  const fallOff = 4 * Math.PI * (effectiveDistance * effectiveDistance)
  const forceNewtons = (permeability * chargeM1 * chargeM2) / fallOff
  return forceNewtons
}

export function calcAcceleration (forceN, massKg, useFriction=false) {
  const frictionCoef = 10e-5
  let friction = 0
  if(useFriction) {
    friction = massKg * -9.81 * frictionCoef
  }
  const netForceN = Math.max(0, friction + forceN)
  const metersPerS2 = netForceN / massKg
  return metersPerS2
}

export function crashSimulation (startX, endX, timeScale, carMass, chargeM1) {
  const startTime = performance.now()
  const mass = carMass
  const distance = endX - startX
  const numChunks = 50
  const deltaD = distance / numChunks
  const forces = []

  for (let x = endX - 0.001; x >= startX; x = x - deltaD) {
    const d = (endX - x)
    const f = calcMagneticForce(d, chargeM1, chargeM1)
    forces.push(f)
  }
  forces.reverse()

  const accelerations = forces.map(f => calcAcceleration(f, mass))
  const times = accelerations.map(a => Math.sqrt(deltaD / a))
  const velocities = times.map(t => deltaD / t)

  const computeX = (timeNow) => {
    let deltaT = timeNow - startTime
    deltaT = deltaT * timeScale
    let x = 0
    let i = 0
    let time = 0
    let velocity = 0
    while (time < deltaT && i < (numChunks - 1)) {
      time = time + times[i]
      i++
    }
    if (isFinite(time)) {
      velocity = velocities[i]
      x = startX + ((i * deltaD) + velocity * (deltaT - time))
      x = x > endX ? endX : x
    } else {
      x = startX
    }
    const force = mass * 0.5 * (velocity ** 2)
    return { nextX: x, velocity: velocity, force: force }
  }
  return computeX
}
