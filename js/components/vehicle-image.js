import React from 'react'
import { Image } from 'react-konva';

// try drag& drop rectangle
export default class VehicleImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      image: null
    }
  }
  componentDidMount() {
    const image = new window.Image();
    image.src = './fastcar.png';
    image.onload = () => {
      this.setState({
        image: image
      });
    }
  }

  getCornerPosition(x, y, width, height, theta) {
    // While the car is on the ramp calculate displacement for top left corner
    // we want the bottom right corner point on the baseline of the image to match the data point

    let bottomLeftPos = { x: 0, y: 0 }
    let topLeftPos = { x: 0, y: 0 }

    bottomLeftPos.x = x - (width * Math.cos(theta))
    bottomLeftPos.y = y - (width * Math.sin(theta))

    topLeftPos.x = bottomLeftPos.x + (height * Math.sin(theta))
    topLeftPos.y = bottomLeftPos.y - (height * Math.cos(theta))

    return topLeftPos
  }

  render() {
    const { x, y, width, height, angle, onRamp } = this.props

    let topLeftPos = {x: 0, y: 0}
    let imageAngle = angle

    if (onRamp) {
      topLeftPos = this.getCornerPosition(x, y, width, height, angle * Math.PI / 180)
    } else {
      // when car reaches the ground snap to midpoint of base of image
      topLeftPos.x = x - width/2
      topLeftPos.y = y - height
    }
    return (
      <Image
        image={this.state.image}
        x={topLeftPos.x} y={topLeftPos.y} width={width} height={height}
        rotation={imageAngle}
      />
    );
  }
}