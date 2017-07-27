import React from 'react'
import { Circle } from 'react-konva'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'red',
  stroke: 'black',
  strokeWidth: 2
}

export default class Car extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      carPos: { x: 100, y: 300 },
      isDragging: false,
      appearance: DEFAULT_APPEARANCE
    }
    this.onClick = this.onClick.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.clampPosition = this.clampPosition.bind(this)
    this.getPositionOnRamp = this.getPositionOnRamp.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.calculatePosition(this.state.carPos.x)
  }
  calculatePosition(carX) {
    const { currentPositions } = this.props
    let newPos = {};
    newPos.x = this.clampPosition(carX, 0, currentPositions.SimWidth)
    newPos.y = this.getPositionOnRamp(carX)
    this.setState({carPos: newPos})
  }

  getPositionOnRamp(carX) {
    const { currentPositions } = this.props

    let relativeHeight = currentPositions.SimHeight - currentPositions.GroundHeight

    if (carX > currentPositions.RampEndX) return currentPositions.SimHeight - currentPositions.GroundHeight
    else if (carX <= currentPositions.RampStartX) return currentPositions.RampTopY
    else {
      // car is on the incline
      let rampTop = currentPositions.SimHeight - currentPositions.RampTopY - currentPositions.GroundHeight
      let theta = Math.atan(rampTop / (currentPositions.RampEndX - currentPositions.RampStartX))
      let y = (carX - currentPositions.RampStartX) * Math.tan(theta)
      y =  y + currentPositions.RampTopY
      return y
    }
  }

  onClick(e) {
    console.log(e.evt)
  }

  clampPosition(pos, min, max) {
    return pos <= min ? min : pos >= max ? max : pos
  }

  onDrag(e) {
    const { isDragging } = this.state
    if (isDragging) {
      this.calculatePosition(e.layerX)
    }
  }
  onDragStart(e) {
    this.setState({
      isDragging: true
    })

    document.addEventListener('mousemove', this.onDrag)
    document.addEventListener('mouseup', this.onDragEnd)
    document.addEventListener('touchmove', this.onDrag)
    document.addEventListener('touchend', this.onDragEnd)

    event.preventDefault();
  }

  onDragEnd(e) {
    this.setState({
      isDragging: false
    })
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.onDragEnd)
    document.removeEventListener('touchmove', this.onDrag)
    document.removeEventListener('touchend', this.onDragEnd)

    event.preventDefault();
  }


  render() {
    const { appearance, hasClicked, carPos } = this.state
    let height = 20
    let width = 20
    let center = carPos
    return (
      <Circle x={center.x} y={center.y} width={width} height={height} fill={appearance.fillColor} stroke={appearance.stroke} strokeWidth={appearance.strokeWidth} onClick={this.onClick} onMouseDown={this.onDragStart} />
    )
  }
}