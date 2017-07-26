import React, { PureComponent } from 'react'
import ReactAnimationFrame from 'react-animation-frame'
import Plane from './plane'
import StaticElements from './simulation-static-elements'
import InclineControl from './incline-control'

import { Layer, Rect, Stage, Group } from 'react-konva'


class SimulationBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      isRunning: true
    }
    this.setInclinePos = this.setInclinePos.bind(this)
  }
  onAnimationFrame(time) {
    const { progress, isRunning } = this.state;
    if (isRunning) {
      let newProgress = Math.round(time / this.props.durationMs * 100);

      if (newProgress === 100) {
          this.props.endAnimation();
      }
      this.setState({progress: newProgress, isRunning: newProgress<100})
    }
  }

  setInclinePos(yPos) {
    this.setState({ yPos });
  }


  render() {
    const {yPos} = this.state
    return (
      <div className="timer">
        <p>{this.props.message}</p>
        <div className="timer">{this.state.progress}</div>
        <Stage width={800} height={600}>
          <Layer>
            <Plane yPos={yPos} />
            <InclineControl yPos={yPos} onInclineChanged={this.setInclinePos} />
            <StaticElements />
          </Layer>
        </Stage>
      </div>
    )
  }
}

module.exports = ReactAnimationFrame(SimulationBase)
