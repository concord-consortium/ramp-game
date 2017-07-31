import React from 'react'
import { Group, Text, Rect, Line } from 'react-konva'

export default class StaticElements extends React.Component{
  constructor(props) {
    super(props)
  }

  generateText() {

    const { simSettings } = this.props;

    let yPos = simSettings.SimHeight - simSettings.GroundHeight + (simSettings.GroundHeight/2)

    let textAnnotations = []
    for (let i = 0; i < 10; i++){
      let xPos = simSettings.RampEndX + ((simSettings.SimWidth - simSettings.RampEndX) / 10 * i) - 5
      let t = i/2 + ''
      textAnnotations.push(<Text x={xPos} y={yPos} fontFamily={'Arial'} fontSize={14} text={t} fill={'white'} key={i} /> )
    }
    return textAnnotations
  }

  generateMarks() {
    const { simSettings } = this.props;

    let yPos = simSettings.SimHeight - simSettings.GroundHeight

    let lineMarks = []
    for (let i = 0; i < 10; i++){
      let xPos = simSettings.RampEndX + ((simSettings.SimWidth-simSettings.RampEndX) / 10 * i)
      let points = [xPos, yPos,xPos,  yPos + (simSettings.GroundHeight/3)]
      lineMarks.push(<Line points={points} closed={false} stroke={'white'} strokeWidth={1} key={i}  /> )
    }
    return lineMarks

  }

  render() {
    const { simSettings } = this.props;
    let yGround = simSettings.SimHeight - simSettings.GroundHeight

    return (
      <Group>
        <Rect x={0} y={yGround} width={simSettings.SimWidth} height={simSettings.GroundHeight} fill={'green'} stroke={'black'} strokeWidth={1} />
        {this.generateText()}
        {this.generateMarks()}
      </Group>
    )
  }
}