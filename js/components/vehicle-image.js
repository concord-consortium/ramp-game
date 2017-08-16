import React, { PureComponent } from 'react'
import { Image } from 'react-konva'

const CAR_WIDTH = 45
const CAR_HEIGHT = 33

export default class VehicleImage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      image: null
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

  componentDidMount () {
    const image = new window.Image()
    image.src = './fastcar-arrow.png'
    image.onload = () => {
      this.setState({
        image: image
      })
    }
  }

  render () {
    const { image } = this.state
    const { sx, sy, x, y, angle } = this.props
    return (
      <Image
        image={image}
        x={sx(x)} y={sy(y)} width={CAR_WIDTH} height={CAR_HEIGHT}
        offsetX={0.5 * CAR_WIDTH} offsetY={CAR_HEIGHT * 0.7}
        rotation={angle * 180 / Math.PI}
        onMouseOver={this.onHover} onMouseOut={this.onHoverEnd}
        onMouseDown={this.onDragStart} onTouchStart={this.onDragStart}
      />
    )
  }
}
