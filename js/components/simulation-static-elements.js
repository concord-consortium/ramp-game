import React from 'react'
import { Rect} from 'react-konva'

export default class StaticElements extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Rect x={0} y={560} width={800} height={40} fill={'green'} stroke={'black'} strokeWidth={1} />
    )
  }
}