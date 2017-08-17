import { getURLParam } from './utils'

const config = {
  inputs: {
    mass: {
      codapDef: {name: 'Mass', unit: 'kg', type: 'numeric', precision: 2},
      showInCodap: true,
      showInMainView: true,
      defaultValue: 0.05,
      range: [0.01, 0.3]
    },
    gravity: {
      codapDef: {name: 'Gravity', unit: 'm/s²', type: 'numeric', precision: 2},
      showInCodap: true,
      showInMainView: true,
      defaultValue: 9.81,
      range: [0.01, 20]
    },
    surfaceFriction: {
      codapDef: {name: 'Surface friction', type: 'numeric', precision: 2},
      showInCodap: true,
      showInMainView: true,
      defaultValue: 0.3,
      range: [0.01, 1]
    }
  },
  outputs: {
    rampAngle: {
      codapDef: {name: 'Ramp angle', unit: '°', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInMainView: false
    },
    startHeightAboveGround: {
      codapDef: {name: 'Start height above ground', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInMainView: false
    },
    startDistanceUpRamp: {
      codapDef: {name: 'Start car ramp distance', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInMainView: true
    },
    distanceFromEndOfRamp: {
      codapDef: {name: 'Distance from end of ramp', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: false,
      showInMainView: true
    },
    timeToGround: {
      codapDef: {name: 'Time to ground', unit: 's', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
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
      showInMainView: false
    },
    finalDistance: {
      codapDef: {name: 'Final distance', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'summary',
      showInCodap: true,
      showInMainView: false
    },
    carVelocity: {
      codapDef: {name: 'Velocity', unit: 'm/s', type: 'numeric', precision: 2},
      codapType: 'detail',
      showInCodap: true,
      showInMainView: false
    },
    carX: {
      codapDef: {name: 'X', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'detail',
      showInCodap: true,
      showInMainView: false
    },
    carY: {
      codapDef: {name: 'Y', unit: 'm', type: 'numeric', precision: 2},
      codapType: 'detail',
      showInCodap: true,
      showInMainView: false
    }
  }
}

function processUrl (type) {
  Object.keys(config[type]).forEach((name) => {
    const item = config[type][name]
    Object.keys(item).forEach(prop => {
      let urlValue = getURLParam(`${name}-${prop}`)
      if (urlValue === 'true') {
        urlValue = true
      } else if (urlValue === 'false') {
        urlValue = false
      } else if (urlValue !== null && !isNaN(urlValue)) {
        // !isNaN(string) means isNumber(string).
        urlValue = parseFloat(urlValue)
      }

      if (urlValue !== null) {
        config[type][name][prop] = urlValue
      }
    })
  })
}

processUrl('inputs')
processUrl('outputs')

export default config
