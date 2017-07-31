import React from 'react'
import {Line} from 'react-konva'

export default class Plane extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const { simSettings } = this.props
    let points = [
      0, simSettings.RampBottomY,
      simSettings.RampStartX, simSettings.RampBottomY,
      simSettings.RampEndX, simSettings.RampBottomY,
      simSettings.RampStartX, simSettings.RampTopY,
      0, simSettings.RampTopY]
    return (
      <Line points={points} closed={true} fill={'grey'} stroke={'black'} strokeWidth={1} />
    )
  }
}