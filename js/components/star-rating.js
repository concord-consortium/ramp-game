import React, { PureComponent } from 'react'
import FontIcon from 'react-toolbox/lib/font_icon'
import { calcStarsCount } from '../game'

const STAR_WIDTH = 24

export default class Authoring extends PureComponent {
  render () {
    const { top, left, score } = this.props
    const starsCount = calcStarsCount(score)
    const leftWithOffset = left - starsCount * STAR_WIDTH * 0.5
    const stars = []
    for (let i = 0; i < starsCount; i++) {
      stars.push(<FontIcon key={i} value='star' />)
    }
    return (
      <div className='rating' style={{ top, left: leftWithOffset, position: 'absolute' }}>{ stars }</div>
    )
  }
}
