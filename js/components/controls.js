import React, { PureComponent } from 'react'
import { Button } from 'react-toolbox/lib/button'
import Slider from 'react-toolbox/lib/slider'
import Input from 'react-toolbox/lib/input'
import config from '../config'
import controlsStyles from '../../css/controls.less'
import sliderTheme from '../../css/slider-theme.less'

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
    const { options, disabledInputs } = this.props
    const sliders = []
    Object.keys(config.inputs).forEach(inputName => {
      const input = config.inputs[inputName]
      if (input.showInMainView) {
        const disabled = this.simStarted || disabledInputs.indexOf(inputName) !== -1
        sliders.push(
          <div key={inputName} className={controlsStyles.sliderContainer}>
            <div className={controlsStyles.label}>{ input.codapDef.name }</div>
            <div className={controlsStyles.slider}>
              <Slider min={input.range[0]} theme={sliderTheme} max={input.range[1]} editable value={options[inputName]} onChange={this.setOption.bind(this, inputName)} disabled={disabled} />
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
          <div key={outputName} className={controlsStyles.outputContainer}>
            <div className={controlsStyles.label}>{ output.codapDef.name }</div>
            <Input className={controlsStyles.output} type='text' value={outputs[outputName].toFixed(2)} disabled />
          </div>
        )
      }
    })
    return components
  }

  render () {
    const { simFinished, saveData, setupNewRun, dataSaved, challengeActive } = this.props
    return (
      <div className={controlsStyles.controls}>
        <div className={controlsStyles.buttons}>
          <Button label={this.startStopLabel} onClick={this.startStop} disabled={simFinished} raised primary />
          {
            saveData &&
            <Button label='Save data' onClick={saveData} disabled={!simFinished || dataSaved} raised primary />
          }
          <Button label='New run' onClick={setupNewRun} disabled={!this.simStarted || (challengeActive && !dataSaved)} raised primary />
        </div>
        { this.renderInputs() }
        { this.renderOutputs() }
      </div>
    )
  }
}
