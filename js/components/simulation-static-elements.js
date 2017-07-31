import React from 'react'
import { Rect} from 'react-konva'

export default class StaticElements extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const { simSettings } = this.props;
    return (
      <Rect x={0} y={simSettings.SimHeight - simSettings.GroundHeight} width={simSettings.SimWidth} height={simSettings.GroundHeight} fill={'green'} stroke={'black'} strokeWidth={1} />
    )
  }
}