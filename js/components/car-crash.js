import React from 'react'
import { Dialog } from 'react-toolbox/lib/dialog'
import MagnetCar, { FACING_LEFT, FACING_RIGHT } from './magnet-car'
import { Instructions } from './car-crash-instructions'
import Ground from './ground'
import SimulationBase from './simulation-base'
import config from '../config'
import crashStyles from '../../css/car-crash.less'
import { Layer, Stage } from 'react-konva'
import { crashSimulation } from '../physics'

const leftEdge = -2
const parkedcarX = 4
const carHeightToWidth = 1.2
const CRUSH_FORCE = 100

export default class CarCrash extends SimulationBase {
  get crashSite () {
    const { vehicleHeight } = config
    const vehicleWidth = vehicleHeight * carHeightToWidth
    const minDistance = (vehicleWidth * 1.35) / this.pixelMeterRatio
    return parkedcarX - minDistance
  }

  rafHandler (timestamp) {
    const { isRunning, carX } = this.state
    if (isRunning) {
      if (this.simulator) {
        const { force, nextX } = this.simulator(timestamp)
        if (nextX !== carX) {
          this.setState({ carX: nextX })
        }
        if (nextX >= this.crashSite) {
          this.setState({ isRunning: false })
          if (force > CRUSH_FORCE) {
            this.setState({ crashed: true })
          }
        } else {
          window.requestAnimationFrame(this.rafHandler)
        }
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
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
      carX: Math.min(newXWorld, this.crashSite),
      crashed: false
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
    const { timeScale, mCarMass, mCarCharge } = config
    this.setState({ isRunning: true, crashed: false })
    this.simulator = crashSimulation(carX, this.crashSite, timeScale, mCarMass, mCarCharge)
  }

  stop = () => {
    this.setState({ isRunning: false })
  }

  hideDialog = () => {
    this.setState({ hideDialog: true })
  }

  showDialog = () => {
    const { hideDialog } = this.state
    const actions = [
      { label: 'OK', onClick: this.hideDialog }
    ]
    if (!hideDialog) {
      return (
        <Dialog
          actions={actions}
          active={!hideDialog}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          title='Instructions'
          className={crashStyles.wideDialog}
        >
          <Instructions />
        </Dialog>
      )
    }
    return null
  }

  render () {
    const { scaleX, scaleY, carDragging, crashed, velocity } = this.state
    const carX = this.state.carX || this.crashSite
    const { vehicleHeight } = config
    return (
      <div
        className={crashStyles.carCrash}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}>
        { this.showDialog() }
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
              crashed={crashed}
              mobile
              direction={FACING_RIGHT}
            />
            <MagnetCar
              id='parkedCar'
              key='parkedCar'
              sx={scaleX}
              sy={scaleY}
              x={parkedcarX} y={0} angle={0}
              maxHeight={vehicleHeight}
              draggable={false}
              crashed={crashed}
              direction={FACING_LEFT}
            />
          </Layer>
        </Stage>
      </div>
    )
  }
}
