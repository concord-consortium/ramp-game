import React from 'react'
import { Button } from 'react-toolbox/lib/button'
import MagnetCar from './magnet-car'
import Ground from './ground'
import SimulationBase from './simulation-base'
import config from '../config'
import crashStyles from '../../css/car-crash.less'
import { Layer, Stage } from 'react-konva'
import { crashSimulation } from '../physics'

const parkedcarX = 2
const minDistance = 0.9
const crashSite = parkedcarX - minDistance

export default class CarCrash extends SimulationBase {
  constructor (props) {
    super(props)
    this.setState({
      carX: 0
    })
  }

  rafHandler (timestamp) {
    const { isRunning, carX } = this.state
    if (isRunning) {
      if (this.simulator) {
        const nextX = this.simulator(timestamp)
        if (nextX !== carX) {
          this.setState({ carX: nextX })
        }
        if (nextX >= crashSite) {
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
    const leftEdge = -2
    if (!this.draggingActive) {
      return
    }
    let newXWorld = this.invScaleX(newXScreen)
    if (newXWorld < leftEdge) {
      newXWorld = leftEdge
    } else if (newXWorld > crashSite) {
      newXWorld = crashSite
    }
    this.setState({
      carX: Math.min(newXWorld, crashSite)
    })
  }

  startStop = () => {
    const running = !this.state.isRunning
    const { carX } = this.state
    this.setState({ isRunning: running })
    if (running) {
      this.simulator = crashSimulation(carX, crashSite, 0.1, 2)
    }
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
    const { scaleX, scaleY, elapsedTime, carX, carDragging } = this.state
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
              onDrag={this.handleCarPosChange} />
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
