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
    this.onClick = this.onClick.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
  }
  onClick(e) {
    console.log(e.evt.layerY)
    this.setState({
      hasClicked: true,
      color: Konva.Util.getRandomColor(),
      yPos: e.evt.layerY
    })
  }

  onDrag(e) {
    const { isDragging } = this.state
    if (isDragging && e.layerY) {
      //console.log(e);
      this.setState({
        yPos: e.layerY
      })
      this.props.onInclineChanged(e.layerY)
    }
  }
  onDragStart(e) {
    //console.log("drag start", e.evt.layerY)
    this.setState({
      isDragging: true,
      yPos: e.evt.layerY
    })

    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.onDragEnd);
    document.addEventListener('touchmove', this.onDrag);
    document.addEventListener('touchend', this.onDragEnd);

    event.preventDefault();
  }

  onDragEnd(e) {
    this.setState({
      isDragging: false,
      yPos: e.layerY
    })
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend', this.onDragEnd);

    event.preventDefault();
    this.props.onInclineChanged(e.layerY)
  }


  render() {
    const { color, hasClicked, yPos } = this.state
    let height = 20
    let width = 20
    let center = yPos - height/2
    return (
      <Rect x={0} y={center} width={width} height={height} fill={color} stroke={'black'} strokeWidth={1} onClick={this.onClick} onMouseDown={this.onDragStart} />
    )
  }
}