import React, { PureComponent } from 'react'
import { Group, Text, Rect } from 'react-konva'

const HEIGHT = 0.1
const COLOR = '#d7170e'
const MARKER_WIDTH = 0.05
const MARKER_H_MULT = 2.2

export default class GameTarget extends PureComponent {
  render () {
    const { sx, sy, pixelMeterRatio, x, width } = this.props
    return (
      <Group>
        <Rect x={sx(x - MARKER_WIDTH * 0.5)} y={sy(HEIGHT * MARKER_H_MULT)} width={MARKER_WIDTH * pixelMeterRatio}
          height={HEIGHT * MARKER_H_MULT * pixelMeterRatio} fill={COLOR} />
        <Rect x={sx(x - width * 0.5)} y={sy(HEIGHT)} width={width * pixelMeterRatio} height={HEIGHT * pixelMeterRatio}
          fill={COLOR} />
        <Text x={sx(x) - 15} y={sy(HEIGHT * MARKER_H_MULT) - 15} fontFamily={'Arial'} fontSize={14} text={x.toFixed(2)} fill={'black'} />
      </Group>
    )
  }
}
