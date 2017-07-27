import React from 'react'
import { Rect, Circle } from 'react-konva'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'white',
  stroke: 'black',
  strokeWidth: 2
}
const HIDDEN_APPEARANCE = {
  scale: 10,
  fillColor: 'white',
  stroke: 'black',
  strokeWidth: 1
}

export default class InclineControl extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      currentPositions: this.props.currentPositions,
      isDragging: false,
      color: 'darkgrey',
      appearance: HIDDEN_APPEARANCE
    }
    //this.onClick = this.onClick.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onHover = this.onHover.bind(this)
    this.clampPosition = this.clampPosition.bind(this)
    this.updatePositions = this.updatePositions.bind(this)
  }

  onHover(e) {
    this.setState({ appearance: DEFAULT_APPEARANCE })
  }

  onDrag(e) {
    const { isDragging } = this.state
    if (isDragging) {
      //console.log(e);
      this.updatePositions(e.layerX, e.layerY)
    }
  }

  updatePositions(posX, posY) {
    const { currentPositions } = this.state
    let newPositions = currentPositions
      newPositions.RampTopY = this.clampPosition(posY, 0, currentPositions.RampBottomY)
      newPositions.RampStartX = this.clampPosition(posX, 0, currentPositions.RampEndX)
      this.setState({
        currentPositions: newPositions
      })
      this.props.onInclineChanged(newPositions)
  }

  clampPosition(pos, min, max) {
    return pos <= min ? min : pos >= max ? max : pos;
  }

  onDragStart(e) {
    //console.log("drag start", e.evt.layerY)
    this.setState({
      isDragging: true
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
      appearance: HIDDEN_APPEARANCE
    })
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend', this.onDragEnd);

    event.preventDefault();
    this.updatePositions(e.layerX, e.layerY)
  }


  render() {
    const { appearance, currentPositions } = this.state
    let height = appearance.scale
    let width = appearance.scale
    let radius = appearance.scale / 2
    let center = {x: currentPositions.RampStartX, y: currentPositions.RampTopY }
    return (
      <Circle x={center.x} y={center.y} radius={radius}  fill={appearance.fillColor} stroke={appearance.stroke} strokeWidth={appearance.strokeWidth} onMouseDown={this.onDragStart} onMouseOver={this.onHover} />
    )
  }
}