import React, { PureComponent } from 'react'
import Dialog from 'react-toolbox/lib/dialog'
import Ramp from './ramp'
import Ground, { GROUND_HEIGHT } from './ground'
import InclineControl from './incline-control'
import Controls from './controls'
import ConfirmationDialog from './confirmation-dialog'
import ChallengeStatus from './challenge-status'
import c from '../sim-constants'
import VehicleImage from './vehicle-image'
import StarRating from './star-rating'
import RampDistanceLabel from './ramp-distance-label'
import GameTarget from './game-target'
import { calcOutputs, calcRampLength, calcRampAngle } from '../physics'
import { calcGameScore, challenges, MIN_SCORE_TO_ADVANCE } from '../game'
import CodapHandler from '../codap-handler'
import config from '../config'
import dialogTheme from '../../css/dialog-theme.less'

import { Layer, Stage } from 'react-konva'

// MKS units are used everywhere: meters, kilograms and seconds.
const MIN_X = -2.3
const MIN_Y = 0
const MAX_X = 5.05
const MAX_Y = 3

function getScaleX (pixelMeterRatio) {
  return function scaleX (worldX) {
    return (worldX - MIN_X) * pixelMeterRatio
  }
}

function getScaleY (pixelMeterRatio) {
  return function scaleY (worldY) {
    return (MAX_Y - worldY) * pixelMeterRatio
  }
}

