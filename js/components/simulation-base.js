/* global iframePhone */
import React, { PureComponent } from 'react'
import Dialog from 'react-toolbox/lib/dialog'
import Ramp from './ramp'
import Ground, { GROUND_HEIGHT } from './ground'
import InclineControl from './incline-control'
import Controls from './controls'
import ConfirmationDialog from './confirmation-dialog'
import AttemptsStatus from './attempts-status'
import ChallengeStatus from './challenge-status'
import * as c from '../sim-constants'
import ArrowImage from './arrow-image'
import VehicleImage, { VEHICLE_IMAGES } from './vehicle-image'
import StarRating from './star-rating'
import RampDistanceLabel from './ramp-distance-label'
import CarHeightLine from './car-height-line'
import GameTarget from './game-target'
import { calcOutputs, calcRampLength, calcRampAngle } from '../physics'
import { calcGameScore, calcStarsCount, challenges, MIN_SCORE_TO_ADVANCE,
        MIN_SCORE_TO_AVOID_HINTS, MIN_SCORE_TO_AVOID_REMEDIATION } from '../game'
import CodapHandler, { generateCodapData } from '../codap-handler'
import config from '../config'
import dialogTheme from '../../css/dialog-theme.less'

import { Layer, Stage } from 'react-konva'

function getScaleX (pixelMeterRatio) {
  return function scaleX (worldX) {
    return (worldX - c.minX) * pixelMeterRatio
  }
}

