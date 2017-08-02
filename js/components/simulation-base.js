import React, { PureComponent } from 'react'
import Ramp from './ramp'
import StaticElements from './simulation-static-elements'
import InclineControl from './incline-control'
import Car from './car'
import SimulationEditor from './simulation-editor'
import '../../css/app.less';
import '../../css/simulation-editor.less';

import { Layer, Rect, Stage, Group } from 'react-konva'

const DEFAULT_POSITIONS = {
  RampTopY: 100,
  RampBottomY: 560,
  RampStartX: 30,
  RampEndX: 300,
  CarInitialX: 150,
  SimWidth: 800,
  SimHeight: 600,
  GroundHeight: 40,
  RampAngle: 60 * Math.PI / 180
}
const DEFAULT_SIMULATION = {
  gravity: 9.81,
  mass: 10,
  rampFriction: 0.01,
  groundFriction: -1
}

export default class SimulationBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      simSettings: DEFAULT_POSITIONS,
      simConstants: DEFAULT_SIMULATION,
      isRunning: false
    }
    this.setInclinePos = this.setInclinePos.bind(this)
    this.setConstants = this.setConstants.bind(this)
    this.setSimulationRunning = this.setSimulationRunning.bind(this)
    this.toggleSimulationRunning = this.toggleSimulationRunning.bind(this)
  }

  setInclinePos(p) {
    this.setState({ simSettings: p })
  }

  setConstants(constantProp, value) {
    let newConstants = this.state.simConstants
    newConstants[constantProp] = value
    this.setState({ newConstants })
  }

  toggleSimulationRunning() {
    const { isRunning } = this.state
    this.setSimulationRunning(!isRunning)
  }
  setSimulationRunning(running) {
    this.setState({ isRunning: running })
  }

  render() {
    const { simSettings, simConstants, isRunning } = this.state
    let runText = isRunning ? "Stop" : "Run"
    let runSimulationClass = isRunning ? "run-simulation running" : "run-simulation stopped"

    return (
      <div className="ramp-simulation">
        <div className={runSimulationClass} onClick={this.toggleSimulationRunning}>{runText}</div>
        <SimulationEditor {...this.state} onChange={this.setConstants} />
        <Stage width={simSettings.SimWidth} height={simSettings.SimHeight}>
          <Layer>
            <Ramp simSettings={simSettings} />
            <InclineControl simSettings={simSettings} onInclineChanged={this.setInclinePos} />
            <StaticElements simSettings={simSettings} />
            <Car simSettings={simSettings} simConstants={simConstants} isRunning={isRunning} onSimulationRunningChange={this.setSimulationRunning} />
          </Layer>
        </Stage>
      </div>
    )
  }
}

