import React, { PureComponent } from 'react'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Checkbox from 'react-toolbox/lib/checkbox'
import Input from 'react-toolbox/lib/input'
import config from '../config'
import authoringStyles from '../../css/authoring.less'
import { VEHICLE_IMAGES, CAR_IMAGE } from './vehicle-image'

function getInputsData () {
  const data = []
  Object.keys(config.inputs).forEach(inputName => {
    const input = config.inputs[inputName]
    data.push({
      name: inputName,
      displayName: input.codapDef.name,
      defaultValue: input.defaultValue,
      showInCodap: input.showInCodap,
      showInMainView: input.showInMainView,
      showInCodapInGameMode: input.showInCodapInGameMode
    })
  })
  return data
}

function getOutputsData () {
  const data = []
  Object.keys(config.outputs).forEach(outputName => {
    const output = config.outputs[outputName]
    data.push({
      name: outputName,
      displayName: output.codapDef.name,
      showInCodap: output.showInCodap,
      showInMainView: output.showInMainView,
      showInCodapInGameMode: output.showInCodapInGameMode
    })
  })
  return data
}

const BASIC_OPTIONS = [
  { name: 'game', dispName: 'Game' },
  { name: 'autosave', dispName: 'Autosave' },
  { name: 'returnToActivity', dispName: 'Return to activity dialog' },
  { name: 'allowAngleAdjustment', dispName: 'Allow student to direcetly change ramp incline' },
  { name: 'hideMarks', dispName: 'Hide distance markers on ground' },
  { name: 'hideArrow', dispName: 'Hide red arrow behind vehicle' },
  { name: 'specifyVehicle', dispName: 'Use specific vehical for all attempts' }
]

