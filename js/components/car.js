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
      carVelocity: 0,
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

  onAnimationFrame(time, previousTime) {
    const { carPos, isRunning, startTime, rampAcceleration, carVelocity } = this.state;
    const { simSettings } = this.props
    if (isRunning) {
      let t = startTime
      if (!startTime || startTime === 0) {
        t = time
        this.setState({ startTime: time })
      }
      let p = carPos.x
      let v = carVelocity
      if (p < simSettings.SimWidth - 100) {
        let dt = time - t
        dt /= 1000
        if (p >= simSettings.RampEndX) {
          v = v - 0.01
          p += v * dt
          console.log(v, dt)
        }
        else {
          p += 1 * rampAcceleration * dt * dt;//1//this.calculateVelocity()
          v = p / dt
          console.log(v, dt)
        }
        this.setPositionInWorld(p, v)
      }
      else {
        this.setState({isRunning: false, carVelocity: 0, startTime: 0})
      }
    }
  }

  setPositionInWorld(carX, velocity) {
    const { isRunning } = this.state
    const { simSettings } = this.props
    let newPos = {};
    newPos.x = this.clampPosition(carX, 0, simSettings.SimWidth)
    newPos.y = this.getPositionOnRamp(carX)
    if (velocity) {
      this.setState({ carPos: newPos, carVelocity: velocity })
    }
    else {
      this.setState({ carPos: newPos })
    }
  }

  getPositionOnRamp(carX) {
    const { simSettings } = this.props

    if (carX > simSettings.RampEndX) {
      return simSettings.SimHeight - simSettings.GroundHeight
    }
    else if (carX <= simSettings.RampStartX) {
      return simSettings.RampTopY
    }
    else {
      // car is on the incline
      let rampTop = simSettings.SimHeight - simSettings.RampTopY - simSettings.GroundHeight
      let theta = Math.atan(rampTop / (simSettings.RampEndX - simSettings.RampStartX))
      let y = (carX - simSettings.RampStartX) * Math.tan(theta)
      y = y + simSettings.RampTopY
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
      this.setPositionInWorld(e.layerX, 0)
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