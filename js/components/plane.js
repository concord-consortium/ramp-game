import React from 'react'
import {Line} from 'react-konva'

export default class Plane extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      hasClicked: false,
      color: 'grey'
    }
    this.handleClick = this.handleClick.bind(this)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.yPos != this.props.yPos)
  }

  handleClick() {
    this.setState({
      hasClicked: true,
      color: Konva.Util.getRandomColor()
    })
  }
  render() {
    const { color, hasClicked } = this.state
    const { yPos } = this.props
    let topPoint = yPos ? yPos : 200
    let points = [0,560, 300,560, 0, topPoint]
    return (
      <Line points={points} closed={true} fill={color} stroke={'black'} strokeWidth={1} onClick={this.handleClick} />
    )
  }
}