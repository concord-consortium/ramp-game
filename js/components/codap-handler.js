/* global codapInterface */

const appName = 'InquirySpace2'
const dataSetName = 'CarRampSimulation'
const dataSetTemplate = {
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

const config = {
  name: dataSetName,
  title: appName,
  dimensions: {width: 650, height: 350},
  version: '0.1'
}

export default {

  setup: function () {
    codapInterface.init(config).then(function (iResult) {
      // get interactive state so we can save the sample set index.
      myState = codapInterface.getInteractiveState()
      // Determine if CODAP already has the Data Context we need.
      return requestDataContext(dataSetName)
    }).then(function (iResult) {
      // if we did not find a data set, make one
      if (iResult && !iResult.success) {
        // If not not found, create it.
        return requestCreateDataSet(dataSetName, dataSetTemplate)
      } else {
        // else we are fine as we are, so return a resolved promise.
        return Promise.resolve(iResult)
      }
    }).catch(function (msg) {
      // handle errors
      console.log(msg)
    })
    let requestDataContext = (name) => {
      return codapInterface.sendRequest({
        action: 'get',
        resource: 'dataContext[' + name + ']'
      })
    }
    let requestCreateDataSet = (name, template) => {
      var dataSetDef = Object.assign({}, template)
      dataSetDef.name = name
      return codapInterface.sendRequest({
        action: 'create',
        resource: 'dataContext',
        values: dataSetDef
      })
    }
  },
  sendItems: function (data) {
    let finalDistance = data.finalDistance ? data.finalDistance : 0
    if (!myState.runNumber) myState.runNumber = 1
    myState.runNumber += 1
    let runNumber = myState.runNumber

    let runSummary = {
      RunNumber: runNumber,
      RampAngle: data.simSettings.RampAngle * 180 / Math.PI,
      StartDistanceUpRamp: data.startDistanceUpRamp,
      StartHeightAboveGround: data.startHeightAboveGround,
      Mass: data.simConstants.mass,
      Gravity: data.simConstants.gravity,
      RampFriction: data.simConstants.rampFriction,
      GroundFriction: data.simConstants.groundFriction,
      VelocityAtBottomOfRamp: data.startGroundVelocity,
      TimeToGround: data.timeToGround,
      TotalTime: data.totalTime,
      FinalDistance: finalDistance
    }
    let runDetails = data.currentRun
    let items = []
    for (var i = 0; i < runDetails.length; i++) {
      let d = Object.assign({}, runSummary)
      d.Timestamp = runDetails[i].Timestamp
      d.x = runDetails[i].x
      d.y = runDetails[i].y
      d.Velocity = runDetails[i].Velocity
      items.push(d)
    }
    return codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContext[' + dataSetName + '].item',
      values: items
    })
  }
}
