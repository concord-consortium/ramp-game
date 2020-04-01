import React from 'react'
import { Button } from 'react-toolbox/lib/button'
import MagnetCar from './magnet-car'
import Ground from './ground'
import SimulationBase from './simulation-base'
import config from '../config'
import crashStyles from '../../css/car-crash.less'
import { Layer, Stage } from 'react-konva'
import { crashSimulation } from '../physics'

const leftEdge = -2
const parkedcarX = 4
const carHeightToWidth = 1.2

export default class CarCrash extends SimulationBase {
  constructor (props) {
    super(props)
    this.setState({
      carX: 0
    })
  }

  get crashSite () {
    const { vehicleHeight } = config
    const vehicleWidth = vehicleHeight * carHeightToWidth
    const minDistance = vehicleWidth / this.pixelMeterRatio
    return parkedcarX - minDistance
  }

  rafHandler (timestamp) {
    const { isRunning, carX } = this.state
    if (isRunning) {
      if (this.simulator) {
        const { velocity, nextX } = this.simulator(timestamp)
        if (nextX !== carX) {
          this.setState({ carX: nextX, velocity })
        }
        if (nextX >= this.crashSite) {
          this.setState({ isRunning: false })
        } else {
          window.requestAnimationFrame(this.rafHandler)
        }
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    this.log('SimulationStarted')
    window.requestAnimationFrame(this.rafHandler)
  }

  log (msg) {
    console.log(msg)
  }

  handleCarPosChange (newXScreen, newYScreen) {
    if (!this.draggingActive) {
      return
    }
    let newXWorld = this.invScaleX(newXScreen)
    if (newXWorld < leftEdge) {
      newXWorld = leftEdge
    } else if (newXWorld > this.crashSite) {
      newXWorld = this.crashSite
    }
    this.setState({
      carX: Math.min(newXWorld, this.crashSite)
    })
  }

  startStop = () => {
    if (!this.state.isRunning) {
      this.start()
    } else {
      this.stop()
    }
  }

  start = () => {
    const { carX } = this.state
    this.setState({ isRunning: true })
    this.simulator = crashSimulation(carX, this.crashSite, 2, 1, 0.9)
  }

  stop = () => {
    this.setState({ isRunning: false })
  }

  renderButtons () {
    const { elapsedTime, isRunning } = this.state
    const { setupNewRun, startStop } = this
    const simStarted = elapsedTime > 0
    const simFinished = false
    const startStopButtonLabel = isRunning
      ? 'stop'
      : 'run'
    return (
      <div className={crashStyles.buttons}>
        <Button label={startStopButtonLabel} onClick={startStop.bind(this)} disabled={simFinished} raised primary />
        <Button label='New run' onClick={setupNewRun} disabled={!simStarted} raised primary />
      </div>
    )
  }

  render () {
    const { scaleX, scaleY, elapsedTime, carDragging, velocity } = this.state
    const carX = this.state.carX || 0
    const { vehicleHeight } = config
    return (
      <div
        className={crashStyles.carCrash}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}>
        <div>{elapsedTime}</div>
        { this.renderButtons() }
        <Stage width={this.simWidth} height={this.simHeight}>
          <Layer>
            <Ground sx={scaleX} sy={scaleY} pixelMeterRatio={this.pixelMeterRatio} hideMarks />
            <MagnetCar sx={scaleX} sy={scaleY} x={carX} y={0} angle={0}
              maxHeight={vehicleHeight}
              onUnallowedDrag={this.handleUnallowedCarDrag}
              draggable={this.draggingActive && carDragging}
              onDrag={this.handleCarPosChange}
              onDragStart={this.stop}
              onDragEnd={this.start}
              velocity={velocity}
            />
            <MagnetCar
              id='parkedCar'
              key='parkedCar'
              sx={scaleX}
              sy={scaleY}
              x={parkedcarX} y={0} angle={0}
              maxHeight={vehicleHeight}
              draggable={false}
            />
          </Layer>
        </Stage>
      </div>
    )
  }
}
