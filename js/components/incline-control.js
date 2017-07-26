import React from 'react'
import { Rect } from 'react-konva'

export default class InclineControl extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      yPos: this.props.yPos? this.props.yPos : 200,
      isDragging: false,
      color: 'darkgrey'
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
    window.onMouseUp = this.handleDragEnd.bind(this)
  }
  handleClick(e) {
    console.log(e.evt.layerY)
    this.setState({
      hasClicked: true,
      color: Konva.Util.getRandomColor(),
      yPos: e.evt.layerY
    })
  }

  handleDrag(e) {
    const { isDragging } = this.state
    if (isDragging) {
      this.setState({
        yPos: e.evt.layerY
      })
      this.props.onInclineChanged(e.evt.layerY)
    }
  }
  handleDragStart(e) {
    //console.log("drag start", e.evt.layerY)
    this.setState({
      isDragging: true,
      yPos: e.evt.layerY
    })
  }

  handleDragEnd(e) {
    //console.log("drag end", e.evt.layerY)
    this.setState({
      isDragging: false,
      yPos: e.evt.layerY
    })
    this.props.onInclineChanged(e.evt.layerY)
  }


  render() {
    const { color, hasClicked, yPos } = this.state
    let height = 20
    let width = 20
    let center = yPos - height/2
    return (
      <Rect x={0} y={center} width={width} height={height} fill={color} stroke={'black'} strokeWidth={1} onClick={this.handleClick} onMouseMove={this.handleDrag} onMouseDown={this.handleDragStart} onMouseUp={this.handleDragEnd}/>
    )
  }
}