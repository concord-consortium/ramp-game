import React, { PureComponent } from 'react'
import { Image } from 'react-konva'

const ARROW_WIDTH = 15
const ARROW_HEIGHT = 27.5
const ARROW_OFFSET_X = ARROW_WIDTH / 2
const ARROW_OFFSET_Y = ARROW_HEIGHT * 0.7

export default class ArrowImage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      image: null
    }
  }

  componentDidMount () {
    const image = new window.Image()
    image.src = './common/images/red-arrow-down-th.png'
    image.onload = () => {
      this.setState({
        arrowImage: image
      })
    }
  }

  render () {
    const { arrowImage } = this.state
    const { sx, sy, x, y, angle } = this.props
    return (
      <Image
        image={arrowImage}
        x={sx(x)} y={sy(y)} width={ARROW_WIDTH} height={ARROW_HEIGHT}
        offsetX={ARROW_OFFSET_X} offsetY={ARROW_OFFSET_Y}
        rotation={angle * 180 / Math.PI}
      />
    )
  }
}
