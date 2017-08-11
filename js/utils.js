export function calculateRampAngle (simHeight, topY, groundHeight, rampStartX, rampEndX) {
  let rampTop = simHeight - topY - groundHeight
  return Math.atan(rampTop / (rampEndX - rampStartX))
}

export function calculateAcceleratedPosition (originalPosition, initialVelocity, elapsedTime, acceleration) {
  return (
    originalPosition + (initialVelocity * elapsedTime) + (0.5 * acceleration * elapsedTime * elapsedTime)
  )
}

export function calculateVelocity (initialVelocity, acceleration, elapsedTime) {
  return initialVelocity + (acceleration * elapsedTime)
}

export function calculateTimeToGround (originalPosition, groundPosition, acceleration) {
  return Math.sqrt((groundPosition - originalPosition) * 2 / acceleration)
}

export function calculateRampAcceleration (simConstants, theta) {
  let g = simConstants.gravity
  let m = simConstants.mass
  let f = simConstants.rampFriction
  let parallelForce = m * g * (Math.sin(theta))
  let normalForce = m * g * (Math.cos(theta))
  let frictionForce = normalForce * f
  let rampAcceleration = (parallelForce - frictionForce) / m
  if (rampAcceleration < 0) rampAcceleration = 0
  return rampAcceleration
}

export function calculateGroundAcceleration (simConstants) {
  return simConstants.gravity * simConstants.groundFriction
}

// Vertical calculations are a little inverted since 0 for y is top of screen
export function calculateDistanceUpRampInWorldUnits (simSettings, xPos, yPos) {
  if (xPos > simSettings.RampEndX) return 0
  else {
    let xr = simSettings.RampEndX - xPos
    let yr = simSettings.SimHeight - simSettings.GroundHeight - yPos
    let rampDistanceInPixels = Math.sqrt((xr * xr) + (yr * yr))
    return rampDistanceInPixels / simSettings.Scale
  }
}

export function calculateDistanceInWorldUnits (simSettings, startPos, currentPos) {
  return (currentPos - startPos) / simSettings.Scale
}

// parse URL parameters
export function getURLParam (name, defaultValue = null) {
  const url = window.location.href
  name = name.replace(/[[]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return defaultValue
  if (!results[2]) return true
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}
