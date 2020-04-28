import React from 'react'
import instructionStyles from '../../css/car-crash-instructions.less'

const instructionImage = './common/images/crash/instructions.png'
const instructionsText = `
Use your mouse to drag the car on the left away from the parked car on the right.  Release the mouse and see how fast the dragged car is moving when it collides with the parked vehicle.

Try starting the car at different locations. What do you notice?
`

export const Instructions = () => {
  return (
    <div className={instructionStyles.wrapper}>
      <div className={instructionStyles.instructions}>
        {instructionsText}
      </div>
      <img
        src={instructionImage}
        alt={instructionsText}
        className={instructionStyles.image}
      />
    </div>
  )
}
