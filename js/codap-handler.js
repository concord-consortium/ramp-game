/* global codapInterface */
import { calcOutputs } from './physics'
import config from './config'

const TIMESTEP = 0.05

const DATA_SET_NAME = 'CarRampSimulation'

const CONFIG = {
  title: config.game ? 'Ramp game' : 'Ramp simulation',
  name: DATA_SET_NAME,
  dimensions: {
    width: 650,
    height: 350
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

if (config.game) {
  DATA_SET_TEMPLATE.collections.unshift({
    name: 'GameSummary',
    title: 'Game Summary',
    labels: {
      pluralCase: 'Game',
      setOfCasesWithArticle: 'a challenge'
    },
    attrs: [
      {name: 'Challenge number', type: 'categorical'}
    ]
  })
  DATA_SET_TEMPLATE.collections[1].parent = 'GameSummary'
}

// Extend template using configuration.
Object.values(config.inputs).forEach(input => {
  const summary = DATA_SET_TEMPLATE.collections.find(col => col.name === 'RunSummary')
  const showInCodap = (!config.game && input.showInCodap) || (config.game && input.showInCodapInGameMode)
  if (showInCodap) {
    summary.attrs.push(input.codapDef)
  }
})

Object.values(config.outputs).forEach(output => {
  const summary = DATA_SET_TEMPLATE.collections.find(col => col.name === 'RunSummary')
  const details = DATA_SET_TEMPLATE.collections.find(col => col.name === 'RunDetails')
  const showInCodap = (!config.game && output.showInCodap) || (config.game && output.showInCodapInGameMode)
  if (showInCodap && output.codapType === 'summary') {
    summary.attrs.push(output.codapDef)
  } else if (showInCodap && output.codapType === 'detail') {
    details.attrs.push(output.codapDef)
  }
})

let DETAILS_PRESENT = true
if (DATA_SET_TEMPLATE.collections.find(col => col.name === 'RunDetails').attrs.length === 1) {
  // If no time series data is added to the template, remove this table completely.
  DATA_SET_TEMPLATE.collections.pop()
  DETAILS_PRESENT = false
}

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
  const challengeNumber = options.challengeIdx + 1
  const optionsCopy = Object.assign({}, options)
  const totalTime = calcOutputs(options).totalTime
  let time = DETAILS_PRESENT ? 0 : totalTime

  while (time <= totalTime) {
    optionsCopy.elapsedTime = Math.min(time, totalTime)
    const outputs = calcOutputs(optionsCopy)

    const values = {
      'Run number': runNumber,
      'Time': time
    }
    if (config.game) {
      values['Challenge number'] = challengeNumber
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
