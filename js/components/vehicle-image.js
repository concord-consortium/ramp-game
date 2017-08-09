import React from 'react'
import { Image } from 'react-konva';

// to adjust where the center point of the image is, lower numbers place center near the front of the car
const centerAdjust = 1.8

export default class VehicleImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      image: null,
      isDragging: false
    }
    this.onDrag = this.onDrag.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.setPositionInWorld = this.setPositionInWorld.bind(this)
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

  setPositionInWorld(x) {
    this.props.setPositionInWorld(x, 0)
  }

  onDrag(e) {
    const { isDragging, simSettings } = this.state
    if (isDragging) {
      this.setPositionInWorld(e.layerX, 0)

    }
  }

  onDragStart(e) {
    this.setState({
      isDragging: true,
      startTime: 0
    })

    document.addEventListener('mousemove', this.onDrag)
    document.addEventListener('mouseup', this.onDragEnd)
    document.addEventListener('touchmove', this.onDrag)
    document.addEventListener('touchend', this.onDragEnd)

    event.preventDefault();
  }

  onDragEnd(e) {
    this.setState({
      isDragging: false
    })
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.onDragEnd)
    document.removeEventListener('touchmove', this.onDrag)
    document.removeEventListener('touchend', this.onDragEnd)

    event.preventDefault();
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

    // top left corner is a distance (height) along a normal to the incline
    topLeftPos.x = bottomLeftPos.x + (height * Math.sin(theta))
    topLeftPos.y = bottomLeftPos.y - (height * Math.cos(theta))

    return topLeftPos
  }

  render() {
    const { x, y, width, height, angle, onRamp } = this.props
    let w = width*0.75
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
        onMouseDown={this.onDragStart}
      />
    );
  }
}