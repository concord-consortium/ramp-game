import React, { PureComponent } from 'react'
import { Button } from 'react-toolbox/lib/button'
import Slider from 'react-toolbox/lib/slider'
import Input from 'react-toolbox/lib/input'
import config from '../config'

import '../../css/controls.less'

export default class Controls extends PureComponent {
  constructor (props) {
    super(props)
    this.startStop = this.toggleOption.bind(this, 'isRunning')
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

  renderInputs () {
    const { options } = this.props
    const sliders = []
    Object.keys(config.inputs).forEach(inputName => {
      const input = config.inputs[inputName]
      if (input.showInMainView) {
        sliders.push(
          <div key={inputName} className='slider-container'>
            <div className='label'>{ input.codapDef.name }</div>
            <div className='slider'>
              <Slider min={input.range[0]} max={input.range[1]} editable value={options[inputName]} onChange={this.setOption.bind(this, inputName)} disabled={this.simStarted} />
            </div>
          </div>
        )
      }
    })
    return sliders
  }

  renderOutputs () {
    const { outputs } = this.props
    const components = []
    Object.keys(config.outputs).forEach(outputName => {
      const output = config.outputs[outputName]
      if (output.showInMainView) {
        components.push(
          <div key={outputName} className='output-container'>
            <div className='label'>{ output.codapDef.name }</div>
            <Input className='output' type='text' value={outputs[outputName].toFixed(2)} disabled />
          </div>
        )
      }
    })
    return components
  }

  render () {
    const { simFinished, saveData, setupNewRun, dataSaved } = this.props
    return (
      <div className='controls'>
        <div className='buttons'>
          <Button label={this.startStopLabel} onClick={this.startStop} disabled={simFinished} raised primary />
          {
            saveData &&
            <Button label='Save data' onClick={saveData} disabled={!simFinished || dataSaved} raised primary />
          }
          <Button label='New run' onClick={setupNewRun} disabled={!this.simStarted} raised primary />
        </div>
        { this.renderInputs() }
        { this.renderOutputs() }
      </div>
    )
  }
}
