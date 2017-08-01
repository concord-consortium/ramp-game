import React from 'react'
import { Text, Group, Circle } from 'react-konva'

import ReactAnimationFrame from 'react-animation-frame'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'red',
  stroke: 'black',
  strokeWidth: 2
}

const DEFAULT_SIMULATION = {
  gravity: 9.81,
  mass: 10,
  rampFriction: 0.01,
  groundFriction: -1
}

const RESET = {
  isRunning: false,
  rampAcceleration: 0,
  startTime: 0,
  startGroundTime: 0,
  carVelocity: 0
}

class Car extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      carPos: { x: 100, y: 300 },
      simSettings: this.props.simSettings,
      theta: 0,
      rampAcceleration: 0,
      groundAcceleration: DEFAULT_SIMULATION.gravity * DEFAULT_SIMULATION.groundFriction,
      isDragging: false,
      isRunning: false,
      carVelocity: 0,
      appearance: DEFAULT_APPEARANCE,
      simConstants: DEFAULT_SIMULATION
    }
    this.onClick = this.onClick.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.clampPosition = this.clampPosition.bind(this)
    this.setPositionInWorld = this.setPositionInWorld.bind(this)
    this.updateRampAngles = this.updateRampAngles.bind(this)
  }

  componentDidMount() {
    this.updateRampAngles(this.props.simSettings)
  }

  componentWillReceiveProps(nextProps) {
    this.updateRampAngles(nextProps.simSettings)
    this.setPositionInWorld(this.state.carPos.x)
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
        isRunning: false,
        startTime: 0,
        startPos: carPos.x,
        onRamp: carPos.x < simSettings.RampEndX,
        carVelocity: 0,
        isDragging: false
      })
    }
  }

  updateSimConstants(newValues) {
    this.setState({ simConstants: newValues })
  }

  startSimulation() {
    const { carPos, simSettings } = this.state
    this.setState({
      isRunning: true,
      startTime: 0,
      startPos: carPos.x,
      startGroundTime: 0,
      onRamp: carPos.x < simSettings.RampEndX,
      carVelocity: 0,
      startGroundVelocity: 0,
      isDragging: false
    })
  }
  endSimulation() {
    const { carPos, simSettings } = this.state
    console.log(this.state)
    this.setState({
      isRunning: false,
      startTime: 0,
      startPos: carPos.x,
      onRamp: carPos.x < simSettings.RampEndX,
      carVelocity: 0,
      startGroundVelocity: 0,
      isDragging: false
    })
  }

  onAnimationFrame(currentTimestamp, previousTimestamp) {
    const { carPos, isRunning, rampAcceleration, groundAcceleration, carVelocity, simSettings, startTime, startPos, startGroundTime, startGroundVelocity, simConstants, onRamp } = this.state;

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
              console.log("car x position invalid or car is stopped", nextP)
              this.endSimulation()
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
    const { isRunning, simSettings } = this.state
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

  onClick(e) {
    this.startSimulation()
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
// lock the refresh to a max of 60fps
module.exports = ReactAnimationFrame(Car, 10)