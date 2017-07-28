import React, { PureComponent } from 'react'
import Plane from './plane'
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
  GroundHeight: 40
}

export default class SimulationBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentPositions: DEFAULT_POSITIONS,
      isRunning: false
    }
    this.setInclinePos = this.setInclinePos.bind(this)
  }

  setInclinePos(p) {
    this.setState({ currentPositions: p })
  }

  render() {
    const {currentPositions} = this.state
    return (
      <div className="ramp-simulation">
        <Stage width={currentPositions.SimWidth} height={currentPositions.SimHeight}>
          <Layer>
            <Plane currentPositions={currentPositions} />
            <InclineControl currentPositions={currentPositions} onInclineChanged={this.setInclinePos} />
            <StaticElements currentPositions={currentPositions} />
            <Car currentPositions={currentPositions} />
          </Layer>
        </Stage>
      </div>
    )
  }
}

