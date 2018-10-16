/* global codapInterface */
import { calcOutputs } from './physics'
import config from './config'
import { calcStarsCount } from './game'
import { forEach } from 'lodash'

const TIMESTEP = 0.05

const DATA_SET_NAME = 'CarRampSimulation'

const CONFIG = {
  title: config.game ? 'Ramp game' : 'Ramp simulation',
  name: DATA_SET_NAME,
  dimensions: {
    width: 650,
    height: 350
  },
  version: '0.1',
  preventDataContextReorg: false
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
        config.game ? config.others.step.codapDef : config.others.run.codapDef
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
        config.others.time.codapDef
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
      config.others.challenge.codapDef
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

function responseCallback (response) {
  // console.log(`Success: ${response && response.success}`)
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

export function generateCodapData (options) {
  const outputs = calcOutputs(options)
  const values = {}
  values[config.others.time.codapDef.name] = options.elapsedTime
  if (config.game) {
    values[config.others.challenge.codapDef.name] = options.challengeIdx + 1
    values[config.others.step.codapDef.name] = options.stepIdx + 1
  } else {
    values[config.others.run.codapDef.name] = options.runNumber
  }
  if (options.lastScore != null) {
    outputs.score = calcStarsCount(options.lastScore)
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
      const rawValue = outputs[outputName]
      const outputValue = output.dispFunc
                            ? output.dispFunc(rawValue)
                            : rawValue
      values[output.codapDef.name] = outputValue
    }
  })
  return values
}

let randomSuffix = Math.round(Math.random() * 1000000000)

function _createWebView (options) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'component',
    values: {
      type: 'webView',
      name: `rampGameHints-${++randomSuffix}`,
      title: options.title || '',
      dimensions: {
        width: options.width || 345,
        height: options.height || 345
      },
      position: 'top',
      URL: options.URL
    }
  })
}

export function showWebView (options) {
  return codapInterface.sendRequest({
    action: 'update',
    resource: `component[rampGameHints-${randomSuffix}]`,
    values: options
  }, function (response) {
    if (response && !response.success) {
      _createWebView(options)
    }
  })
}

export function hideWebView (options) {
  return codapInterface.sendRequest({
    action: 'delete',
    resource: `component[rampGameHints-${randomSuffix}]`
  })
}

function generateCompleteData (options) {
  const data = []
  const optionsCopy = Object.assign({}, options)
  const totalTime = calcOutputs(options).totalTime
  let time = DETAILS_PRESENT ? 0 : totalTime

  while (time <= totalTime) {
    optionsCopy.elapsedTime = time
    data.push(generateCodapData(optionsCopy))
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
          // If not found, create it.
          return requestCreateDataSet(DATA_SET_NAME, DATA_SET_TEMPLATE)
        } else {
          // Else we are fine as we are, so return a resolved promise.
          return Promise.resolve(iResult)
        }
      })
  }

  // determine the run number of the last case in the collection.
  retrieveRunNumber (runNumberCallback) {
    const runsCollection = `dataContext[${DATA_SET_NAME}].collection[RunSummary]`
    // determine the number of cases
    codapInterface.sendRequest({
      action: 'get',
      resource: `${runsCollection}.caseCount`
    }, responseCallback)
    .then((response) => {
      if (response.success) {
        // request the last case
        const caseCount = response.values
        if (!caseCount) return
        codapInterface.sendRequest({
          action: 'get',
          resource: `${runsCollection}.caseByIndex[${caseCount - 1}]`
        }, responseCallback)
        .then((response) => {
          // retrieve the run number from the last case
          if (response.success) {
            const theCase = response.values['case']
            const runNumber = theCase.values[config.others.run.codapDef.name]
            if (runNumber) {
              runNumberCallback(runNumber)
            }
          }
        }, responseCallback)
      }
    })
  }

  setCodapState (state) {
    Object.assign(this.state, state)
    // Notify CODAP that interactive is "dirty" and needs to be saved.
    // This action isn't intended for it, but it seems there's no dedicated API for it.
    return codapInterface.sendRequest({
      action: 'notify',
      resource: 'undoChangeNotice',
      'values': {
        operation: 'undoableActionPerformed'
      }
    })
  }

  generateAndSendData (options) {
    return codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContext[' + DATA_SET_NAME + '].item',
      values: generateCompleteData(options)
    })
  }

  registerEventHandlers (handlers) {
    forEach(handlers, (handler, operation) => {
      codapInterface.on('notify', 'component', operation, handler)
    })
  }

  handleNotifications = (msg) => {
    forEach(this.logHandlers, (handler, logStr) => {
      const formatStr = msg.values.formatStr
      if (formatStr && (formatStr.indexOf(logStr) >= 0)) {
        handler(msg)
      }
    })
  }

  registerLogHandlers (handlers) {
    this.logHandlers = handlers || []
    Object.keys(handlers).forEach((logStr) => {
      codapInterface.sendRequest({
        action: 'register',
        resource: 'logMessageMonitor',
        values: {
          clientId: this.clientId,
          formatPrefix: logStr
        }
      })
    })

    codapInterface.on('notify', '*', null, this.handleNotifications)
  }

  log (action, params) {
    codapInterface.sendRequest({
      'action': 'notify',
      'resource': 'logMessage',
      'values': {
        'formatStr': params ? `${action}:${JSON.stringify(params)}` : action + ':'
      }
    })
  }
}
