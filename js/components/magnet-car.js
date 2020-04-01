import React, { PureComponent } from 'react'
import { Image } from 'react-konva'

const NORMAL_PREFIX = 'normal'
const FRONT_BASHED_PREFIX = 'front-bashed'
const BACK_BASHED_PREFIX = 'back-bashed'
const NORTH_SUFFIX = 'N-S'
const SOUTH_SUFFIX = 'S-N'
const CAR_IMAGE_NAMES = [NORMAL_PREFIX, FRONT_BASHED_PREFIX, BACK_BASHED_PREFIX]
const NORTH_IMAGE_NAMES = CAR_IMAGE_NAMES.map(i => `${i}-${NORTH_SUFFIX}`)
const SOUTH_IMAGE_NAMES = CAR_IMAGE_NAMES.map(i => `${i}-${SOUTH_SUFFIX}`)
const IMAGE_NAMES = NORTH_IMAGE_NAMES.concat(SOUTH_IMAGE_NAMES)
const IMAGES = {}
const urlForImage = (name) => `./common/images/crash/${name}.png`
IMAGE_NAMES.forEach((name) => {
  const url = urlForImage(name)
  const image = new window.Image()
  image.src = url
  image.onload = () => {
    IMAGES[name] = image
  }
})

const getImageForCar = (smashed, polarity) => {
  const name = `${smashed}-${polarity}`
  return IMAGES[name]
}

export const DEFAULT_VEHICLE_HEIGHT = 30

export default class MagnetCar extends PureComponent {
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

  componentDidMount () {
    IMAGE_NAMES.forEach((name) => {
      const url = urlForImage(name)
      const image = new window.Image()
      image.src = url
      image.onload = () => {
        IMAGES[name] = image
        this.setState({
          images: IMAGES,
          imageCount: Object.keys(IMAGES).length
        })
      }
    })
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
      if (this.props.onDragStart) {
        this.props.onDragStart()
      }
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
      if (this.props.onDragEnd) {
        this.props.onDragEnd()
      }
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

  render () {
    const { sx, sy, x, y, angle, maxHeight } = this.props
    const vehicleImage = getImageForCar(NORMAL_PREFIX, NORTH_SUFFIX)

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
        scaleX={-1}
        rotation={(angle || 0) * 180 / Math.PI}
        onMouseOver={this.onHover} onMouseOut={this.onHoverEnd}
        onMouseDown={this.onDragStart} onTouchStart={this.onDragStart}
      />
    )
  }
}
