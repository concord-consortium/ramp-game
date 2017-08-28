import React, { PureComponent } from 'react'
import { Group, Text, Rect } from 'react-konva'

// Make height non-scalable, so it's possible to layout text and star rating in a deterministic way.
const BASE_HEIGHT = 17 // px
const MARKER_HEIGHT = 45 // px
const COLOR = '#d7170e'
const MARKER_WIDTH = 0.05

export default class GameTarget extends PureComponent {
  render () {
    const { sx, sy, pixelMeterRatio, x, width } = this.props
    return (
      <Group>
        <Rect x={sx(x - MARKER_WIDTH * 0.5)} y={sy(0) - MARKER_HEIGHT} width={MARKER_WIDTH * pixelMeterRatio}
          height={MARKER_HEIGHT} fill={COLOR} />
        <Rect x={sx(x - width * 0.5)} y={sy(0) - BASE_HEIGHT} width={width * pixelMeterRatio} height={BASE_HEIGHT}
          fill={COLOR} />
        <Text x={sx(x) - 15} y={sy(0) - MARKER_HEIGHT - 15} fontFamily={'Arial'} fontSize={14} text={x.toFixed(2)} fill={'black'} />
      </Group>
    )
  }
}
