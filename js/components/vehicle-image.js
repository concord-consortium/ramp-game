import React, { PureComponent } from 'react'
import { Image } from 'react-konva'

export const CAR_IMAGE = 'fastcar'
export const SUV_IMAGE = 'suv'
export const TRUCK_IMAGE = 'truck'
export const BIKE_IMAGE = 'bike'
export const VEHICLE_IMAGES = [CAR_IMAGE, SUV_IMAGE, TRUCK_IMAGE, BIKE_IMAGE]

export const DEFAULT_VEHICLE_HEIGHT = 19

export default class VehicleImage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      images: {},
      imageCount: 0
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
      this.setState({ active: true })
      document.body.style.cursor = 'pointer'
    }
  }

  onHoverEnd () {
    const { draggable } = this.props
    if (draggable) {
      document.body.style.cursor = 'auto'
      this.setState({ active: false })
    }
  }

  onDragStart () {
    const { draggable, onUnallowedDrag } = this.props
    if (draggable) {
      this.setState({ active: true })
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.onDragEnd)
      document.addEventListener('touchmove', this.onDrag)
      document.addEventListener('touchend', this.onDragEnd)
    } else {
      onUnallowedDrag()
    }
  }

  onDragEnd () {
    const { draggable } = this.props
    if (draggable) {
      this.setState({ active: false })
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
    const carIcons = VEHICLE_IMAGES.map(name => `./common/images/${name}.png`)
    carIcons.forEach((url) => {
      const match = /.*\/(.*)\.png$/.exec(url)
      const name = match && match[1]
      const image = new window.Image()
      image.src = url
      image.onload = () => {
        const { images } = this.state
        images[name] = image
        this.setState({
          images: images,
          imageCount: Object.keys(images).length
        })
      }
    })
  }

  render () {
    const { vehicle, sx, sy, x, y, angle, maxHeight } = this.props
    const { images } = this.state
    const vehicleImage = images[vehicle] || images[CAR_IMAGE]

    // Images might not have loaded yet, if so short-circuit the render pass
    if (!(vehicleImage && vehicleImage.width)) { return null }

    const height = maxHeight || DEFAULT_VEHICLE_HEIGHT
    const heightRatio = height / vehicleImage.height
    const width = vehicleImage.width * heightRatio
    const offsetX = width / 2
    const offsetY = height
    return (
      <Image
        image={vehicleImage}
        x={sx(x)} y={sy(y)} width={width} height={height}
        offsetX={offsetX} offsetY={offsetY}
        rotation={(angle || 0) * 180 / Math.PI}
        onMouseOver={this.onHover} onMouseOut={this.onHoverEnd}
        onMouseDown={this.onDragStart} onTouchStart={this.onDragStart}
      />
    )
  }
}
