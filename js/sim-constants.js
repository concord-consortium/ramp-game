// MKS units are used everywhere: meters, kilograms and seconds.

export const minX = -2.3
export const minY = 0
export const maxX = 5.05
export const maxY = 3

export const rampStartX = -2.25
export const rampEndX = 0
export const rampBottomY = 0

// Range of point placed at the top of the ramp (where the car can be placed)
export const minRampTopX = rampStartX + 0.3
export const maxRampTopX = rampEndX - 1e-4
export const minRampTopY = rampBottomY + 0.2
export const maxRampTopY = maxY - 0.2

export const runoffEndX = 5