export default class SimulationBase extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      scaleX: getScaleX(this.pixelMeterRatio),
      scaleY: getScaleY(this.pixelMeterRatio),

      isRunning: false,
      carDragging: true,
      inclineControl: true,
      disabledInputs: [],

      gravity: config.inputs.gravity.defaultValue,
      mass: config.inputs.mass.defaultValue,
      surfaceFriction: config.inputs.surfaceFriction.defaultValue,
      rampTopX: -2,
      rampTopY: 2,
      initialCarX: -1,
      elapsedTime: 0,

      challengeIdx: config.game ? 0 : null,
      stepIdx: config.game ? 0 : null,
      targetX: 1,
      targetWidth: 1,
      lastScore: null,
      gameCompleted: false,

      codapPresent: false,
      dataSaved: false,
      discardDataDialogActive: false,
      discardDataWarningEnabled: true,

      genericDialogActive: false,
      genericDialogMessage: ''
    }

    this.outputs = calcOutputs(this.state)

    this.codapHandler = new CodapHandler()

    this.setupNewRun = this.setupNewRun.bind(this)
    this.setupNewRunIfDataSaved = this.setupNewRunIfDataSaved.bind(this)
    this.hideGenericDialog = this.hideGenericDialog.bind(this)
    this.hideDiscardDataDialog = this.hideDiscardDataDialog.bind(this)
    this.toggleDiscardDataWarning = this.toggleDiscardDataWarning.bind(this)
    this.handleOptionsChange = this.handleOptionsChange.bind(this)
    this.handleInclineChange = this.handleInclineChange.bind(this)
    this.handleCarPosChange = this.handleCarPosChange.bind(this)
    this.handleUnallowedCarDrag = this.handleUnallowedCarDrag.bind(this)
    this.saveData = this.saveData.bind(this)
    this.rafHandler = this.rafHandler.bind(this)
  }

  componentDidMount () {
    this.codapHandler.init()
      .then(_ => {
        this.setState({ codapPresent: true })
      })
      .catch(msg => {
        console.log('CODAP not available')
      })

    if (this.challengeActive) {
      this.setupChallenge(null)
    }
  }

  componentWillUpdate (nextProps, nextState) {
    this.outputs = calcOutputs(nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    const { isRunning, challengeIdx, stepIdx, elapsedTime } = this.state
    const { width, height } = this.props
    if (isRunning && !prevState.isRunning) {
      if (isNaN(this.outputs.totalTime)) {
        window.alert("Ramp friction is too big, car won't start moving")
        this.setState({
          isRunning: false
        })
      } else {
        window.requestAnimationFrame(this.rafHandler)
      }
    }
    if (width !== prevProps.width || height !== prevProps.height) {
      this.setState({
        scaleX: getScaleX(this.pixelMeterRatio),
        scaleY: getScaleY(this.pixelMeterRatio)
      })
    }
    if (challengeIdx !== prevState.challengeIdx || stepIdx !== prevState.stepIdx) {
      this.setupChallenge(prevState.challengeIdx)
    }
    if (this.challengeActive && elapsedTime === this.outputs.totalTime) {
      this.calculateGameScore()
    }
  }

  get draggingActive () {
    const { elapsedTime } = this.state
    return elapsedTime === 0
  }

  get simWidth () {
    return this.props.width
  }

  get simHeight () {
    return this.props.height
  }

  get pixelMeterRatio () {
    const xScale = this.simWidth / (MAX_X - MIN_X)
    const yScale = (this.simHeight - GROUND_HEIGHT) / (MAX_Y - MIN_Y)
    return Math.min(xScale, yScale)
  }

  get challengeActive () {
    const { challengeIdx, gameCompleted } = this.state
    return challengeIdx !== null && !gameCompleted
  }

  invScaleX (screenX) {
    return screenX / this.pixelMeterRatio + MIN_X
  }

  invScaleY (screenY) {
    return MAX_Y - screenY / this.pixelMeterRatio
  }

  setupNewRun () {
    this.setState({
      isRunning: false,
      elapsedTime: 0,
      dataSaved: false,
      discardDataDialogActive: false
    })
    if (this.challengeActive) {
      this.updateChallenge()
    }
  }

  setupNewRunIfDataSaved () {
    const { codapPresent, dataSaved, discardDataWarningEnabled } = this.state
    if (!codapPresent || (codapPresent && dataSaved) || !discardDataWarningEnabled) {
      this.setupNewRun()
    } else {
      this.setState({
        discardDataDialogActive: true
      })
    }
  }

  showDialogWithMessage (msg) {
    this.setState({
      genericDialogActive: true,
      genericDialogMessage: msg
    })
  }

  hideGenericDialog () {
    this.setState({
      genericDialogActive: false
    })
  }

  hideDiscardDataDialog () {
    this.setState({
      discardDataDialogActive: false
    })
  }

  toggleDiscardDataWarning () {
    const { discardDataWarningEnabled } = this.state
    this.setState({
      discardDataWarningEnabled: !discardDataWarningEnabled
    })
  }

  handleOptionsChange (newOptions) {
    this.setState(newOptions)
  }

  rafHandler (timestamp) {
    const { elapsedTime, isRunning } = this.state
    if (isRunning) {
      window.requestAnimationFrame(this.rafHandler)
    } else {
      this._prevTime = null
      return
    }
    if (!this._prevTime) {
      this._prevTime = timestamp
      return
    }
    const dt = timestamp - this._prevTime
    this._prevTime = timestamp
    const newElapsedTime = Math.min(this.outputs.totalTime, elapsedTime + dt / 1000)
    this.setState({
      elapsedTime: newElapsedTime,
      isRunning: newElapsedTime < this.outputs.totalTime
    })
  }

  calculateGameScore () {
    const { targetX, targetWidth } = this.state
    const { carX } = this.outputs
    const score = calcGameScore(carX, targetX, targetWidth)
    this.setState({
      lastScore: score
    })
  }

  handleInclineChange (newXScreen, newYScreen) {
    if (!this.draggingActive) {
      return
    }
    let newXWorld = this.invScaleX(newXScreen)
    let newYWorld = this.invScaleY(newYScreen)
    if (newXWorld < c.rampStartX + 0.3) {
      newXWorld = c.rampStartX + 0.3
    } else if (newXWorld > c.rampEndX - 1e-4) {
      // 1e-4 so angle is never 90 deg and we don't need to handle it in a special way.
      newXWorld = c.rampEndX - 1e-4
    }
    if (newYWorld < c.rampBottomY + 0.2) {
      newYWorld = c.rampBottomY + 0.2
    } else if (newYWorld > MAX_Y - 0.2) {
      newYWorld = MAX_Y - 0.2
    }

    const newCarRampDist = Math.min(this.outputs.startDistanceUpRamp, calcRampLength(newXWorld, newYWorld))
    this.setState({
      rampTopX: newXWorld,
      rampTopY: newYWorld,
      initialCarX: c.rampEndX - newCarRampDist * Math.cos(calcRampAngle(newXWorld, newYWorld))
    })
  }

  handleCarPosChange (newXScreen, newYScreen) {
    const { rampTopX, rampTopY } = this.state
    if (!this.draggingActive) {
      return
    }
    let newXWorld = this.invScaleX(newXScreen)
    let newYWorld = this.invScaleY(newYScreen)
    const rampAngle = this.outputs.rampAngle
    if (rampAngle < Math.PI * 0.33) {
      // control via X
      if (newXWorld < rampTopX) {
        newXWorld = rampTopX
      } else if (newXWorld > c.rampEndX) {
        newXWorld = c.rampEndX
      }
    } else {
      // control via Y
      if (newYWorld < c.rampBottomY) {
        newYWorld = c.rampBottomY
      } else if (newYWorld > rampTopY) {
        newYWorld = rampTopY
      }
      newXWorld = c.rampEndX - (newYWorld - c.rampBottomY) / Math.tan(rampAngle)
    }
    this.setState({
      initialCarX: Math.min(newXWorld, c.rampEndX - 1e-6)
    })
  }

  handleUnallowedCarDrag () {
    if (this.challengeActive) {
      const { challengeIdx } = this.state
      const challenge = challenges[challengeIdx]
      if (challenge.unallowedCarDragMsg) {
        this.showDialogWithMessage(challenge.unallowedCarDragMsg)
      }
    }
  }

  saveData () {
    const { codapPresent } = this.state
    if (codapPresent) {
      this.codapHandler.generateAndSendData(this.state)
    }
    this.setState({ dataSaved: true })
  }

  setupChallenge (prevChallengeIdx) {
    const { challengeIdx, stepIdx, initialCarX } = this.state
    const challenge = challenges[challengeIdx]
    this.setState({
      targetX: challenge.targetX(stepIdx),
      targetWidth: challenge.targetWidth(stepIdx),
      mass: challenge.mass,
      surfaceFriction: challenge.surfaceFriction,
      carDragging: challenge.carDragging,
      inclineControl: challenge.inclineControl,
      disabledInputs: challenge.disabledInputs,
      initialCarX: challenge.initialCarX !== undefined ? challenge.initialCarX : initialCarX,
      lastScore: null
    })

    if (challengeIdx !== prevChallengeIdx) {
      this.showDialogWithMessage(challenge.message)
    }
  }

  updateChallenge () {
    const { challengeIdx, stepIdx, lastScore } = this.state
    const challenge = challenges[challengeIdx]
    let newStepIdx = stepIdx
    let newChallengeIdx = challengeIdx
    if (lastScore >= MIN_SCORE_TO_ADVANCE && stepIdx + 1 < challenge.steps) {
      newStepIdx = stepIdx + 1
    } else if (lastScore >= MIN_SCORE_TO_ADVANCE && challenges[challengeIdx + 1]) {
      newChallengeIdx = challengeIdx + 1
      newStepIdx = 0
    } else if (lastScore >= MIN_SCORE_TO_ADVANCE && !challenges[challengeIdx + 1]) {
      this.gameCompleted()
      return
    }
    this.setState({
      challengeIdx: newChallengeIdx,
      stepIdx: newStepIdx
    })
  }

  gameCompleted () {
    this.setState({
      inclineControl: true,
      disabledInputs: [],
      gravity: config.inputs.gravity.defaultValue,
      mass: config.inputs.mass.defaultValue,
      surfaceFriction: config.inputs.surfaceFriction.defaultValue,
      gameCompleted: true
    })
    this.showDialogWithMessage('Congratulations. You’ve won! Click "Return to activity" and answer the questions there.')
  }

  render () {
    const { rampTopX, rampTopY, scaleX, scaleY, codapPresent, dataSaved, discardDataDialogActive, elapsedTime,
      discardDataWarningEnabled, targetX, targetWidth, carDragging, inclineControl, challengeIdx, stepIdx, lastScore,
      disabledInputs, genericDialogActive, genericDialogMessage } = this.state
    const { simulationFinished, carX, carY, rampAngle, carAngle, startDistanceUpRamp } = this.outputs
    const simulationStarted = elapsedTime > 0
    return (
      <div>
        <Controls
          options={this.state} setOptions={this.handleOptionsChange}
          outputs={this.outputs}
          setupNewRun={this.setupNewRunIfDataSaved}
          saveData={codapPresent ? this.saveData : false}
          dataSaved={dataSaved}
          simFinished={simulationFinished}
          disabledInputs={disabledInputs}
          challengeActive={this.challengeActive}
        />
        <Stage width={this.simWidth} height={this.simHeight}>
          <Layer>
            <Ramp sx={scaleX} sy={scaleY} pointX={rampTopX} pointY={rampTopY} angle={rampAngle} />
            <Ground sx={scaleX} sy={scaleY} pixelMeterRatio={this.pixelMeterRatio} />
            {
              inclineControl &&
              <InclineControl x={scaleX(rampTopX)} y={scaleY(rampTopY)}
                draggable={this.draggingActive} onDrag={this.handleInclineChange} />
            }
            {
              this.challengeActive &&
              <GameTarget sx={scaleX} sy={scaleY} pixelMeterRatio={this.pixelMeterRatio} x={targetX} width={targetWidth} />
            }
            <VehicleImage sx={scaleX} sy={scaleY} x={carX} y={carY} angle={carAngle} onUnallowedDrag={this.handleUnallowedCarDrag}
              draggable={this.draggingActive && carDragging} onDrag={this.handleCarPosChange} />
          </Layer>
        </Stage>
        {
          !simulationStarted &&
          <RampDistanceLabel x={scaleX(carX)} y={scaleY(carY)} angle={rampAngle} distance={startDistanceUpRamp} />
        }
        {
          this.challengeActive &&
          <StarRating left={scaleX(carX)} top={scaleY(0) - 45} score={lastScore} />
        }
        {
          config.game &&
          <ChallengeStatus challengeIdx={challengeIdx} stepIdx={stepIdx} />
        }
        <ConfirmationDialog
          title='Discard data?'
          active={discardDataDialogActive}
          dontShowAgain={!discardDataWarningEnabled}
          onHide={this.hideDiscardDataDialog}
          onConfirm={this.setupNewRun}
          onDontShowAgainToggle={this.toggleDiscardDataWarning}
        >
          Pressing "New run" without pressing "Save data" will discard the current data.
          Set up a new run without saving the data first?
        </ConfirmationDialog>
        <Dialog
          theme={dialogTheme}
          active={genericDialogActive}
          actions={[ { label: 'OK', onClick: this.hideGenericDialog } ]}
          onEscKeyDown={this.hideGenericDialog}
          onOverlayClick={this.hideGenericDialog}
        >
          { genericDialogMessage }
        </Dialog>
      </div>
    )
  }
}
