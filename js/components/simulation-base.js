import React, { PureComponent } from 'react'
import Ramp from './ramp'
import StaticElements from './simulation-static-elements'
import InclineControl from './incline-control'
import Car from './car'

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

export default class SimulationBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      simSettings: DEFAULT_POSITIONS,
      isRunning: false
    }
    this.setInclinePos = this.setInclinePos.bind(this)
  }

  setInclinePos(p) {
    this.setState({ simSettings: p })
  }

  render() {
    const {simSettings} = this.state
    return (
      <div className="ramp-simulation">
        <Stage width={simSettings.SimWidth} height={simSettings.SimHeight}>
          <Layer>
            <Ramp simSettings={simSettings} />
            <InclineControl simSettings={simSettings} onInclineChanged={this.setInclinePos} />
            <StaticElements simSettings={simSettings} />
            <Car simSettings={simSettings} />
          </Layer>
        </Stage>
      </div>
    )
  }
}

