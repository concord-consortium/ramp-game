import React, { PureComponent } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import styles from '../../css/step-change-message.css'

const Fade = ({ classNames, duration, children, ...props }) => (
  <CSSTransition
    {...props}
    timeout={duration}
    classNames={classNames}
  >
    {children}
  </CSSTransition>
)

export default class StepChangeMessage extends PureComponent {
  constructor (...args) {
    super(...args)
    this.state = { show: false, visibility: 'hidden' }
  }
  componentWillReceiveProps (nextProps) {
    const newChallenge = this.props.challengeIdx !== nextProps.challengeIdx
    const newStep = this.props.stepIdx !== nextProps.stepIdx
    if (!newChallenge && newStep) {
      this.setState({ show: true })
    }
  }
  handleEnter = (node) => {
    this.setState({ visibility: 'visible' })
  }
  handleEntered = (node) => {
    setTimeout(() => { this.setState({ show: false }) }, 500)
  }
  handleExited = (node) => {
    this.setState({ visibility: 'hidden' })
  }
  render () {
    const { stepIdx } = this.props
    const classNames = {
      enter: styles['stepChangeMessage-enter'],
      enterActive: styles['stepChangeMessage-enter-active'],
      exit: styles['stepChangeMessage-exit'],
      exitActive: styles['stepChangeMessage-exit-active']
    }
    const durations = 600
    return (
      <div className={styles.stepChangeMessage} style={{ visibility: this.state.visibility }}>
        <Fade classNames={classNames} duration={durations} in={this.state.show}
          onEnter={this.handleEnter} onEntered={this.handleEntered} onExited={this.handleExited}>
          <h5>Step { stepIdx + 1 }</h5>
        </Fade>
      </div>
    )
  }
}
