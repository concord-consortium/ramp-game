import React from 'react'
import { Text, Group, Circle, Line, Rect } from 'react-konva'
import VehicleImage from './vehicle-image'
import {
  calculateRampAngle,
  calculateAcceleratedPosition,
  calculateVelocity,
  calculateTimeToGround,
  calculateRampAcceleration,
  calculateGroundAcceleration,
  calculateDistanceUpRampInWorldUnits,
  calculateDistanceInWorldUnits
} from '../utils'

import ReactAnimationFrame from 'react-animation-frame'
import CodapHandler from './codap-handler'

const DEFAULT_APPEARANCE = {
  scale: 20,
  fillColor: 'red',
  stroke: 'red',
  strokeWidth: 1
}
const TIMESCALE = 200
const MINFRAMEINTERVAL = 10 // 10ms == 60fps

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
      carVelocity: 0,
      appearance: DEFAULT_APPEARANCE
    }
    this.clampPosition = this.clampPosition.bind(this)
    this.setPositionInWorld = this.setPositionInWorld.bind(this)
    this.updateRampAngles = this.updateRampAngles.bind(this)
  }

  componentDidMount() {
    CodapHandler.setup()
    this.updateRampAngles(this.props.simSettings)
    this.updateSimConstants(this.props.simConstants)
  }

  componentWillReceiveProps(nextProps) {
    this.updateRampAngles(nextProps.simSettings)
    this.updateSimConstants(nextProps.simConstants)
    this.setPositionInWorld(this.state.carPos.x)
    if (nextProps.isRunning != this.props.isRunning) {
      nextProps.isRunning ? this.startSimulation() : this.endSimulation(0)
    }
  }

  updateRampAngles(newSettings) {
    const { theta, rampAcceleration, carPos, simConstants, simSettings } = this.state

    let newTheta = newSettings.RampAngle
    if (newTheta != theta) {
      let rampAcceleration = calculateRampAcceleration(simConstants, newTheta)

      this.setState({
        theta: newTheta,
        rampAcceleration,
        simSettings: newSettings,
        startTime: 0,
        startPos: carPos.x,
        onRamp: carPos.x < simSettings.RampEndX,
        carVelocity: 0
      })
    }
  }

  updateSimConstants(newSimConstants) {
    let groundAcceleration = calculateGroundAcceleration(newSimConstants)
    this.setState({ simConstants: newSimConstants, groundAcceleration })
  }

  startSimulation() {
    const { carPos, simSettings } = this.state
    this.setState({
      startTime: 0,
      startPos: carPos.x,
      startHeightAboveGround: calculateDistanceInWorldUnits(simSettings, carPos.y, simSettings.SimHeight - simSettings.GroundHeight),
      startDistanceUpRamp: carPos.rampDistance,
      startGroundTime: 0,
      onRamp: carPos.x < simSettings.RampEndX,
      carVelocity: 0,
      startGroundVelocity: 0,
      finalDistance: 0,
      currentRun: []
    })
  }
  endSimulation(endTimestamp) {
    const { carPos, simSettings, currentRun } = this.state
    if (endTimestamp > 0) {
      let d = 0
      if (carPos.x > simSettings.RampEndX) {
        d = (carPos.x - simSettings.RampEndX)/(simSettings.SimWidth - simSettings.RampEndX) * 5
      }
      let finalData = Object.assign({}, this.state)
      finalData.finalDistance = d
      finalData.timeToGround = (finalData.startGroundTime - finalData.startTime) / 1000
      finalData.totalTime = (endTimestamp - finalData.startTime) / 1000
      if (currentRun && currentRun.length > 0) {
        CodapHandler.sendItems(finalData)
      }

      this.setState({
        startTime: 0,
        carVelocity: 0,
        startGroundVelocity: 0,
        finalDistance: d,
        currentRun: []
      })
    }
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
        sgt = calculateTimeToGround(po, simSettings.RampEndX, rampAcceleration, simSettings.Scale) * TIMESCALE + t
        // get initial velocity when reaching the ground
        sgv = calculateVelocity(0, rampAcceleration, (sgt-t)/TIMESCALE)
        this.setState({ startTime: currentTimestamp, startGroundTime: sgt, startGroundVelocity: sgv })
      }
      else {
        // calculate time since last animation frame - we lock the simulation to a max of 60fps
        let deltaTime = currentTimestamp - previousTimestamp
        let elapsedTime = currentTimestamp - startTime
        // dt in ms, convert to seconds
        let dt = deltaTime / 1000
        let et = elapsedTime / TIMESCALE // scale simulation speed
        let fps = Math.round(1 / dt)

        let p = carPos.x
        let v = carVelocity

        if (p < simSettings.SimWidth) {

          // car on ramp
          if (onRamp) {
            p = calculateAcceleratedPosition(po, 0, et, rampAcceleration, simSettings.Scale)
            v = calculateVelocity(0, rampAcceleration, et)
          }
          // car on ground
          else {
            let egt = (currentTimestamp - sgt) / TIMESCALE
            let nextP = calculateAcceleratedPosition(simSettings.RampEndX, sgv, egt, slowAcceleration, simSettings.Scale)

            if (nextP > simSettings.SimWidth || nextP - p < 0.01) {
              // car x position invalid or car is stopped
              v = 0
              this.endSimulation(currentTimestamp)
              this.props.onSimulationRunningChange(false)
            } else {
              if (nextP >= p) {
                v = calculateVelocity(sgv, slowAcceleration, egt)
                p = nextP
              }
            }
          }
          this.setPositionInWorld(p, v)
          this.trackDistance(p, v, et)
        }
        else {
          this.endSimulation(currentTimestamp)
        }
        this.setState({ fps, onRamp: carPos.x < simSettings.RampEndX })
      }
    }
  }

  trackDistance(p, velocity, t) {
    const { currentRun, carPos, startPos, simSettings } = this.state
    const { isRunning } = this.props
    if (isRunning) {
      let runData = currentRun
      if (!runData) {
        runData = []
      }
      t = t * TIMESCALE / 1000
      if (runData.length > 1) {
        let lastPoint = runData[runData.length - 1]
        if (t - lastPoint.Timestamp > 0.05) {
          let point = {
            x: calculateDistanceInWorldUnits(simSettings, startPos, carPos.x),
            y: calculateDistanceInWorldUnits(simSettings, carPos.y, simSettings.SimHeight - simSettings.GroundHeight),
            Timestamp: t,
            Velocity: velocity
          }
          runData.push(point)
          this.setState({ currentRun: runData })
        }
      } else {
        let point = {
            x: calculateDistanceInWorldUnits(simSettings, startPos, carPos.x),
            y: calculateDistanceInWorldUnits(simSettings, carPos.y, simSettings.SimHeight - simSettings.GroundHeight),
            Timestamp: t,
            Velocity: velocity
          }
        runData.push(point)
        this.setState({ currentRun: runData })
      }
    }
  }
  setPositionInWorld(carX, velocity) {
    const { simSettings } = this.state

    let newPos = {};
    newPos.x = this.clampPosition(carX, simSettings.RampStartX, simSettings.SimWidth)
    newPos.y = this.getPositionOnRamp(carX)
    newPos.rampDistance = calculateDistanceUpRampInWorldUnits(simSettings, newPos.x, newPos.y)

    if (velocity) {
      this.setState({ carPos: newPos, carVelocity: velocity })
    }
    else {
      this.setState({ carPos: newPos, onRamp: newPos.x < simSettings.RampEndX })
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

  generateNormalLine(x, y, lineLength) {
    const { simSettings, onRamp } = this.state
    let endPointX = onRamp ? x + (lineLength * Math.sin(simSettings.RampAngle)) : x
    let endPointY = onRamp ? y - (lineLength * Math.cos(simSettings.RampAngle)) : y - lineLength
    let points = [ x, y, endPointX, endPointY]
    return points
  }

  render() {
    const { appearance, hasClicked, carPos, fps, carVelocity, finalDistance, onRamp, simSettings } = this.state
    let height = 15
    let width = 45
    let lineLength = 22
    let center = carPos
    let fpsText = fps ? 'fps: ' + fps : ""
    let velText = 'vel: ' + Math.round(carVelocity)
    let xText = 'xPos: ' + Math.round(carPos.x)
    let finalDistanceText = finalDistance && finalDistance !== 0 ? "Final distance: " + finalDistance.toFixed(2) : ""
    let angle = onRamp ? simSettings.RampAngle * 180 / Math.PI : 0
    let rampDistanceText = carPos.rampDistance > 0 ? "Car ramp distance: " + carPos.rampDistance.toFixed(2) : ""

    let normalLinePoints = this.generateNormalLine(center.x, center.y, lineLength)

    return (
      <Group>
        <Text x={10} y={20} fontFamily={'Arial'} fontSize={12} text={fpsText} />
        <Text x={10} y={35} fontFamily={'Arial'} fontSize={12} text={velText} />
        <Text x={10} y={50} fontFamily={'Arial'} fontSize={12} text={finalDistanceText} />
        <Text x={10} y={65} fontFamily={'Arial'} fontSize={12} text={rampDistanceText} />
        <Circle x={center.x} y={center.y}
          radius={width/10}
           fill={appearance.fillColor}
        />
        <Line points={normalLinePoints} stroke={'red'} strokeWidth={2} />
        <VehicleImage x={center.x} y={center.y} width={width} height={height} angle={angle} onRamp={onRamp} setPositionInWorld={this.setPositionInWorld} />
      </Group>
    )
  }
}
// lock the refresh to a max of 60fps
module.exports = ReactAnimationFrame(Car, 10)