export default class Authoring extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      inputs: getInputsData(),
      outputs: getOutputsData(),
      iframeSrc: '',
      vehicleHeight: config.vehicleHeight
    }
    BASIC_OPTIONS.forEach(opt => {
      this.state[opt.name] = config[opt.name]
    })
  }

  get finalUrl () {
    const { inputs, outputs, vehicle, vehicleHeight } = this.state
    let url = window.location.href.slice()
    url = url.replace('?authoring', '')

    BASIC_OPTIONS.forEach(opt => {
      const val = this.state[opt.name]
      if (val !== config[opt.name]) {
        if (val === true) {
          url += `&${opt.name}`
        } else {
          url += `&${opt.name}=${val}`
        }
      }
    })
    if (vehicle) {
      url += `&vehicle=${vehicle}`
    }
    if (vehicleHeight) {
      url += `&vehicleHeight=${vehicleHeight}`
    }
    const props = ['defaultValue', 'showInCodap', 'showInCodapInGameMode', 'showInMainView']
    inputs.forEach(item => {
      props.forEach(prop => {
        if (item[prop] !== config.inputs[item.name][prop]) {
          url += `&${item.name}-${prop}=${item[prop]}`
        }
      })
    })
    outputs.forEach(item => {
      props.forEach(prop => {
        if (item[prop] !== config.outputs[item.name][prop]) {
          url += `&${item.name}-${prop}=${item[prop]}`
        }
      })
    })
    // Remove first &, as it's unnecessary and make sure there's a ?
    url = url.replace(/&/, '?')
    return url
  }

  componentDidMount () {
    this.setState({
      iframeSrc: this.finalUrl
    })
  }

  componentDidUpdate () {
    window.clearTimeout(this._iframeUpdate)
    this._iframeUpdate = setTimeout(() => {
      this.setState({
        iframeSrc: this.finalUrl
      })
    }, 750)
  }

  toggleValue (name) {
    this.setState({
      [name]: !this.state[name]
    })
  }

  toggleNestedValue (type, idx, name) {
    const newData = this.state[type].slice()
    newData[idx] = Object.assign({}, newData[idx], { [name]: !newData[idx][name] })
    this.setState({
      [type]: newData
    })
  }

  setInputDefValue (idx, value) {
    const newData = this.state.inputs.slice()
    newData[idx] = Object.assign({}, newData[idx], { defaultValue: value })
    this.setState({
      inputs: newData
    })
  }

  setVehicleHeight = (value) => {
    this.setState({ vehicleHeight: value })
  }

  renderHeightOption () {
    const { vehicleHeight } = this.state
    return (
      <div className={authoringStyles.flexInput}>
        <div>Vehicle Image Height:</div>
        <Input
          type='text'
          className={authoringStyles.smallInput}
          value={vehicleHeight}
          onChange={this.setVehicleHeight} />
      </div>
    )
  }

  renderVehicleSelector () {
    const vehicle = this.state.vehicle || CAR_IMAGE
    const setVehicle = (e) => this.setState({ vehicle: e.target.value })
    if (!this.state.specifyVehicle) {
      return null
    }
    return (
      <div className={authoringStyles.inline}>
        Always use this vehicle image:
        <select name='vehicle' id='vehicle' value={vehicle} onChange={setVehicle}>
          {
            VEHICLE_IMAGES.map((v) => {
              return <option value={v}>{v}</option>
            })
          }
        </select>
      </div>
    )
  }

  render () {
    const { inputs, outputs, iframeSrc } = this.state
    const finalUrl = this.finalUrl
    return (
      <div className={authoringStyles.authoring} >
        <h1>Customize simulation configuration, inputs and outputs</h1>
        {
          this.renderHeightOption()
        }
        {
          BASIC_OPTIONS.map(opt => {
            return (
              <div key={opt.name}>
                <Checkbox className={authoringStyles.inline}
                  checked={this.state[opt.name]}
                  onChange={this.toggleValue.bind(this, opt.name)}
                /> { opt.dispName }
              </div>
            )
          })
        }
        { this.renderVehicleSelector() }
        <h3>Inputs</h3>
        <Table selectable={false}>
          <TableHead>
            <TableCell>Name</TableCell>
            <TableCell>Default value</TableCell>
            <TableCell>Show slider</TableCell>
            <TableCell>Show in CODAP</TableCell>
            <TableCell>Show in CODAP in game mode</TableCell>
          </TableHead>
          {inputs.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.displayName}</TableCell>
              <TableCell>
                <Input type='text' className={authoringStyles.smallInput} value={item.defaultValue} onChange={this.setInputDefValue.bind(this, idx)} />
              </TableCell>
              <TableCell>
                <Checkbox checked={item.showInMainView} onChange={this.toggleNestedValue.bind(this, 'inputs', idx, 'showInMainView')} />
              </TableCell>
              <TableCell>
                <Checkbox checked={item.showInCodap} onChange={this.toggleNestedValue.bind(this, 'inputs', idx, 'showInCodap')} />
              </TableCell>
              <TableCell>
                <Checkbox checked={item.showInCodapInGameMode} onChange={this.toggleNestedValue.bind(this, 'inputs', idx, 'showInCodapInGameMode')} />
              </TableCell>
            </TableRow>
          ))}
        </Table>

        <h3>Outputs</h3>
        <Table selectable={false}>
          <TableHead>
            <TableCell>Name</TableCell>
            <TableCell>Show in main view</TableCell>
            <TableCell>Show in CODAP</TableCell>
            <TableCell>Show in CODAP in game mode</TableCell>
          </TableHead>
          {outputs.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.displayName}</TableCell>
              <TableCell>
                <Checkbox checked={item.showInMainView} onChange={this.toggleNestedValue.bind(this, 'outputs', idx, 'showInMainView')} />
              </TableCell>
              <TableCell>
                <Checkbox checked={item.showInCodap} onChange={this.toggleNestedValue.bind(this, 'outputs', idx, 'showInCodap')} />
              </TableCell>
              <TableCell>
                <Checkbox checked={item.showInCodapInGameMode} onChange={this.toggleNestedValue.bind(this, 'outputs', idx, 'showInCodapInGameMode')} />
              </TableCell>
            </TableRow>
          ))}
        </Table>

        <h3>Final URL:</h3>
        <div className={authoringStyles.finalUrl}>{ finalUrl }</div>

        <h3>Preview:</h3>
        <iframe width='650' height='320' src={iframeSrc} />
      </div>
    )
  }
}
