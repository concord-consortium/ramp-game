import React from 'react'
import { Text, Group, Circle } from 'react-konva'

import ReactAnimationFrame from 'react-animation-frame'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'red',
  stroke: 'black',
  strokeWidth: 2
}
const gravity = 9.81
const mass = 10
const friction = 0.9


class Car extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      carPos: { x: 100, y: 300 },
      simSettings: this.props.simSettings,
      theta: 0,
      rampAcceleration: 0,
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
    this.updateRampAngles = this.updateRampAngles.bind(this)

    //this.updateRampAngles(this.props.simSettings)
  }
  componentDidMount() {
    this.updateRampAngles(this.props.simSettings)
  }
  componentWillReceiveProps(nextProps) {
    this.updateRampAngles(nextProps.simSettings)
    this.setPositionInWorld(this.state.carPos.x)
  }

  updateRampAngles(newSettings) {
    const { theta, rampAcceleration } = this.state

    let newTheta = newSettings.RampAngle
    if (newTheta != theta) {
      let g = gravity, m = mass, f = friction
      let parallelForce = m * g * (Math.sin(newTheta))
      let normalForce = m * g * (Math.cos(newTheta))
      let frictionForce = normalForce * f
      let rampAcceleration = (parallelForce - frictionForce) / m
      if (rampAcceleration < 0) rampAcceleration = 0
      this.setState({ theta: newTheta, rampAcceleration, simSettings: newSettings })
    }
  }

  onAnimationFrame(currentTimestamp, previousTimestamp) {
    const { carPos, isRunning, rampAcceleration, carVelocity, simSettings, startTime, startPos, startGroundTime } = this.state;

    if (isRunning) {
      let t = startTime
      let po = startPos
      let slowAcceleration = -10

      if (!startTime || startTime === 0) {
        t = currentTimestamp
        po = carPos.x;
        this.setState({ startTime: currentTimestamp, startPos: po })
      }
      else {

        // calculate time since last animation frame - we lock the simulation to a max of 60fps
        let deltaTime = currentTimestamp - previousTimestamp
        let elapsedTime = currentTimestamp - startTime
        // dt and et will be in ms, convert to seconds
        let dt = deltaTime / 1000
        let et = elapsedTime / 1000
        let fps = Math.round(1 / dt)

        let p = carPos.x
        let v = carVelocity

        if (p < simSettings.SimWidth) {

          // car on ramp
          if (p < simSettings.RampEndX) {
            p = this.calculateAcceleratedPosition(po, v, et, rampAcceleration)
            v = (p - carPos.x) / dt
          }
          // car on ground
          else {
            let egt, sgt = 0
            if (!startGroundTime || startGroundTime === 0) {
              sgt = previousTimestamp
              this.setState({ startGroundTime: currentTimestamp })
            } else {
              sgt = startGroundTime
            }
            egt = (currentTimestamp - sgt) / 1000

            let nextP = this.calculateAcceleratedPosition(simSettings.RampEndX, v, egt, slowAcceleration)

            if (nextP > simSettings.SimWidth || nextP - p < 0.1) {
              this.setState({ isRunning: false, carVelocity: 0 })
            } else {
              if (nextP >= p) {
                v = (nextP - carPos.x) / dt
                p = nextP
              }
            }
          }
          //console.log(v)
          this.setPositionInWorld(p, v)
        }
        else {
          this.setState({ isRunning: false, carVelocity: 0 })
        }
        this.setState({ fps })
      }
    }
  }

  calculateAcceleratedPosition(originalPosition, currentVelocity, elapsedTime, acceleration) {
    return (
      originalPosition + (currentVelocity * elapsedTime) + (0.5 * acceleration * elapsedTime * elapsedTime)
    )
  }

  setPositionInWorld(carX, velocity) {
    const { isRunning, simSettings } = this.state
    //const { simSettings } = this.props
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
    const { simSettings, theta} = this.state
    //  calculate position
    let y = 0

    if (carX > simSettings.RampEndX) {
      y = simSettings.SimHeight - simSettings.GroundHeight
    }
    else if (carX <= simSettings.RampStartX) {
      y = simSettings.RampTopY
    }
    else {
      // car is on the incline
      y = (carX - simSettings.RampStartX) * Math.tan(theta)
      y = y + simSettings.RampTopY

    }
    return y
  }

  onClick(e) {
    this.setState({ isRunning: true, startGroundTime: 0, startTime: 0 })
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
    const { appearance, hasClicked, carPos, fps, carVelocity } = this.state
    let height = 20
    let width = 20
    let center = carPos
    let fpsText = 'fps: ' + fps
    let velText = 'vel: ' + Math.round(carVelocity)
    let xText = 'xPos: ' + Math.round(carPos.x)

    return (
      <Group>
        <Text x={10} y={10} fontFamily={'Arial'} fontSize={12} text={fpsText} />
        <Text x={10} y={25} fontFamily={'Arial'} fontSize={12} text={velText} />
        <Text x={10} y={40} fontFamily={'Arial'} fontSize={12} text={xText} />
        <Circle x={center.x} y={center.y} width={width} height={height} fill={appearance.fillColor} stroke={appearance.stroke} strokeWidth={appearance.strokeWidth} onClick={this.onClick} onMouseDown={this.onDragStart} />
      </Group>
    )
  }
}

module.exports = ReactAnimationFrame(Car, 10)