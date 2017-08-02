import React from 'react'
import { Text, Group, Circle } from 'react-konva'

import ReactAnimationFrame from 'react-animation-frame'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'red',
  stroke: 'black',
  strokeWidth: 2
}

class Car extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      carPos: { x: 100, y: 300 },
      simSettings: this.props.simSettings,
      simConstants: this.props.simConstants,
      theta: 0,
      rampAcceleration: 0,
      groundAcceleration: 0,
      isDragging: false,
      carVelocity: 0,
      appearance: DEFAULT_APPEARANCE
    }
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.clampPosition = this.clampPosition.bind(this)
    this.setPositionInWorld = this.setPositionInWorld.bind(this)
    this.updateRampAngles = this.updateRampAngles.bind(this)
  }

  componentDidMount() {
    this.updateRampAngles(this.props.simSettings)
    this.updateSimConstants(this.props.simConstants)
  }

  componentWillReceiveProps(nextProps) {
    this.updateRampAngles(nextProps.simSettings)
    this.updateSimConstants(nextProps.simConstants)
    this.setPositionInWorld(this.state.carPos.x)
    if (nextProps.isRunning != this.props.isRunning) {
      nextProps.isRunning ? this.startSimulation() : this.endSimulation()
    }
  }

  updateRampAngles(newSettings) {
    const { theta, rampAcceleration, carPos, simConstants, simSettings } = this.state

    let newTheta = newSettings.RampAngle
    if (newTheta != theta) {
      let g = simConstants.gravity, m = simConstants.mass, f = simConstants.rampFriction
      let parallelForce = m * g * (Math.sin(newTheta))
      let normalForce = m * g * (Math.cos(newTheta))
      let frictionForce = normalForce * f
      let rampAcceleration = (parallelForce - frictionForce) / m
      if (rampAcceleration < 0) rampAcceleration = 0
      this.setState({
        theta: newTheta,
        rampAcceleration,
        simSettings: newSettings,
        startTime: 0,
        startPos: carPos.x,
        onRamp: carPos.x < simSettings.RampEndX,
        carVelocity: 0,
        isDragging: false
      })
    }
  }

  updateSimConstants(newSimConstants) {
    let groundAcceleration = newSimConstants.gravity * newSimConstants.groundFriction
    this.setState({ simConstants: newSimConstants, groundAcceleration })
  }

  startSimulation() {
    const { carPos, simSettings } = this.state
    this.setState({
      startTime: 0,
      startPos: carPos.x,
      startGroundTime: 0,
      onRamp: carPos.x < simSettings.RampEndX,
      carVelocity: 0,
      startGroundVelocity: 0,
      isDragging: false,
      finalDistance: 0
    })
  }
  endSimulation() {
    const { carPos, simSettings } = this.state
    let d = 0
    if (carPos.x > simSettings.RampEndX) {
      d = (carPos.x - simSettings.RampEndX)/(simSettings.SimWidth - simSettings.RampEndX) * 5
    }

    this.setState({
      startTime: 0,
      startPos: carPos.x,
      onRamp: carPos.x < simSettings.RampEndX,
      carVelocity: 0,
      startGroundVelocity: 0,
      isDragging: false,
      finalDistance: d
    })
  }

  onAnimationFrame(currentTimestamp, previousTimestamp) {
    const { carPos, rampAcceleration, groundAcceleration, carVelocity, simSettings, startTime, startPos, startGroundTime, startGroundVelocity, simConstants, onRamp } = this.state;
    const { isRunning } = this.props

    if (isRunning) {
      let t = startTime
      let sgt = startGroundTime
      let sgv = startGroundVelocity
      let po = startPos
      let slowAcceleration = groundAcceleration

      if (!startTime || startTime === 0) {
        t = currentTimestamp
        sgt = this.calculateTimeToGround(po, simSettings.RampEndX, rampAcceleration) * 1000 + t
        // get initial velocity when reaching the ground
        sgv = this.calculateVelocity(0, rampAcceleration, (sgt-t)/1000)
        this.setState({ startTime: currentTimestamp, startGroundTime: sgt, startGroundVelocity: sgv })
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
          if (onRamp) {
            p = this.calculateAcceleratedPosition(po, 0, et, rampAcceleration)
            v = this.calculateVelocity(0, rampAcceleration, et)
          }
          // car on ground
          else {
            let egt = (currentTimestamp - sgt) / 1000
            let nextP = this.calculateAcceleratedPosition(simSettings.RampEndX, sgv, egt, slowAcceleration)

            if (nextP > simSettings.SimWidth || nextP - p < 0.01) {
              // car x position invalid or car is stopped
              v = 0
              this.endSimulation()
              this.props.onSimulationRunningChange(false)
            } else {
              if (nextP >= p) {
                v = this.calculateVelocity(sgv, slowAcceleration, egt)
                p = nextP
              }
            }
          }
          this.setPositionInWorld(p, v)
        }
        else {
          this.endSimulation()
        }
        this.setState({ fps, onRamp: carPos.x < simSettings.RampEndX })
      }
    }
  }

  calculateAcceleratedPosition(originalPosition, initialVelocity, elapsedTime, acceleration) {
    return (
      originalPosition + (initialVelocity * elapsedTime) + (0.5 * acceleration * elapsedTime * elapsedTime)
    )
  }

  calculateVelocity(initialVelocity, acceleration, elapsedTime) {
    let v = initialVelocity + (acceleration * elapsedTime);
    return v
  }

  calculateTimeToGround(originalPosition, groundPosition, acceleration) {
    let t = Math.sqrt((groundPosition - originalPosition) * 2 / acceleration)
    return t
  }

  setPositionInWorld(carX, velocity) {
    const { simSettings } = this.state
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
      if (y > simSettings.SimHeight - simSettings.GroundHeight) {
        y = simSettings.SimHeight - simSettings.GroundHeight
      }
    }
    return y
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
    const { appearance, hasClicked, carPos, fps, carVelocity, finalDistance } = this.state
    let height = 20
    let width = 20
    let center = carPos
    let fpsText = fps ? 'fps: ' + fps : ""
    let velText = 'vel: ' + Math.round(carVelocity)
    let xText = 'xPos: ' + Math.round(carPos.x)
    let finalDistanceText = finalDistance && finalDistance !== 0 ? "Final distance: " + finalDistance.toFixed(2) : ""

    return (
      <Group>
        <Text x={10} y={10} fontFamily={'Arial'} fontSize={12} text={fpsText} />
        <Text x={10} y={25} fontFamily={'Arial'} fontSize={12} text={velText} />
        <Text x={10} y={40} fontFamily={'Arial'} fontSize={12} text={finalDistanceText} />
        <Circle x={center.x} y={center.y} width={width} height={height} fill={appearance.fillColor} stroke={appearance.stroke} strokeWidth={appearance.strokeWidth} onMouseDown={this.onDragStart} />
      </Group>
    )
  }
}
// lock the refresh to a max of 60fps
module.exports = ReactAnimationFrame(Car, 10)