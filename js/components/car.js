import React from 'react'
import { Circle } from 'react-konva'

import ReactAnimationFrame from 'react-animation-frame'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'red',
  stroke: 'black',
  strokeWidth: 2
}
const g = 9.81
const m = 1


class Car extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      carPos: { x: 100, y: 300 },
      isDragging: false,
      isRunning: false,
      appearance: DEFAULT_APPEARANCE
    }
    this.onClick = this.onClick.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.clampPosition = this.clampPosition.bind(this)
    this.setPositionInWorld = this.setPositionInWorld.bind(this)
    this.getPositionOnRamp = this.getPositionOnRamp.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setPositionInWorld(this.state.carPos.x)
  }

  onAnimationFrame(time) {
    const { carPos, isRunning, startTime, rampAcceleration } = this.state;
    const { currentPositions } = this.props
    if (isRunning) {
      let t = startTime
      if (!startTime || startTime === 0) {
        t = time
        this.setState({ startTime: time })
      }
      let p = carPos.x
      if (p < currentPositions.SimWidth - 100) {
        let a = carPos.x >= currentPositions.RampEndX ? 0 : rampAcceleration
        let dt = time - t
        console.log(time, dt, t)
        dt /= 1000
        p += 1 * a * dt * dt;//1//this.calculateVelocity()
        this.setPositionInWorld(p)
      }
      else {
        this.setState({isRunning: false, startTime: 0})
      }
    }
  }

  setPositionInWorld(carX) {
    const { isRunning } = this.state
    const { currentPositions } = this.props
    let newPos = {};
    newPos.x = this.clampPosition(carX, 0, currentPositions.SimWidth)
    newPos.y = this.getPositionOnRamp(carX)
    this.setState({ carPos: newPos })
  }

  getPositionOnRamp(carX) {
    const { currentPositions } = this.props

    if (carX > currentPositions.RampEndX) {
      return currentPositions.SimHeight - currentPositions.GroundHeight
    }
    else if (carX <= currentPositions.RampStartX) {
      return currentPositions.RampTopY
    }
    else {
      // car is on the incline
      let rampTop = currentPositions.SimHeight - currentPositions.RampTopY - currentPositions.GroundHeight
      let theta = Math.atan(rampTop / (currentPositions.RampEndX - currentPositions.RampStartX))
      let y = (carX - currentPositions.RampStartX) * Math.tan(theta)
      y = y + currentPositions.RampTopY
      if (theta != this.state.theta) {
        let rampAcceleration = m * g * Math.sin(theta*180/Math.PI)
        this.setState({ theta, rampAcceleration })
      }
      return y
    }
  }

  onClick(e) {
    this.setState({ isRunning: true })
  }

  clampPosition(pos, min, max) {
    return pos <= min ? min : pos >= max ? max : pos
  }

  onDrag(e) {
    const { isDragging } = this.state
    if (isDragging) {
      this.setPositionInWorld(e.layerX)
    }
  }

  onDragStart(e) {
    this.setState({
      isDragging: true,
      isRunning: false,
      startTime: 0
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

module.exports = ReactAnimationFrame(Car)