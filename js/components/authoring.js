import React, { PureComponent } from 'react'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Checkbox from 'react-toolbox/lib/checkbox'
import Input from 'react-toolbox/lib/input'
import config from '../config'
import authoringStyles from '../../css/authoring.less'

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

export default class Authoring extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      game: config.game,
      autosave: config.autosave,
      inputs: getInputsData(),
      outputs: getOutputsData(),
      iframeSrc: ''
    }
  }

  get finalUrl () {
    const { inputs, outputs, game, autosave } = this.state
    let url = window.location.href.slice()
    url = url.replace('?authoring', '')
    if (game) {
      url += '&game'
    }
    if (autosave !== config.autosave) {
      url += `&autosave=${autosave}`
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
    // Remove first &, as it's unnecessary and make sure there's ?
    url = url.replace('/&', '/?')
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
    newData[idx] = Object.assign({}, newData[idx], {[name]: !newData[idx][name]})
    this.setState({
      [type]: newData
    })
  }

  setInputDefValue (idx, value) {
    const newData = this.state.inputs.slice()
    newData[idx] = Object.assign({}, newData[idx], {defaultValue: value})
    this.setState({
      inputs: newData
    })
  }

  render () {
    const { game, autosave, inputs, outputs, iframeSrc } = this.state
    const finalUrl = this.finalUrl
    return (
      <div className={authoringStyles.authoring} >
        <h1>Customize simulation configuration, inputs and outputs</h1>
        <p><Checkbox className={authoringStyles.inline} checked={game} onChange={this.toggleValue.bind(this, 'game')} /> Game mode</p>
        <p><Checkbox className={authoringStyles.inline} checked={autosave} onChange={this.toggleValue.bind(this, 'autosave')} /> Autosave</p>
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
