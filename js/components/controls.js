import React, { PureComponent } from 'react'
import { Button } from 'react-toolbox/lib/button'
import Slider from 'react-toolbox/lib/slider'
import Input from 'react-toolbox/lib/input'

import '../../css/controls.less'

export default class Controls extends PureComponent {
  constructor (props) {
    super(props)
    this.setNewRun = this.setNewRun.bind(this)
    this.startStop = this.toggleOption.bind(this, 'isRunning')
    this.setGravity = this.setOption.bind(this, 'gravity')
    this.setMass = this.setOption.bind(this, 'mass')
    this.setSurfaceFriction = this.setOption.bind(this, 'surfaceFriction')
  }

  get simStarted () {
    const { elapsedTime } = this.props.options
    return elapsedTime > 0
  }

  get startStopLabel () {
    const { isRunning } = this.props.options
    return isRunning ? 'Stop' : 'Start'
  }

  setOption (name, value) {
    if (isNaN(value)) {
      return
    }
    const { setOptions } = this.props
    setOptions({ [name]: value })
  }

  toggleOption (name) {
    const { options, setOptions } = this.props
    setOptions({ [name]: !options[name] })
  }

  setNewRun () {
    const { setOptions } = this.props
    setOptions({
      isRunning: false,
      elapsedTime: 0
    })
  }

  render () {
    const { simFinished, saveData, carRampDist, finalDist } = this.props
    const { gravity, mass, surfaceFriction } = this.props.options
    return (
      <div className='controls'>
        <div className='buttons'>
          <Button label={this.startStopLabel} onClick={this.startStop} disabled={simFinished} raised primary />
          <Button label='New run' onClick={this.setNewRun} disabled={!this.simStarted} raised primary />
          {
            saveData &&
            <Button label='Save data' onClick={saveData} disabled={!simFinished} raised primary />
          }
        </div>
        <div className='slider-container'>
          <div className='label'>Gravity</div>
          <div className='slider'>
            <Slider min={0.01} max={20} editable value={gravity} onChange={this.setGravity} disabled={this.simStarted} />
          </div>
        </div>
        <div className='slider-container'>
          <div className='label'>Mass</div>
          <div className='slider'>
            <Slider min={0.01} max={0.3} editable value={mass} onChange={this.setMass} disabled={this.simStarted} />
          </div>
        </div>
        <div className='slider-container'>
          <div className='label'>Surface friction</div>
          <div className='slider'>
            <Slider min={0.01} max={1} editable value={surfaceFriction} onChange={this.setSurfaceFriction} disabled={this.simStarted} />
          </div>
        </div>
        <div className='output-container'>
          <div className='label'>Car ramp distance</div>
          <Input className='output' type='text' value={carRampDist.toFixed(2)} disabled />
        </div>
        <div className='output-container'>
          <div className='label'>Final distance</div>
          <Input className='output' type='text' value={simFinished ? finalDist.toFixed(2) : '?'} disabled />
        </div>
      </div>
    )
  }
}
