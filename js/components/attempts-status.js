import React, { PureComponent } from 'react'
import { challenges } from '../game'
import styles from '../../css/attempts-status.less'

export default class AttemptsStatus extends PureComponent {
  render () {
    const { loc, challengeIdx, runsInChallenge } = this.props
    const challenge = challenges[challengeIdx]
    const attemptsRemaining = challenge.maxRunsInChallenge - runsInChallenge
    const textClass = attemptsRemaining <= 12 ? 'red' : ''
    const style = { left: loc.x, top: loc.y }
    const colorStyle = attemptsRemaining <= 3
                        ? { backgroundColor: '#d7170e', paddingTop: 1, paddingLeft: 3, paddingRight: 3 }
                        : {}
    return (
      <div className={styles.attemptsStatus} style={style}>
        <h5 className={textClass} style={colorStyle}>x {attemptsRemaining}</h5>
      </div>
    )
  }
}
