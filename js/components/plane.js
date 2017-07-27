import React from 'react'
import {Line} from 'react-konva'

export default class Plane extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const { currentPositions } = this.props
    let points = [
      0, currentPositions.RampBottomY,
      currentPositions.RampStartX, currentPositions.RampBottomY,
      currentPositions.RampEndX, currentPositions.RampBottomY,
      currentPositions.RampStartX, currentPositions.RampTopY,
      0, currentPositions.RampTopY]
    return (
      <Line points={points} closed={true} fill={'grey'} stroke={'black'} strokeWidth={1} />
    )
  }
}