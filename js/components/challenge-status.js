import React, { PureComponent } from 'react'
import { challenges } from '../game'
import StepChangeMessage from './step-change-message'
import styles from '../../css/challenge-status.less'

function renderDots (count) {
  let result = ''
  for (let i = 0; i < count; i += 1) {
    result += '• '
  }
  return result
}

export default class ChallengeStatus extends PureComponent {
  render () {
    const { challengeIdx, stepIdx } = this.props
    const challenge = challenges[challengeIdx]
    return (
      <div className={styles.challengeStatus}>
        <h3>Challenge { challengeIdx + 1 }</h3>
        <h4>
          <span className={styles.dark}>{ renderDots(stepIdx + 1) }</span>
          { renderDots(challenge.steps - stepIdx - 1) }
        </h4>
        <StepChangeMessage challengeIdx={challengeIdx} stepIdx={stepIdx} />
      </div>
    )
  }
}
