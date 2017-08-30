import React, { PureComponent } from 'react'
import c from '../sim-constants'
import { Text, Line, Group } from 'react-konva'

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
        <Text x={sx(carX) - 16} y={sy(carY * 0.5) + 15} fontFamily={'Arial'} fontSize={14} text={`${carY.toFixed(2)}`} rotation={-90} fill='navy' />
      </Group>
    )
  }
}
