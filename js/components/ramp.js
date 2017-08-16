import React, { PureComponent } from 'react'
import c from '../sim-constants'
import { rampAngle } from '../physics'
import { Group, Text, Line, Arc } from 'react-konva'

export default class Ramp extends PureComponent {
  render () {
    const { sx, sy, pointX, pointY, angle } = this.props
    const points = [
      sx(c.rampStartX), sy(pointY),
      sx(c.rampStartX), sy(c.rampBottomY),
      sx(c.rampEndX), sy(c.rampBottomY),
      sx(pointX), sy(pointY)
    ]
    const angleInDeg = angle * 180 / Math.PI
    return (
      <Group>
        <Line points={points} closed fill={'grey'} stroke={'black'} strokeWidth={1} />
        <Arc x={sx(c.rampEndX)} y={sy(c.rampBottomY)} outerRadius={40} innerRadius={0} fill={'#dddddd'} stroke={0} angle={angleInDeg} rotation={180} />
        <Text x={sx(c.rampEndX) - 35} y={sy(c.rampBottomY) - 17} fontFamily={'Arial'} fontSize={14} text={Math.round(angleInDeg) + '°'} fill={'navy'} />
      </Group>
    )
  }
}
