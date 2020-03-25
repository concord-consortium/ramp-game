import React, { PureComponent } from 'react'
import * as c from '../sim-constants'
import { Group, Text, Rect, Line } from 'react-konva'

export const GROUND_HEIGHT = 35 // px
const MARKS_COUNT = 10

export default class Ground extends PureComponent {
  renderMarks () {
    const { sx, sy } = this.props

    const yPos = sy(c.rampBottomY)
    const markHeight = GROUND_HEIGHT * 0.4
    const step = (c.runoffEndX - c.rampEndX) / MARKS_COUNT

    const lineMarks = []
    for (let i = 0; i < MARKS_COUNT; i++) {
      const x = c.rampEndX + step * i
      const xPos = sx(x)
      const points = [xPos, yPos, xPos, yPos + markHeight]
      lineMarks.push(<Line points={points} closed={false} stroke={'white'} strokeWidth={1} key={'mark' + x} />)
      lineMarks.push(<Text x={xPos - 9} y={yPos + markHeight * 1.2} fontFamily={'Arial'} fontSize={14} text={`${x.toFixed(1)} m`} fill={'white'} key={'text' + x} />)
    }
    return lineMarks
  }

  render () {
    const { sx, sy, pixelMeterRatio, hideMarks } = this.props
    const width = (c.runoffEndX - c.rampStartX) * pixelMeterRatio
    return (
      <Group>
        <Rect x={sx(c.rampStartX)} y={sy(c.rampBottomY)} width={width} height={GROUND_HEIGHT} fill={'green'} stroke={'black'} strokeWidth={1} />
        { hideMarks ? null : this.renderMarks() }
      </Group>
    )
  }
}
