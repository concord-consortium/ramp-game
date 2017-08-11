import React from 'react'
import SimulationBase from './simulation-base'
import { getURLParam } from '../utils'

import '../../css/app.less'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      width: getURLParam('w') ? getURLParam('w') : document.body.clientWidth,
      height: getURLParam('h') ? getURLParam('h') : document.body.clientHeight
    }
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  updateDimensions () {
    const { width, height } = this.state
    if (width !== document.body.clientWidth || height !== document.body.clientHeight) {
      this.setState({ width: document.body.clientWidth, height: document.body.clientHeight })
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
        <SimulationBase width={width} height={height} />
      </div>
    )
  }
}
