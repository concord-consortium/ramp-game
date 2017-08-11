import React, { PureComponent } from 'react'
import { Circle } from 'react-konva'

export default class InclineControl extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      active: false
    }
    this.onHover = this.onHover.bind(this)
    this.onHoverEnd = this.onHoverEnd.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  onHover () {
    const { draggable } = this.props
    if (draggable) {
      this.setState({active: true})
      document.body.style.cursor = 'pointer'
    }
  }

  onHoverEnd () {
    const { draggable } = this.props
    if (draggable) {
      document.body.style.cursor = 'auto'
      this.setState({active: false})
    }
  }

  onDragStart () {
    const { draggable } = this.props
    if (draggable) {
      this.setState({active: true})
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.onDragEnd)
      document.addEventListener('touchmove', this.onDrag)
      document.addEventListener('touchend', this.onDragEnd)
    }
  }

  onDragEnd () {
    const { draggable } = this.props
    if (draggable) {
      this.setState({active: false})
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.onDragEnd)
      document.removeEventListener('touchmove', this.onDrag)
      document.removeEventListener('touchend', this.onDragEnd)
    }
  }

  onDrag (e) {
    const { onDrag } = this.props
    const x = e.touches ? e.touches[0].pageX : e.layerX
    const y = e.touches ? e.touches[0].pageY : e.layerY
    onDrag(x, y)
  }

  render () {
    const {x, y} = this.props
    const {active} = this.state
    const radius = active ? 15 : 10
    const fill = active ? '#ddd' : '#fff'
    return (
      <Circle x={x} y={y} radius={radius} fill={fill} stroke={'black'} strokeWidth={1} onMouseOver={this.onHover}
        onMouseOut={this.onHoverEnd} onMouseDown={this.onDragStart} onTouchStart={this.onDragStart} />
    )
  }
}
