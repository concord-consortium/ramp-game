import React from 'react'
import {Line} from 'react-konva'

export default class Plane extends React.Component{
  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.yPos != this.props.yPos)
  }


  render() {
    const { yPos } = this.props
    let topPoint = yPos ? yPos : 200
    let points = [0,560, 300,560, 0, topPoint]
    return (
      <Line points={points} closed={true} fill={'grey'} stroke={'black'} strokeWidth={1} />
    )
  }
}