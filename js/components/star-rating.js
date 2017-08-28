import React, { PureComponent } from 'react'
import { calcStarsCount } from '../game'
import styles from '../../css/star-rating.less'

const STAR_WIDTH = 22

export default class StarRating extends PureComponent {
  render () {
    const { top, left, score } = this.props
    const starsCount = calcStarsCount(score)
    const leftWithOffset = left - starsCount * STAR_WIDTH * 0.5
    let stars = ''
    for (let i = 0; i < starsCount; i++) {
      stars += '★'
    }
    return (
      <div className={styles.starRating} style={{ top, left: leftWithOffset }}>{ stars }</div>
    )
  }
}
