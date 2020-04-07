import React, { PureComponent } from 'react'
import { Group, Image } from 'react-konva'

const PHONE = 'phone'
const PHONE_BROKEN = 'phone-broken'
const PHONE_IMAGE_NAMES = [PHONE, PHONE_BROKEN]

const PHONE_IMAGES = {}

const urlForImage = (name) => `./common/images/phone-drop/${name}.png`

const getImageForPhone = (smashed) => {
  return PHONE_IMAGES[smashed]
}

export const DEFAULT_PHONE_HEIGHT = 30

export default class Phone extends PureComponent {
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
    PHONE_IMAGE_NAMES.forEach((name) => {
      const url = urlForImage(name)
      const image = new window.Image()
      image.src = url
      image.onload = () => {
        PHONE_IMAGES[name] = image
        this.setState({
          carImages: PHONE_IMAGES,
          carImageCount: Object.keys(PHONE_IMAGES).length
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
    const { sx, sy, x, y, maxHeight, crashed } = this.props
    const phoneImage = crashed
      ? getImageForPhone(PHONE_BROKEN)
      : getImageForPhone(PHONE)

    // Images might not have loaded yet, if so short-circuit the render pass
    if (!(phoneImage && phoneImage.width)) { return null }

    const phoneHeight = maxHeight || DEFAULT_PHONE_HEIGHT
    const phoneHeightRatio = phoneHeight / phoneImage.height
    const phoneWidth = phoneImage.width * phoneHeightRatio
    const phoneOffsetX = phoneWidth / 2
    const carOffsetY = phoneHeight

    return (
      <Group>
        <Image
          image={phoneImage}
          x={sx(x)} y={sy(y)} width={phoneWidth} height={phoneHeight}
          offsetX={phoneOffsetX} offsetY={carOffsetY}
          scaleX={1}
          onMouseOver={this.onHover} onMouseOut={this.onHoverEnd}
          onMouseDown={this.onDragStart} onTouchStart={this.onDragStart}
        />
      </Group>
    )
  }
}
