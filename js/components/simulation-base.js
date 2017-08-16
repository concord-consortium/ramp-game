import React, { PureComponent } from 'react'
import Ramp from './ramp'
import Ground from './ground'
import InclineControl from './incline-control'
import Controls from './controls'
import c from '../sim-constants'
import VehicleImage from './vehicle-image'
import { calcOutputs, calcRampLength, calcRampAngle } from '../physics'
import CodapHandler from '../codap-handler'

import { Layer, Stage } from 'react-konva'

// MKS units are used everywhere: meters, kilograms and seconds.
const MIN_X = -1.55
const MIN_Y = -0.5
const MAX_X = 5.05
const MAX_Y = 3

const DEFAULT_OPTIONS = {
  gravity: 9.81,
  mass: 0.05,
  rampFriction: 0.3,
  groundFriction: 0.3,
  rampTopX: -1,
  rampTopY: 1,
  initialCarX: -0.5
}

function getScaleX (pixelMeterRatio) {
  return function scaleX (worldX) {
    return (worldX - MIN_X) * pixelMeterRatio
  }
}

function getScaleY (pixelMeterRatio) {
  return function scaleY (worldY) {
    return (MAX_Y - worldY) * pixelMeterRatio
  }
}

export default class SimulationBase extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isRunning: false,
      gravity: DEFAULT_OPTIONS.gravity,
      mass: DEFAULT_OPTIONS.mass,
      rampFriction: DEFAULT_OPTIONS.rampFriction,
      groundFriction: DEFAULT_OPTIONS.groundFriction,
      rampTopX: DEFAULT_OPTIONS.rampTopX,
      rampTopY: DEFAULT_OPTIONS.rampTopY,
      initialCarX: DEFAULT_OPTIONS.initialCarX,
      elapsedTime: 0,
      scaleX: getScaleX(this.pixelMeterRatio),
      scaleY: getScaleY(this.pixelMeterRatio),
      codapPresent: false
    }

    this.outputs = calcOutputs(this.state)

    this.codapHandler = new CodapHandler()

    this.reset = this.reset.bind(this)
    this.handleOptionsChange = this.handleOptionsChange.bind(this)
    this.handleInclineChange = this.handleInclineChange.bind(this)
    this.handleCarPosChange = this.handleCarPosChange.bind(this)
    this.sendDataToCodap = this.sendDataToCodap.bind(this)
    this.rafHandler = this.rafHandler.bind(this)
  }

  componentDidMount () {
    this.codapHandler.init()
      .then(_ => {
        this.setState({ codapPresent: true })
      })
      .catch(msg => {
        console.log('CODAP not available')
      })
  }

  componentWillUpdate (nextProps, nextState) {
    this.outputs = calcOutputs(nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    const { isRunning } = this.state
    const { width, height } = this.props
    if (isRunning && !prevState.isRunning) {
      if (isNaN(this.outputs.totalTime)) {
        window.alert("Ramp friction is too big, car won't start moving")
        this.setState({
          isRunning: false
        })
      } else {
        window.requestAnimationFrame(this.rafHandler)
      }
    }
    if (width !== prevProps.width || height !== prevProps.height) {
      this.setState({
        scaleX: getScaleX(this.pixelMeterRatio),
        scaleY: getScaleY(this.pixelMeterRatio)
      })
    }
  }

  get draggingActive () {
    const { elapsedTime } = this.state
    return elapsedTime === 0
  }

  get simWidth () {
    return this.props.width
  }

  get simHeight () {
    return this.props.height
  }

  get pixelMeterRatio () {
    const xScale = this.simWidth / (MAX_X - MIN_X)
    const yScale = this.simHeight / (MAX_Y - MIN_Y)
    return Math.min(xScale, yScale)
  }

  invScaleX (screenX) {
    return screenX / this.pixelMeterRatio + MIN_X
  }

  invScaleY (screenY) {
    return MAX_Y - screenY / this.pixelMeterRatio
  }

  reset () {
    const newState = {
      isRunning: false,
      elapsedTime: 0
    }
    Object.assign(newState, DEFAULT_OPTIONS)
    this.setState(newState)
  }

  handleOptionsChange (newOptions) {
    this.setState(newOptions)
  }

  rafHandler (timestamp) {
    const { elapsedTime, isRunning } = this.state
    if (isRunning) {
      window.requestAnimationFrame(this.rafHandler)
    } else {
      this._prevTime = null
      return
    }
    if (!this._prevTime) {
      this._prevTime = timestamp
      return
    }
    const dt = timestamp - this._prevTime
    this._prevTime = timestamp
    const newElapsedTime = Math.min(this.outputs.totalTime, elapsedTime + dt / 1000)
    this.setState({
      elapsedTime: newElapsedTime,
      isRunning: newElapsedTime < this.outputs.totalTime
    })
  }

  handleInclineChange (newXScreen, newYScreen) {
    if (!this.draggingActive) {
      return
    }
    let newXWorld = this.invScaleX(newXScreen)
    let newYWorld = this.invScaleY(newYScreen)
    if (newXWorld < c.rampStartX) {
      newXWorld = c.rampStartX
    } else if (newXWorld > c.rampEndX - 1e-4) {
      // 1e-4 so angle is never 90 deg and we don't need to handle it in a special way.
      newXWorld = c.rampEndX - 1e-4
    }
    if (newYWorld < c.rampBottomY + 0.2) {
      newYWorld = c.rampBottomY + 0.2
    } else if (newYWorld > MAX_Y - 0.2) {
      newYWorld = MAX_Y - 0.2
    }

    const newCarRampDist = Math.min(this.outputs.startDistanceUpRamp, calcRampLength(newXWorld, newYWorld))
    this.setState({
      rampTopX: newXWorld,
      rampTopY: newYWorld,
      initialCarX: c.rampEndX - newCarRampDist * Math.cos(calcRampAngle(newXWorld, newYWorld))
    })
  }

  handleCarPosChange (newXScreen, newYScreen) {
    const { rampTopX, rampTopY } = this.state
    if (!this.draggingActive) {
      return
    }
    let newXWorld = this.invScaleX(newXScreen)
    let newYWorld = this.invScaleY(newYScreen)
    const rampAngle = this.outputs.rampAngle
    if (rampAngle < Math.PI * 0.33) {
      // control via X
      if (newXWorld < rampTopX) {
        newXWorld = rampTopX
      } else if (newXWorld > c.rampEndX) {
        newXWorld = c.rampEndX
      }
    } else {
      // control via Y
      if (newYWorld < c.rampBottomY) {
        newYWorld = c.rampBottomY
      } else if (newYWorld > rampTopY) {
        newYWorld = rampTopY
      }
      newXWorld = c.rampEndX - (newYWorld - c.rampBottomY) / Math.tan(rampAngle)
    }
    this.setState({
      initialCarX: Math.min(newXWorld, c.rampEndX - 1e-6)
    })
  }

  sendDataToCodap () {
    this.codapHandler.generateAndSendData(this.state)
  }

  render () {
    const { rampTopX, rampTopY, scaleX, scaleY, codapPresent } = this.state
    const { simulationFinished, startDistanceUpRamp, finalDistance, carX, carY, rampAngle, carAngle } = this.outputs
    return (
      <div>
        <Controls
          options={this.state} setOptions={this.handleOptionsChange}
          reset={this.reset}
          saveData={codapPresent ? this.sendDataToCodap : false}
          simFinished={simulationFinished}
          carRampDist={startDistanceUpRamp}
          finalDist={finalDistance}
        />
        <Stage width={this.simWidth} height={this.simHeight}>
          <Layer>
            <Ramp sx={scaleX} sy={scaleY} pointX={rampTopX} pointY={rampTopY} angle={rampAngle} />
            <Ground sx={scaleX} sy={scaleY} pixelMeterRatio={this.pixelMeterRatio} />
            <InclineControl x={scaleX(rampTopX)} y={scaleY(rampTopY)}
              draggable={this.draggingActive} onDrag={this.handleInclineChange} />
            <VehicleImage sx={scaleX} sy={scaleY} x={carX} y={carY} angle={carAngle}
              draggable={this.draggingActive} onDrag={this.handleCarPosChange} />
          </Layer>
        </Stage>
      </div>
    )
  }
}
