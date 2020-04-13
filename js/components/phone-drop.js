import React from 'react'
import { Dialog } from 'react-toolbox/lib/dialog'
import Phone from './phone'
import { Instructions } from './phone-drop-instructions'
import { GROUND_HEIGHT } from './ground'
import SimulationBase from './simulation-base'
import config from '../config'
import { Layer, Stage, Rect } from 'react-konva'
import { dropSimulation } from '../physics'

// World left
const worldMinX = -1
// World right
const worldMaxX = 1

// World bottom, where the 'ground' is located, and crashing happens.
const worldMinY = -4
// World top
const worldMaxY = 4

function getScaleX (pixelMeterRatio) {
  return function scaleX (worldX) {
    return (worldX - worldMinX) * pixelMeterRatio
  }
}

function getScaleY (pixelMeterRatio) {
  return function scaleY (worldY) {
    return (worldMaxY - worldY) * pixelMeterRatio
  }
}

export default class PhoneDrop extends SimulationBase {
  rafHandler = (timestamp) => {
    const { isRunning, phoneY } = this.state
    const { phoneCrack } = config
    if (isRunning) {
      if (this.simulator) {
        const { velocity, nextY } = this.simulator(timestamp)
        if (nextY !== phoneY) {
          this.setState({ phoneY: nextY, velocity })
        }
        if (nextY <= worldMinY) {
          this.setState({ isRunning: false })
          if (velocity > phoneCrack) {
            this.setState({ crashed: true })
          }
        } else {
          window.requestAnimationFrame(this.rafHandler)
        }
      }
    }
  }

  get pixelMeterRatio () {
    const xScale = this.simWidth / (worldMaxX - worldMinX)
    const yScale = (this.simHeight - GROUND_HEIGHT) / (worldMaxY - worldMinY)
    return Math.min(xScale, yScale)
  }

  componentDidUpdate (prevProps, prevState) {
    const { isRunning } = this.state
    const { width, height } = this.props
    if (width !== prevProps.width || height !== prevProps.height) {
      this.setState({
        scaleX: getScaleX(this.pixelMeterRatio),
        scaleY: getScaleY(this.pixelMeterRatio)
      })
    }
    if (isRunning && !prevState.isRunning) {
      window.requestAnimationFrame(this.rafHandler)
    }
  }

  handlePhoneDrag = (newXScreen, newYScreen) => {
    let newYWorld = this.invScaleY(newYScreen)
    if (newYWorld > worldMaxY) {
      newYWorld = worldMaxY
    } else if (newYWorld <= worldMinY) {
      newYWorld = worldMinY
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
    this.simulator = dropSimulation(phoneY, worldMinY, timeScale)
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
    const { scaleY, crashed, velocity } = this.state
    const phoneY = this.state.phoneY || worldMinY
    const { vehicleHeight } = config
    const phoneCenter = this.simWidth / 2
    return (
      <div>
        { this.showDialog() }
        <Stage width={this.simWidth} height={this.simHeight}>
          <Layer>
            <Rect
              x={0}
              y={scaleY(worldMinY)}
              width={this.simWidth}
              height={GROUND_HEIGHT}
              fill={'green'}
              stroke={'black'}
              strokeWidth={1} />
            <Phone x={phoneCenter} y={scaleY(phoneY)} angle={0}
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
