import React from 'react'
import { Image } from 'react-konva';

// Car image is aligned to the right edge of the png with some spacing at the left edge
const centerAdjust = 1.6

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
    // Top left corner is the center of rotation for the image
    // we want the bottom right corner point on the baseline of the image to match the data point

    let bottomLeftPos = { x: 0, y: 0 }
    let topLeftPos = { x: 0, y: 0 }

    // to position the image so that the nose of the car is at the calculation point,
    // change this to x - (width * Math.cos(theta)) etc.
    bottomLeftPos.x = x - (width/centerAdjust * Math.cos(theta))
    bottomLeftPos.y = y - (width/centerAdjust * Math.sin(theta))

    topLeftPos.x = bottomLeftPos.x + (height * Math.sin(theta))
    topLeftPos.y = bottomLeftPos.y - (height * Math.cos(theta))

    return topLeftPos
  }

  render() {
    const { x, y, width, height, angle, onRamp } = this.props
    let w = width / 1.5
    let h = height

    let topLeftPos = {x: 0, y: 0}
    let imageAngle = angle

    if (onRamp) {
      topLeftPos = this.getCornerPosition(x, y, w, h, angle * Math.PI / 180)
    } else {
      // when car reaches the ground snap to midpoint of base of image
      topLeftPos.x = x - w/centerAdjust
      topLeftPos.y = y - h
    }
    return (
      <Image
        image={this.state.image}
        x={topLeftPos.x} y={topLeftPos.y} width={w} height={h}
        rotation={imageAngle}
      />
    );
  }
}