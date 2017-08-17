const config = {
  inputs: {
    mass: {
      codapDef: {name: 'Mass', unit: 'kg', type: 'numeric', precision: 2},
      showInCodap: true,
      showInMainView: true,
      range: [0.01, 0.3]
    },
    gravity: {
      codapDef: {name: 'Gravity', unit: 'm/s²', type: 'numeric', precision: 2},
      showInCodap: true,
      showInMainView: true,
      range: [0.01, 20]
    },
    surfaceFriction: {
      codapDef: {name: 'Surface friction', type: 'numeric', precision: 2},
      showInCodap: true,
      showInMainView: true,
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

export default config
