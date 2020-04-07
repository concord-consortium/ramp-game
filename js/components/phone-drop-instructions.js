import React from 'react'
import instructionStyles from '../../css/phone-drop-instructions.less'

const instructionImage = './common/images/phone-drop/phone-drop-instructions.png'
const instructionsText = `
Use your mouse to drag phone off the ground. Release the mouse and see how
fast the phone is moving when it collides with the ground.

Try droping the phone from different heights. What do you notice?
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
