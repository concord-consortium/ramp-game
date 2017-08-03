function calculateRampAngle(simHeight, topY, groundHeight, rampStartX, rampEndX) {
  let rampTop = simHeight - topY - groundHeight
  let rampAngle = Math.atan(rampTop / (rampEndX - rampStartX))
  return rampAngle
}
function calculateAcceleratedPosition(originalPosition, initialVelocity, elapsedTime, acceleration) {
  return (
    originalPosition + (initialVelocity * elapsedTime) + (0.5 * acceleration * elapsedTime * elapsedTime)
  )
}

function calculateVelocity(initialVelocity, acceleration, elapsedTime) {
  let v = initialVelocity + (acceleration * elapsedTime);
  return v
}

function calculateTimeToGround(originalPosition, groundPosition, acceleration) {
  let t = Math.sqrt((groundPosition - originalPosition) * 2 / acceleration)
  return t
}

function calculateRampAcceleration(simConstants, theta) {
  let g = simConstants.gravity, m = simConstants.mass, f = simConstants.rampFriction
  let parallelForce = m * g * (Math.sin(theta))
  let normalForce = m * g * (Math.cos(theta))
  let frictionForce = normalForce * f
  let rampAcceleration = (parallelForce - frictionForce) / m
  if (rampAcceleration < 0) rampAcceleration = 0
  return rampAcceleration
}

function calculateGroundAcceleration(simConstants) {
  return simConstants.gravity * simConstants.groundFriction
}

module.exports = {
  calculateRampAngle,
  calculateAcceleratedPosition,
  calculateVelocity,
  calculateTimeToGround,
  calculateRampAcceleration,
  calculateGroundAcceleration
}