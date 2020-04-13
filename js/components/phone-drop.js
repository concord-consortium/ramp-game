import React from 'react'
import { Dialog } from 'react-toolbox/lib/dialog'
import Phone from './phone'
import { Instructions } from './phone-drop-instructions'
import Ground from './ground'
import SimulationBase from './simulation-base'
import config from '../config'
import { Layer, Stage } from 'react-konva'
import { dropSimulation } from '../physics'
import { minX, maxX } from '../sim-constants'

//
const DROP_CENTER_X = (maxX - minX) / 2 + minX
// Simulation top is on the Y axis in world coordinates.
const WORLD_TOP_Y = 2.6

// Where the ground is on the Y axis in our sim in world coordinates
const WORLD_BOTTOM_Y = 0

// After this velocity (m/s) the phone breaks ...
const CASH_VELOCITY = 3.7

export default class PhoneDrop extends SimulationBase {
  rafHandler = (timestamp) => {
    const { isRunning, phoneY } = this.state
    if (isRunning) {
      if (this.simulator) {
        const { velocity, nextY } = this.simulator(timestamp)
        if (nextY !== phoneY) {
          this.setState({ phoneY: nextY, velocity })
        }
        if (nextY <= WORLD_BOTTOM_Y) {
          this.setState({ isRunning: false })
          if (velocity > CASH_VELOCITY) {
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

  handlePhoneDrag = (newXScreen, newYScreen) => {
    let newYWorld = this.invScaleY(newYScreen)
    if (newYWorld > WORLD_TOP_Y) {
      newYWorld = WORLD_TOP_Y
    } else if (newYWorld <= WORLD_BOTTOM_Y) {
      newYWorld = WORLD_BOTTOM_Y
    }
    this.setState({
      phoneY: newYWorld,
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
    const { phoneY } = this.state
    const { timeScale } = config
    this.setState({ isRunning: true, crashed: false })
    this.simulator = dropSimulation(phoneY, WORLD_BOTTOM_Y, timeScale)
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
        >
          <Instructions />
        </Dialog>
      )
    }
    return null
  }

  render () {
    const { scaleX, scaleY, crashed, velocity } = this.state
    const phoneY = this.state.phoneY || 0
    const { vehicleHeight } = config
    return (
      <div>
        { this.showDialog() }
        <Stage width={this.simWidth} height={this.simHeight}>
          <Layer>
            <Ground sx={scaleX} sy={scaleY} pixelMeterRatio={this.pixelMeterRatio} hideMarks />
            <Phone sx={scaleX} sy={scaleY} x={DROP_CENTER_X} y={phoneY} angle={0}
              maxHeight={vehicleHeight}
              onUnallowedDrag={this.handleUnallowedCarDrag}
              draggable
              onDrag={this.handlePhoneDrag}
              onDragStart={this.stop}
              onDragEnd={this.start}
              velocity={velocity}
              crashed={crashed}
            />
          </Layer>
        </Stage>
      </div>
    )
  }
}
