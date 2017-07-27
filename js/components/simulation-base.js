import React, { PureComponent } from 'react'
import ReactAnimationFrame from 'react-animation-frame'
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

class SimulationBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      currentPositions: DEFAULT_POSITIONS,
      isRunning: true
    }
    this.setInclinePos = this.setInclinePos.bind(this)
  }
  onAnimationFrame(time) {
    const { progress, isRunning } = this.state;
    if (isRunning) {
      let newProgress = Math.round(time / this.props.durationMs * 100);

      if (newProgress === 100) {
          this.props.endAnimation()
      }
      this.setState({progress: newProgress, isRunning: newProgress<100})
    }
  }

  setInclinePos(newPositions) {
    this.setState({ currentPositions: newPositions });
  }


  render() {
    const {currentPositions} = this.state
    return (
      <div className="timer">
        <p>{this.props.message}</p>
        <div className="timer">{this.state.progress}</div>
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

module.exports = ReactAnimationFrame(SimulationBase)
