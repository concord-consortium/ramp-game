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

  render() {
    const { x, y, width, height, angle } = this.props
    let xPos = x - width/2
    let yPos = y - height
    return (
      <Image
        image={this.state.image}
        x={xPos} y={yPos} width={width} height={height}
        stroke={'black'}
        rotation={angle}
      />
    );
  }
}