/* global codapInterface */
import { calcOutputs } from './physics'

const TIMESTEP = 0.05

const DATA_SET_NAME = 'CarRampSimulation'

const CONFIG = {
  title: 'InquirySpace2',
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
        {name: 'RunNumber', type: 'numeric', precision: 0},
        {name: 'RampAngle', type: 'numeric', precision: 2},
        {name: 'StartHeightAboveGround', type: 'numeric', precision: 2},
        {name: 'StartDistanceUpRamp', type: 'numeric', precision: 2},
        {name: 'Mass', unit: 'Kg', type: 'numeric', precision: 2},
        {name: 'Gravity', unit: 'm/s/s', type: 'numeric', precision: 2},
        {name: 'RampFriction', type: 'numeric', precision: 2},
        {name: 'GroundFriction', type: 'numeric', precision: 2},
        {name: 'TimeToGround', type: 'numeric', precision: 2},
        {name: 'TotalTime', type: 'numeric', precision: 2},
        {name: 'VelocityAtBottomOfRamp', type: 'numeric', precision: 2},
        {name: 'FinalDistance', type: 'numeric', precision: 2}
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
        {name: 'Timestamp', unit: 's', type: 'numeric', precision: 2},
        {name: 'Velocity', unit: 'm/s', type: 'numeric', precision: 2},
        {name: 'x', unit: 'm', type: 'numeric', precision: 2},
        {name: 'y', unit: 'm', type: 'numeric', precision: 2}
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
      RunNumber: runNumber,

      Mass: options.mass,
      Gravity: options.gravity,
      RampFriction: options.rampFriction,
      GroundFriction: options.groundFriction,

      RampAngle: outputs.rampAngle * 180 / Math.PI,
      StartDistanceUpRamp: outputs.startDistanceUpRamp,
      StartHeightAboveGround: outputs.startHeightAboveGround,
      VelocityAtBottomOfRamp: outputs.velocityAtBottomOfRamp,
      TimeToGround: outputs.timeToGround,
      TotalTime: outputs.totalTime,
      FinalDistance: outputs.finalDistance,

      Timestamp: time,
      x: outputs.carX,
      y: outputs.carY,
      Velocity: outputs.velocity
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
