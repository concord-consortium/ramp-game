/* global codapInterface */
import { calcOutputs } from './physics'
import config from './config'

const TIMESTEP = 0.05

const DATA_SET_NAME = 'CarRampSimulation'

const CONFIG = {
  title: 'Ramp simulation',
  name: DATA_SET_NAME,
  dimensions: {
    width: 650,
    height: config.game ? 450 : 350
  },
  version: '0.1'
}

const DATA_SET_TEMPLATE = {
  name: '{name}',
  collections: [
    {
      name: 'RunSummary',
      title: 'Run Summary',
      labels: {
        pluralCase: 'Summary',
        setOfCasesWithArticle: 'a run'
      },
      attrs: [
        {name: 'Run number', type: 'categorical'}
        // will be extended by outputs defined in config
      ]
    },
    {
      name: 'RunDetails',
      title: 'Run Details',
      parent: 'RunSummary',
      labels: {
        pluralCase: 'Details',
        setOfCasesWithArticle: 'a run'
      },
      attrs: [
        {name: 'Time', unit: 's', type: 'numeric', precision: 2}
        // will be extended by outputs defined in config
      ]
    }
  ]
}

// Extend template using configuration.
Object.values(config.inputs).forEach(input => {
  if (input.showInCodap) {
    DATA_SET_TEMPLATE.collections[0].attrs.push(input.codapDef)
  }
})

Object.values(config.outputs).forEach(output => {
  if (output.showInCodap && output.codapType === 'summary') {
    DATA_SET_TEMPLATE.collections[0].attrs.push(output.codapDef)
  } else if (output.showInCodap && output.codapType === 'detail') {
    DATA_SET_TEMPLATE.collections[1].attrs.push(output.codapDef)
  }
})

function requestDataContext (name) {
  return codapInterface.sendRequest({
    action: 'get',
    resource: 'dataContext[' + name + ']'
  })
}

function requestCreateDataSet (name, template) {
  const dataSetDef = Object.assign({}, template)
  dataSetDef.name = name
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'dataContext',
    values: dataSetDef
  })
}

function generateData (runNumber, options) {
  const data = []
  const optionsCopy = Object.assign({}, options)
  const totalTime = calcOutputs(options).totalTime
  let time = 0

  while (time <= totalTime) {
    optionsCopy.elapsedTime = Math.min(time, totalTime)
    const outputs = calcOutputs(optionsCopy)

    const values = {
      'Run number': runNumber,
      'Time': time
    }
    Object.keys(config.inputs).forEach(inputName => {
      const input = config.inputs[inputName]
      if (input.showInCodap) {
        values[input.codapDef.name] = options[inputName]
      }
    })
    Object.keys(config.outputs).forEach(outputName => {
      const output = config.outputs[outputName]
      if (output.showInCodap) {
        values[output.codapDef.name] = outputs[outputName]
      }
    })

    data.push(values)
    time += TIMESTEP
  }
  return data
}

export default class CodapHandler {
  constructor () {
    this.state = null
  }

  init () {
    return codapInterface.init(CONFIG)
      .then(iResult => {
        // Get interactive state so we can save the sample set index.
        this.state = codapInterface.getInteractiveState()
        // Determine if CODAP already has the Data Context we need.
        return requestDataContext(DATA_SET_NAME)
      })
      .then(iResult => {
        // If we did not find a data set, make one
        if (iResult && !iResult.success) {
          // If not not found, create it.
          return requestCreateDataSet(DATA_SET_NAME, DATA_SET_TEMPLATE)
        } else {
          // Else we are fine as we are, so return a resolved promise.
          return Promise.resolve(iResult)
        }
      })
  }

  generateAndSendData (options) {
    if (this.state.runNumber === undefined) {
      this.state.runNumber = 0
    }
    this.state.runNumber += 1

    return codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContext[' + DATA_SET_NAME + '].item',
      values: generateData(this.state.runNumber, options)
    })
  }
}
