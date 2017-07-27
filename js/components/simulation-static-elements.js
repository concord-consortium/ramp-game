import React from 'react'
import { Rect} from 'react-konva'

export default class StaticElements extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const { currentPositions } = this.props;
    return (
      <Rect x={0} y={currentPositions.SimHeight - currentPositions.GroundHeight} width={currentPositions.SimWidth} height={currentPositions.GroundHeight} fill={'green'} stroke={'black'} strokeWidth={1} />
    )
  }
}