function getScaleY (pixelMeterRatio) {
  return function scaleY (worldY) {
    return (c.maxY - worldY) * pixelMeterRatio
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

      attemptSet: 0,
      runNumber: 1,
      gravity: config.inputs.gravity.defaultValue,
      mass: config.inputs.mass.defaultValue,
      surfaceFriction: config.inputs.surfaceFriction.defaultValue,
      rampTopX: -2,
      rampTopY: 2,
      initialCarX: -1.75,
      elapsedTime: 0,

      challengeIdx: config.game ? 0 : null,
      stepIdx: config.game ? 0 : null,
      targetX: 1,
      targetWidth: 1,

      runsInChallenge: 0,
      runsInStep: 0,
      successesInChallenge: 0,
      lastScore: null,
      hintableScores: 0,
      remedialScores: 0,

      codapPresent: false,
      dataSaved: false,
      discardDataDialogActive: false,
      discardDataWarningEnabled: true,

      genericDialogActive: false,
      genericDialogMessage: '',

      laraPresent: false,
      returnToActivity: false
    }

    this.codapActions = {
      hasSeenGraphHint: false,
      hasCreatedGraph: false,
      hasPutAttributeOnAxis: false,
      hasPutStartDistanceOnAxis: false,
      hasPutEndDistanceOnAxis: false,
      hasPutFrictionOnAxis: false,
      hasPutAttributeOnLegend: false,
      hasPutChallengeOnLegend: false,
      hasCreatedMovableLine: false,
      hasMovedMovableLine: false,
      hasCreatedRegressionLine: false
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
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.saveData = this.saveData.bind(this)
    this.rafHandler = this.rafHandler.bind(this)
  }

  createComponentHandler = (msg) => {
    if (msg.values.type === 'graph') {
      this.codapActions.hasCreatedGraph = true
    }
  }

  axisAttributeChangeHandler = (msg) => {
    const attr = msg.values.attributeName
    const startDistanceName = config.outputs.startDistanceUpRamp.codapDef.name
    const endDistanceName = config.outputs.endDistance.codapDef.name
    const surfaceFrictionName = config.inputs.surfaceFriction.codapDef.name
    this.codapActions.hasCreatedGraph = true
    this.codapActions.hasPutAttributeOnAxis = true
    if (attr === startDistanceName) {
      this.codapActions.hasPutStartDistanceOnAxis = true
    } else if (attr === endDistanceName) {
      this.codapActions.hasPutEndDistanceOnAxis = true
    } else if (attr === surfaceFrictionName) {
      this.codapActions.hasPutFrictionOnAxis = true
    }
  }

  legendAttributeLogHandler = (msg) => {
    const match = / attribute (.*) }/.exec(msg.values.message)
    const attr = match && match[1]
    this.codapActions.hasPutAttributeOnLegend = true
    if (attr === config.others.challenge.codapDef.name) {
      this.codapActions.hasPutChallengeOnLegend = true
    }
  }

  showMovableLineLogHandler = (msg) => {
    this.codapActions.hasCreatedMovableLine = true
  }

  dragMovableLineLogHandler = (msg) => {
    this.codapActions.hasMovedMovableLine = true
  }

  showRegressionLineLogHandler = (msg) => {
    this.codapActions.hasCreatedRegressionLine = true
  }

  componentDidMount () {
    // Handle CODAP as a parent window.
    this.codapHandler.init()
      .then(_ => {
        console.log('CODAP detected')
        this.setState({ codapPresent: true })
        if (this.codapHandler.state.game) {
          this.loadGameState(this.codapHandler.state)
        }

        this.codapHandler.registerEventHandlers({
          'create': this.createComponentHandler,
          'attributeChange': this.axisAttributeChangeHandler
        })

        this.codapHandler.registerLogHandlers({
          'legendAttributeChange': this.legendAttributeLogHandler,
          'toggleMovableLine: show': this.showMovableLineLogHandler,
          'dragMovableLine': this.dragMovableLineLogHandler,
          'toggleLSRL: show': this.showRegressionLineHandler
        })

        this.codapHandler.retrieveRunNumber((runNumber) => {
          if (runNumber) {
            this.state.runNumber = runNumber + 1
          }
        })
      })
      .catch(msg => {
        console.log('CODAP not available')
      })

    // Handle LARA as a parent window.
    this.laraPhone = iframePhone.getIFrameEndpoint()
    this.laraPhone.addListener('initInteractive', (data) => {
      this.setState({ laraPresent: true })
      if (config.game) {
        const interactiveState = typeof data.interactiveState === 'string' ? JSON.parse(data.interactiveState) : data.interactiveState
        const linkedState = typeof data.linkedState === 'string' ? JSON.parse(data.linkedState) : data.linkedState
        const gameState = interactiveState || linkedState
        if (gameState !== null) {
          this.loadGameState(gameState)
        }
      }
      this.laraPhone.post('supportedFeatures', {
        apiVersion: 1,
        features: {
          interactiveState: true
        }
      })
    })
    this.laraPhone.addListener('getInteractiveState', () => {
      this.saveGameState()
    })

    if (this.challengeActive) {
      this.setupChallenge(null)
    }
  }

  componentWillUpdate (nextProps, nextState) {
    this.outputs = calcOutputs(nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    const { isRunning, attemptSet, challengeIdx, stepIdx, runNumber, elapsedTime } = this.state
    const { width, height } = this.props
    if (isRunning && !prevState.isRunning) {
      if (isNaN(this.outputs.totalTime)) {
        window.alert("Ramp friction is too big, car won't start moving")
        this.setState({
          isRunning: false
        })
      } else {
        // Pass all the CODAP attributes (inputs and outputs) as SimulationStarted params.
        this.log('SimulationStarted', generateCodapData(this.state))
        window.requestAnimationFrame(this.rafHandler)
      }
    }
    if (width !== prevProps.width || height !== prevProps.height) {
      this.setState({
        scaleX: getScaleX(this.pixelMeterRatio),
        scaleY: getScaleY(this.pixelMeterRatio)
      })
    }
    if (config.game && (
          attemptSet !== prevState.attemptSet ||
          challengeIdx !== prevState.challengeIdx ||
          stepIdx !== prevState.stepIdx ||
          runNumber !== prevState.runNumber)) {
      this.setupChallenge(prevState.challengeIdx)
      this.saveGameState()
    }
    if (elapsedTime !== prevState.elapsedTime && elapsedTime === this.outputs.totalTime) {
      this.simulationFinished()
    }
  }

  simulationFinished () {
    const logParams = {}
    if (this.challengeActive) {
      const { attemptSet, stepIdx, targetX, targetWidth } = this.state
      const { carX } = this.outputs
      const score = calcGameScore(carX, targetX, targetWidth)
      let { runsInChallenge, runsInStep, successesInChallenge, hintableScores, remedialScores } = this.state
      ++runsInChallenge
      ++runsInStep
      if (score >= MIN_SCORE_TO_ADVANCE) {
        ++successesInChallenge
      }
      if (score < MIN_SCORE_TO_AVOID_REMEDIATION) {
        ++remedialScores
      } else {
        remedialScores = 0
      }
      if (score < MIN_SCORE_TO_AVOID_HINTS) {
        ++hintableScores
      } else {
        hintableScores = 0
      }

      const challenge = this.challengeActive
      if (challenge) {
        const gameStatus = {
          attemptSet,
          step: stepIdx,
          runsInChallenge,
          runsInStep,
          successesInChallenge,
          score,
          hintableScores,
          remedialScores }

        if (challenge.runFeedback) {
          const feedback = challenge.runFeedback(gameStatus)
          if (feedback) {
            this.showDialogWithMessage(feedback)
          }
        }

        if (challenge.hint && challenge.hint(gameStatus, this.codapActions)) {
          // reset hint counter
          hintableScores = 0
        }
      }

      this.setState({
        lastScore: score,
        runsInChallenge,
        runsInStep,
        successesInChallenge,
        hintableScores,
        remedialScores
      })
      logParams.score = score
      logParams.starScore = calcStarsCount(score)
    }
    this.log('SimulationFinished', logParams)

    if (config.autosave) {
      this.saveData()
    }
  }

  get gameState () {
    const { challengeIdx, stepIdx } = this.state
    return { game: true, challengeIdx, stepIdx }
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
    const xScale = this.simWidth / (c.maxX - c.minX)
    const yScale = (this.simHeight - GROUND_HEIGHT) / (c.maxY - c.minY)
    return Math.min(xScale, yScale)
  }

  get challengeActive () {
    const { challengeIdx } = this.state
    // When game is finished, challengeIdx === challenges.length, so challenges[challengeIdx] === undefined
    return challengeIdx != null && challenges[challengeIdx]
  }

  invScaleX (screenX) {
    return screenX / this.pixelMeterRatio + c.minX
  }

  invScaleY (screenY) {
    return c.maxY - screenY / this.pixelMeterRatio
  }

  saveGameState () {
    const { codapPresent, laraPresent } = this.state
    if (codapPresent) {
      this.codapHandler.setCodapState(this.gameState)
    }
    if (laraPresent) {
      this.laraPhone.post('interactiveState', this.gameState)
    }
  }

  loadGameState (codapState) {
    this.setState({
      challengeIdx: codapState.challengeIdx,
      stepIdx: codapState.stepIdx
    })
  }

  setupNewRun () {
    const { runNumber } = this.state
    this.setState({
      isRunning: false,
      elapsedTime: 0,
      dataSaved: false,
      discardDataDialogActive: false,
      runNumber: runNumber + 1
    })
    if (this.challengeActive) {
      this.updateChallenge()
    }
    this.log('NewRunClicked')
  }

  setupNewRunIfDataSaved () {
    const { codapPresent, dataSaved, discardDataWarningEnabled } = this.state
    if (!codapPresent || (codapPresent && dataSaved) || !discardDataWarningEnabled || config.autosave) {
      // In autosave mode, data will be saved automatically at the end of the run anyway.
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
    this.log('DataDiscarded')
  }

  toggleDiscardDataWarning () {
    const { discardDataWarningEnabled } = this.state
    this.setState({
      discardDataWarningEnabled: !discardDataWarningEnabled
    })
  }

  handleOptionsChange (newOptions) {
    const newState = {}
    Object.keys(newOptions).forEach(name => {
      if (config.inputs[name]) {
        // Simple case, an option is just an input stored in component's state.
        newState[name] = newOptions[name]
      } else if (name === 'rampAngle') {
        // It means that user wants to change some property which isn't treated as model input.
        // It needs to be translated to model inputs update.
        this.updateRampAngle(newOptions.rampAngle * Math.PI / 180)
      } else if (name === 'startHeightAboveGround') {
        this.updateCarHeightOffGround(newOptions.startHeightAboveGround)
      } else if (name === 'startDistanceUpRamp') {
        this.updateDistanceUpRamp(newOptions.startDistanceUpRamp)
      }
    })
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

  handleInclineChange (newXScreen, newYScreen) {
    if (!this.draggingActive) {
      return
    }
    this.updateRampTopPos(this.invScaleX(newXScreen), this.invScaleY(newYScreen))
  }

  updateRampAngle (newAngle) {
    function getNewY (newX) {
      return Math.max(c.minRampTopY, Math.min(c.maxRampTopY, c.rampBottomY + Math.abs(newX - c.rampEndX) * Math.tan(newAngle)))
    }
    function getNewX (newY) {
      return Math.max(c.minRampTopX, Math.min(c.maxRampTopX, c.rampEndX - Math.abs(newY - c.rampBottomY) / Math.tan(newAngle)))
    }
    // Angle isn't stored as model input, so it needs to be translated to ramp top point position.
    newAngle = Math.min(Math.PI * 0.5 - 1e-4, Math.max(1e-4, Number(newAngle)))
    const { rampTopX, rampTopY } = this.state
    let newX = rampTopX
    let newY = rampTopY
    if (newAngle < this.outputs.rampAngle) {
      newX = getNewX(newY)
      if (calcRampAngle(newX, newY) !== newAngle) {
        newY = getNewY(newX)
      }
    } else {
      newY = getNewY(newX)
      if (calcRampAngle(newX, newY) !== newAngle) {
        newX = getNewX(newY)
      }
    }
    this.updateRampTopPos(newX, newY)
  }

  updateRampTopPos (newXWorld, newYWorld) {
    if (newXWorld < c.minRampTopX) {
      newXWorld = c.minRampTopX
    } else if (newXWorld > c.maxRampTopX) {
      newXWorld = c.maxRampTopX
    }
    if (newYWorld < c.minRampTopY) {
      newYWorld = c.minRampTopY
    } else if (newYWorld > c.maxRampTopY) {
      newYWorld = c.maxRampTopY
    }

    const newCarRampDist = Math.min(this.outputs.startDistanceUpRamp, calcRampLength(newXWorld, newYWorld))
    this.setState({
      rampTopX: newXWorld,
      rampTopY: newYWorld,
      initialCarX: c.rampEndX - newCarRampDist * Math.cos(calcRampAngle(newXWorld, newYWorld))
    })
  }

  updateCarHeightOffGround (newHeight) {
    const { rampAngle } = this.outputs
    const { rampTopX } = this.state
    const newCarX = c.rampEndX - newHeight / Math.tan(rampAngle)
    this.setState({
      initialCarX: Math.min(c.rampEndX - 1e-6, Math.max(rampTopX, newCarX))
    })
  }

  updateDistanceUpRamp (newDist) {
    const { rampAngle } = this.outputs
    const { rampTopX } = this.state
    const newCarX = c.rampEndX - newDist * Math.cos(rampAngle)
    this.setState({
      initialCarX: Math.min(c.rampEndX - 1e-6, Math.max(rampTopX, newCarX))
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

  handleMouseEnter () {
    this.log('MouseEntered')
  }

  handleMouseLeave () {
    this.log('MouseLeft')
  }

  saveData () {
    const { codapPresent } = this.state
    if (codapPresent) {
      this.codapHandler.generateAndSendData(this.state)
      this.log('DataSaved')
    }
    this.setState({ dataSaved: true })
  }

  setupChallenge (prevChallengeIdx) {
    const { attemptSet, challengeIdx, stepIdx, initialCarX, surfaceFriction,
            targetX, returnToActivity } = this.state
    const challenge = challenges[challengeIdx]
    if (!challenge) {
      this.gameCompleted()
      return
    }

    function nextTargetX () {
      const minTargetMove = challenge.minTargetMove ? challenge.minTargetMove(c.runoffEndX) : 0
      let newTargetX, diffTargetX
      do {
        newTargetX = challenge.targetX(attemptSet)
        diffTargetX = targetX ? Math.abs(newTargetX - targetX) : 0
      } while (diffTargetX < minTargetMove)
      return newTargetX
    }

    this.setState({
      targetX: nextTargetX(),
      targetWidth: challenge.targetWidth(stepIdx),
      mass: challenge.mass,
      carDragging: challenge.carDragging,
      inclineControl: challenge.inclineControl,
      disabledInputs: challenge.disabledInputs,
      surfaceFriction: challenge.surfaceFriction ? challenge.surfaceFriction(attemptSet) : surfaceFriction,
      initialCarX: challenge.initialCarX ? challenge.initialCarX(attemptSet) : initialCarX,
      lastScore: null
    })

    if (challengeIdx !== prevChallengeIdx && !returnToActivity) {
      this.showDialogWithMessage(challenge.message)
    }
  }

  updateChallenge () {
    const { challengeIdx, stepIdx, lastScore } = this.state
    const challenge = challenges[challengeIdx]
    const nextChallenge = challenges[challengeIdx + 1]
    let { attemptSet, runsInChallenge, runsInStep, successesInChallenge, remedialScores } = this.state
    const progress = { stepIdx, runsInChallenge, runsInStep, score: lastScore, remedialScores }
    let newAttemptSet = attemptSet
    let newChallengeIdx = challengeIdx
    let newStepIdx = stepIdx
    let returnToActivity = false
    if (challenge.maxRunsInChallenge && (runsInChallenge >= challenge.maxRunsInChallenge)) {
      this.showDialogWithMessage(challenge.runsExhaustedMsg)
      newAttemptSet = attemptSet + 1
      newStepIdx = 0
      runsInChallenge = 0
      // note that we don't reset successesInChallenge -- it's cumulative
      remedialScores = 0
    } else if (challenge.loseStep && challenge.loseStep(progress)) {
      // one step back
      if (stepIdx > 0) {
        newStepIdx = stepIdx - 1
        remedialScores = 0
      }
    } else if (lastScore >= MIN_SCORE_TO_ADVANCE && stepIdx + 1 < challenge.steps) {
      // Next step.
      newStepIdx = stepIdx + 1
    } else if (lastScore >= MIN_SCORE_TO_ADVANCE && stepIdx + 1 === challenge.steps && nextChallenge) {
      // Next challenge.
      newAttemptSet = 0
      newChallengeIdx = challengeIdx + 1
      newStepIdx = 0
      returnToActivity = config.returnToActivity
    } else if (lastScore >= MIN_SCORE_TO_ADVANCE && stepIdx + 1 === challenge.steps && !nextChallenge) {
      // End of the game.
      newAttemptSet = 0
      newChallengeIdx = challengeIdx + 1
      newStepIdx = 0
    }

    if (newChallengeIdx !== challengeIdx) {
      runsInChallenge = 0
      successesInChallenge = 0
    }
    if ((newChallengeIdx !== challengeIdx) || (newStepIdx !== stepIdx)) {
      runsInStep = 0
    }

    this.setState({
      attemptSet: newAttemptSet,
      challengeIdx: newChallengeIdx,
      stepIdx: newStepIdx,
      runsInChallenge,
      runsInStep,
      successesInChallenge,
      remedialScores,
      returnToActivity
    })
  }

  gameCompleted () {
    this.setState({
      inclineControl: true,
      carDragging: true,
      disabledInputs: []
    })
    this.showDialogWithMessage('Congratulations. You’ve won! Click "Return to activity" and answer the questions there.')
  }

  jumpToChallenge (challengeIdx) {
    this.setState({
      challengeIdx,
      stepIdx: 0,
      returnToActivity: false
    })
  }

  log (action, params) {
    const { codapPresent, laraPresent } = this.state
    if (codapPresent) {
      this.codapHandler.log(action, params)
    } else if (laraPresent) {
      const attrs = { action }
      if (params) {
        attrs.data = params
      }
      this.laraPhone.post('log', attrs)
    }
  }

  render () {
    const { rampTopX, rampTopY, scaleX, scaleY, codapPresent, dataSaved, discardDataDialogActive,
      elapsedTime, discardDataWarningEnabled, targetX, targetWidth, carDragging, inclineControl,
      attemptSet, challengeIdx, stepIdx, lastScore, runsInChallenge, disabledInputs, genericDialogActive,
      genericDialogMessage, returnToActivity } = this.state
    const origin = { x: scaleX(0), y: scaleY(0) }
    const marginX = Math.max((origin.x - 60) / 2, 28)
    const carLoc = { x: Math.round(marginX), y: Math.round(origin.y + 27) }
    const carCoords = { x: this.invScaleX(carLoc.x), y: this.invScaleY(carLoc.y) }
    const textLoc = { x: carLoc.x + 35, y: Math.round(origin.y + 7) }
    const vehicle = VEHICLE_IMAGES[attemptSet % VEHICLE_IMAGES.length]
    const { simulationFinished, carX, carY, rampAngle, carAngle, startDistanceUpRamp } = this.outputs
    const simulationStarted = elapsedTime > 0
    return (
      <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <Controls
          options={this.state} setOptions={this.handleOptionsChange}
          outputs={this.outputs}
          setupNewRun={this.setupNewRunIfDataSaved}
          saveData={!config.autosave && codapPresent ? this.saveData : false}
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
            <ArrowImage sx={scaleX} sy={scaleY} x={carX} y={carY} angle={carAngle} />
            <VehicleImage vehicle={vehicle} sx={scaleX} sy={scaleY} x={carX} y={carY} angle={carAngle}
              onUnallowedDrag={this.handleUnallowedCarDrag}
              draggable={this.draggingActive && carDragging}
              onDrag={this.handleCarPosChange} />
            {
              !simulationStarted && config.outputs.startHeightAboveGround.showInMainView &&
              <CarHeightLine sx={scaleX} sy={scaleY} carX={carX} carY={carY} />
            }
            {
              this.challengeActive &&
              <VehicleImage vehicle={vehicle} sx={scaleX} sy={scaleY} x={carCoords.x} y={carCoords.y} />
            }
          </Layer>
        </Stage>
        {
          !simulationStarted && config.outputs.startDistanceUpRamp.showInMainView &&
          <RampDistanceLabel x={scaleX(carX)} y={scaleY(carY)} angle={rampAngle} distance={startDistanceUpRamp} />
        }
        {
          this.challengeActive &&
          <StarRating left={scaleX(carX)} top={scaleY(0) - 45} score={lastScore} />
        }
        {
          this.challengeActive &&
          <ChallengeStatus challengeIdx={challengeIdx} stepIdx={stepIdx} />
        }
        {
          this.challengeActive &&
          <AttemptsStatus loc={textLoc} challengeIdx={challengeIdx} runsInChallenge={runsInChallenge} />
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
        <Dialog
          theme={dialogTheme}
          active={this.challengeActive && returnToActivity}
        >
          {/* Note that this dialog cannot be closed. It's intentional. User has to go back to LARA and go to the next page. */}
          Congratulations! You have completed Challenge { challengeIdx }.
          Click the <strong>"Return to activity"</strong> link and answer the questions there.
          <div className={dialogTheme.hidden}>
            Jump to:
            {
              challenges.map((challenge, idx) => {
                return <a key={idx} onClick={this.jumpToChallenge.bind(this, idx)}>Challenge { idx + 1}</a>
              })
            }
          </div>
        </Dialog>
      </div>
    )
  }
}
