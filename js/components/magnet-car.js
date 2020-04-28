import React from 'react'
import DraggableComponent from './draggable-component'
import { Group, Image } from 'react-konva'

export const FACING_RIGHT = 'facing-right'
export const FACING_LEFT = 'facing-left'

const CAR_NORMAL = 'car-normal'
const CAR_FRONT_SMASH = 'car-smash-front'
const CAR_BACK_SMASH = 'car-smash-back'
const CAR_BLOCKS = 'blocks'
const MAGNET_NORTH = 'magnet-north'
const MAGNET_SOUTH = 'magnet-south'
const CAR_IMAGE_NAMES = [CAR_NORMAL, CAR_FRONT_SMASH, CAR_BACK_SMASH, CAR_BLOCKS]
const MAGNET_IMAGE_NAMES = [MAGNET_NORTH, MAGNET_SOUTH]

const CAR_IMAGES = {}
const MAGNET_IMAGES = {}

const urlForImage = (name) => `./common/images/crash/slices/${name}.png`

const getImageForCar = (smashed) => {
  return CAR_IMAGES[smashed]
}

const getImageForMagnet = (polarity) => {
  return MAGNET_IMAGES[polarity]
}

export const DEFAULT_VEHICLE_HEIGHT = 30

export default class MagnetCar extends DraggableComponent {
  constructor (props) {
    super(props)
    this.state = {
      images: {},
      imageCount: 0
    }
  }

  componentDidMount () {
    CAR_IMAGE_NAMES.forEach((name) => {
      const url = urlForImage(name)
      const image = new window.Image()
      image.src = url
      image.onload = () => {
        CAR_IMAGES[name] = image
        this.setState({
          carImages: CAR_IMAGES,
          carImageCount: Object.keys(CAR_IMAGES).length
        })
      }
    })

    MAGNET_IMAGE_NAMES.forEach((name) => {
      const url = urlForImage(name)
      const image = new window.Image()
      image.src = url
      image.onload = () => {
        MAGNET_IMAGES[name] = image
        this.setState({
          mangetImages: MAGNET_IMAGES,
          magnetImageCount: Object.keys(MAGNET_IMAGES).length
        })
      }
    })
  }

  render () {
    const { sx, sy, x, y, direction, maxHeight, crashed, mobile } = this.props
    const vehicleImage = crashed
      ? getImageForCar(CAR_FRONT_SMASH)
      : getImageForCar(CAR_NORMAL)

    const magnetImage = getImageForMagnet(MAGNET_SOUTH)
    const blockImage = getImageForCar(CAR_BLOCKS)

    // Images might not have loaded yet, if so short-circuit the render pass
    if (!(vehicleImage && vehicleImage.width)) { return null }
    if (!(magnetImage && magnetImage.width)) { return null }
    if (!(blockImage && blockImage.width)) { return null }

    const carHeight = maxHeight || DEFAULT_VEHICLE_HEIGHT
    const carHeightRatio = carHeight / vehicleImage.height
    const carWidth = vehicleImage.width * carHeightRatio
    let carOffsetX = carWidth / 2
    const carOffsetY = carHeight
    if (crashed && mobile) {
      carOffsetX += carWidth * 0.25
    }
    const magnetHeight = carHeight * 0.25
    const magnetHeightRatio = magnetHeight / magnetImage.height
    const magnetWidth = magnetImage.width * magnetHeightRatio
    let magnetOffsetX = magnetWidth * 0.65
    if (direction && direction === FACING_LEFT) {
      magnetOffsetX = magnetWidth * 0.5
    }
    if (crashed && mobile) {
      magnetOffsetX -= magnetWidth * 0.25
    }

    const blocksHeight = carHeight / blockImage.height
    const magnetOffsetY = carOffsetY + magnetHeight
    const xScale = direction && direction === FACING_RIGHT ? -1 : 1
    return (
      <Group>
        <Image
          image={vehicleImage}
          x={sx(x)} y={sy(y)} width={carWidth} height={carHeight}
          offsetX={carOffsetX} offsetY={carOffsetY}
          scaleX={xScale}
          onMouseOver={this.onHover} onMouseOut={this.onHoverEnd}
          onMouseDown={this.onDragStart} onTouchStart={this.onDragStart}
        />
        <Image
          image={magnetImage}
          x={sx(x)} y={sy(y)} width={magnetWidth} height={magnetHeight}
          offsetX={magnetOffsetX} offsetY={magnetOffsetY}
          onMouseOver={this.onHover} onMouseOut={this.onHoverEnd}
          onMouseDown={this.onDragStart} onTouchStart={this.onDragStart}
        />
        { mobile
          ? null
          : <Image
            image={blockImage}
            x={sx(x)} y={sy(y)} width={carWidth} height={blocksHeight}
            offsetX={carOffsetX} offsetY={blocksHeight} scaleX={xScale}
          />
        }
      </Group>
    )
  }
}
