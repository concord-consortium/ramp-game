import React from 'react'
import SimulationBase from './simulation-base'
import { getURLParam } from '../utils'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      width: getURLParam('w') ? getURLParam('w') : document.body.clientWidth,
      height: getURLParam('h') ? getURLParam('h') : document.body.clientHeight,
      dynamicResize: getURLParam('dynamicsize') ? getURLParam('dynamicsize') === 'true' : true
    }
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  updateDimensions () {
    const { width, height, dynamicResize } = this.state
    if (dynamicResize) {
      if (width !== document.body.clientWidth || height !== document.body.clientHeight) {
        this.setState({ width: document.body.clientWidth, height: document.body.clientHeight })
      }
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
  }

  render () {
    const { width, height } = this.state
    return (
      <div className='appContainer' >
        <SimulationBase width={width} height={height} groundheight={30} />
      </div>
    )
  }
}
