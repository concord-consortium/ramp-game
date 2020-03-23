import { getURLParam } from './utils'
import * as c from './sim-constants'
import { CAR_IMAGE } from './components/vehicle-image'
const config = {
  game: false,
  // Save data to CODAP automatically.
  autosave: true,
  // Sends user back to activity after each challenge.
  returnToActivity: true,
  specifyVehicle: false,
  vehicle: CAR_IMAGE,
  others: {
    challenge: {
      codapDef: {name: 'Challenge', type: 'categorical'},
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true
    },
    run: {
      codapDef: {name: 'Run number', type: 'categorical'},
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: true
    },
    step: {
      codapDef: {name: 'Step', type: 'categorical'},
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true
    },
    time: {
      codapDef: {name: 'Time', unit: 's', type: 'numeric', precision: 2},
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true
    }
  },
  inputs: {
    mass: {
      codapDef: {name: 'Mass', unit: 'kg', type: 'numeric', precision: 2},
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true,
      defaultValue: 0.05,
      range: [0.01, 0.3]
    },
    gravity: {
      codapDef: {name: 'Gravity', unit: 'm/s²', type: 'numeric', precision: 2},
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: true,
      defaultValue: 9.81,
      range: [0.01, 20]
    },
    surfaceFriction: {
      codapDef: {name: 'Surface friction', type: 'numeric', precision: 2},
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true,
      defaultValue: 0.3,
      range: [0.1, 1]
    }
  },
  outputs: {
    rampAngle: {
      codapDef: {name: 'Ramp angle', unit: '°', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: true,
      editable: true,
      range: [0.001, 90],
      dispFunc: function (v) { return v * 180 / Math.PI }
    },
    startDistanceUpRamp: {
      codapDef: {name: 'Distance up ramp', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true,
      editable: true,
      range: [0, 4]
    },
    startHeightAboveGround: {
      codapDef: {name: 'Height', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: true,
      editable: true,
      range: [0, c.maxY - c.rampBottomY]
    },
    currentEndDistance: {
      codapDef: {name: 'End distance', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: false,
      showInCodapInGameMode: false,
      showInMainView: true
    },
    timeToGround: {
      codapDef: {name: 'Time to ground', unit: 's', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: false
    },
    totalTime: {
      codapDef: {name: 'Total time', unit: 's', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInMainView: false
    },
    velocityAtBottomOfRamp: {
      codapDef: {name: 'Velocity at bottom of ramp', unit: 'm/s', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: false
    },
    endDistance: {
      codapDef: {name: 'End distance', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: false
    },
    score: {
      codapDef: {name: 'Score', unit: 'stars', type: 'categorical'},
      codapType: 'summary',
      showInCodap: true,
      showInCodapInGameMode: true,
      showInMainView: false
    },
    carVelocity: {
      codapDef: {name: 'Velocity', unit: 'm/s', type: 'numeric', precision: 2},
      codapType: 'detail',
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: false
    },
    carX: {
      codapDef: {name: 'X', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'detail',
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: false
    },
    carY: {
      codapDef: {name: 'Y', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'detail',
      showInCodap: true,
      showInCodapInGameMode: false,
      showInMainView: false
    }
  }
}

function processUrl (type) {
  const parseUrlVal = urlValue => {
    if (urlValue === true || urlValue === 'true') {
      return true
    } else if (urlValue === 'false') {
      return false
    } else if (urlValue != null && !isNaN(urlValue)) {
      // !isNaN(string) means isNumber(string).
      return parseFloat(urlValue)
    } else if (typeof urlValue === 'string') {
      return urlValue
    }
    return null
  }

  const configPart = type ? config[type] : config
  Object.keys(configPart).forEach((name) => {
    const item = configPart[name]
    if (typeof item === 'object') {
      Object.keys(item).forEach(prop => {
        const urlValue = parseUrlVal(getURLParam(`${name}-${prop}`))
        if (urlValue !== null) {
          configPart[name][prop] = urlValue
        }
      })
    } else {
      const urlValue = parseUrlVal(getURLParam(name))
      if (urlValue !== null) {
        configPart[name] = urlValue
      }
    }
  })
}

processUrl()
processUrl('inputs')
processUrl('outputs')

export default config
