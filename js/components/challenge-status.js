import React, { PureComponent } from 'react'
import { challenges, getStarsSymbols } from '../game'
import styles from '../../css/challenge-status.less'

export default class ChallengeStatus extends PureComponent {
  render () {
    const { challengeIdx, stepIdx, lastScore, message, top, height, width } = this.props
    const challenge = challenges[challengeIdx]
    return (
      <div className={styles.challengeStatus} style={{ top, height, width }}>
        <div className={styles.content}>
          <div className={styles.headers}>
            <h3>Challenge { challengeIdx + 1 } of { challenges.length }</h3>
            <h4>Step { stepIdx + 1 } of { challenge.steps }</h4>
            <h4 style={{visibility: lastScore === null ? 'hidden' : ''}}>Last score: { getStarsSymbols(lastScore) }</h4>
          </div>
          <div className={styles.message}>
            { message }
          </div>
        </div>
      </div>
    )
  }
}
