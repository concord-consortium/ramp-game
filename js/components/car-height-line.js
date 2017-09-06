import React, { PureComponent } from 'react'
import c from '../sim-constants'
import { Text, Line, Group } from 'react-konva'

const FONT = 'museo-sans, verdana, arial'

export default class CarHeightLine extends PureComponent {
  render () {
    const { sx, sy, carX, carY } = this.props
    const points = [
      sx(carX), sy(carY),
      sx(carX), sy(c.rampBottomY)
    ]
    return (
      <Group>
        <Line points={points} fill={'grey'} stroke={'black'} strokeWidth={1} />
        <Text x={sx(carX) - 16} y={sy(carY * 0.5) + 18} fontFamily={FONT} fontStyle='bold' fontSize={14} text={`${carY.toFixed(2)} m`} rotation={-90} fill='black' />
        <Text x={sx(carX) - 32} y={sy(carY * 0.5) + 18} fontFamily={FONT} fontSize={14} text='Height' rotation={-90} fill='black' />
      </Group>
    )
  }
}
