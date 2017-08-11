import React from 'react'
import { Group, Text, Line, Arc } from 'react-konva'

export default class Ramp extends React.Component {
  calculateAngle () {
    const { simSettings } = this.props
    return simSettings.RampAngle * 180 / Math.PI
  }

  render () {
    const { simSettings } = this.props
    let points = [
      0, simSettings.RampBottomY,
      simSettings.RampStartX, simSettings.RampBottomY,
      simSettings.RampEndX, simSettings.RampBottomY,
      simSettings.RampStartX, simSettings.RampTopY,
      0, simSettings.RampTopY]
    return (
      <Group>
        <Line points={points} closed fill={'grey'} stroke={'black'} strokeWidth={1} />
        <Arc x={simSettings.RampEndX - 1} y={simSettings.RampBottomY - 1} outerRadius={40} innerRadius={0} fill={'#dddddd'} stroke={0} angle={this.calculateAngle()} rotation={180} />
        <Text x={simSettings.RampEndX - 35} y={simSettings.RampBottomY - 15} fontFamily={'Arial'} fontSize={14} text={Math.round(this.calculateAngle())} fill={'navy'} />
      </Group>
    )
  }
}
