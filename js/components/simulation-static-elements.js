import React from 'react'
import { Rect} from 'react-konva'

export default class StaticElements extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      hasClicked: false,
      color: 'green'
    }
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick() {
    this.setState({
      hasClicked: true,
      color: Konva.Util.getRandomColor()
    })
  }
  render() {
    const { color, hasClicked } = this.state
    return (
      <Rect x={0} y={560} width={800} height={40} fill={color} stroke={'black'} strokeWidth={1} onClick={this.handleClick} />
    )
  }
}