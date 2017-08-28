import React, { PureComponent } from 'react'
import styles from '../../css/ramp-distance-label.less'

const OFFSET = -50 // px

function getOffset (angle) {
  // rotate by angle
  return {
    x: -OFFSET * Math.sin(angle),
    y: OFFSET * Math.cos(angle)
  }
}

export default class RampDistanceLabel extends PureComponent {
  render () {
    const { x, y, angle, distance } = this.props
    const offset = getOffset(angle)
    // console.log(offset)
    // const offset = {x: 0, y: 0}
    return (
      <span className={styles.label} style={{
        left: x + offset.x,
        top: y + offset.y,
        transform: `translate(-50%, -50%) rotate(${angle * 180 / Math.PI}deg)`
      }}>
        Distance up ramp
        <div className={styles.reading}>
          { distance.toFixed(2) }
        </div>
      </span>
    )
  }
}



