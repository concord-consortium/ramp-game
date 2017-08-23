import React, { PureComponent } from 'react'
import { challenges } from '../game'

import '../../css/challenge-status.less'

export default class ChallengeStatus extends PureComponent {
  render () {
    const { challengeIdx, stepIdx, lastScore, message, top, height, width } = this.props
    const challenge = challenges[challengeIdx]
    return (
      <div className='challenge-status' style={{ top, height, width }}>
        <div className='content'>
          <div className='headers'>
            <h3>Challenge { challengeIdx + 1 } of { challenges.length }</h3>
            <h4>Step { stepIdx + 1 } of { challenge.steps }</h4>
            <h4 style={{visibility: lastScore === null ? 'hidden' : ''}}>Last score: <span className='score'>{ lastScore }</span></h4>
          </div>
          <div className='message'>
            { message }
          </div>
        </div>
      </div>
    )
  }
}
