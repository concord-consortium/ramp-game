/* global codapInterface */
import { calcOutputs } from './physics'

const TIMESTEP = 0.05

const DATA_SET_NAME = 'CarRampSimulation'

const CONFIG = {
  title: 'Ramp simulation',
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
        {name: 'Run number', type: 'categorical'},
        {name: 'Ramp angle', unit: '°', type: 'numeric', precision: 2},
        {name: 'Start height above ground', unit: 'm', type: 'numeric', precision: 2},
        {name: 'Start distance up ramp', unit: 'm', type: 'numeric', precision: 2},
        {name: 'Mass', unit: 'kg', type: 'numeric', precision: 2},
        {name: 'Gravity', unit: 'm/s²', type: 'numeric', precision: 2},
        {name: 'Surface friction', type: 'numeric', precision: 2},
        {name: 'Time to ground', unit: 's', type: 'numeric', precision: 2},
        {name: 'Total time', unit: 's', type: 'numeric', precision: 2},
        {name: 'Velocity at bottom of ramp', unit: 'm/s', type: 'numeric', precision: 2},
        {name: 'Final distance', unit: 'm', type: 'numeric', precision: 2}
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
        {name: 'Time', unit: 's', type: 'numeric', precision: 2},
        {name: 'Velocity', unit: 'm/s', type: 'numeric', precision: 2},
        {name: 'X', unit: 'm', type: 'numeric', precision: 2},
        {name: 'Y', unit: 'm', type: 'numeric', precision: 2}
      ]
    }
  ]
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
  const optionsCopy = Object.assign({}, options)
  const totalTime = calcOutputs(options).totalTime
  let time = 0

  while (time <= totalTime) {
    optionsCopy.elapsedTime = Math.min(time, totalTime)
    const outputs = calcOutputs(optionsCopy)

    data.push({
      'Run number': runNumber,

      'Mass': options.mass,
      'Gravity': options.gravity,
      'Surface friction': options.surfaceFriction,

      'Ramp angle': outputs.rampAngle * 180 / Math.PI,
      'Start distance up ramp': outputs.startDistanceUpRamp,
      'Start height above ground': outputs.startHeightAboveGround,
      'Velocity at bottom of ramp': outputs.velocityAtBottomOfRamp,
      'Time to ground': outputs.timeToGround,
      'Total time': outputs.totalTime,
      'Final distance': outputs.finalDistance,

      'Time': time,
      'X': outputs.carX,
      'Y': outputs.carY,
      'Velocity': outputs.carVelocity
    })

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
