import type { PinPulledHandler } from '../pin'
import clearImage from '../images/clear_2.webp'
import failImage from '../images/fail_2.webp'
import {
  createStageFlow,
  type StageControllerOptions,
  type StageFlowState,
} from './stageFlow'

export type Stage2State = StageFlowState & {
  connectionReleased: boolean
  pipeConnected: boolean
  directFailOpen: boolean
  waterReachedConnection: boolean
}

export const createStage2Controller = (
  container: ParentNode,
  options: StageControllerOptions,
) => {
  const stage = container.querySelector<HTMLElement>('[data-stage="2"]')!
  const connectorMotion = stage.querySelector<SVGGElement>(
    '.connectpipe__motion',
  )!
  const dropDistance = Number(connectorMotion.dataset.dropDistance)
  const state: Stage2State = {
    waterReleased: false,
    waterReachedBranch: false,
    connectionReleased: false,
    pipeConnected: false,
    directFailOpen: false,
    waterReachedConnection: false,
    result: 'playing',
  }
  let connectionAnimation: Animation | undefined
  const flow = createStageFlow(stage, state, {
    ...options,
    clearImage,
    failImage,
    onFinish: () => {
      // ゴール到達後に部品が着地して接続状態を変えないようにする。
      if (connectionAnimation) {
        connectionAnimation.onfinish = null
        connectionAnimation.pause()
      }
      options.onFinish()
    },
  })

  const flowToFailGoal = () => {
    flow.flowWater('water-fail-goal', () => flow.finishStage('fail'))
  }

  const flowFromConnection = () => {
    state.waterReachedConnection = true
    // ピンを抜いただけでは接続されない。水の到達前に着地している必要がある。
    if (state.pipeConnected) {
      flow.flowWater('water-bridge', () => {
        flow.flowWater('water-clear-goal', () => flow.finishStage('clear'))
      })
    } else {
      flow.flowWater('water-falling-water', () => {
        flow.flowWater('water-lower-fail', flowToFailGoal)
      })
    }
  }

  const releaseConnection = () => {
    if (state.connectionReleased) return

    state.connectionReleased = true
    connectionAnimation = connectorMotion.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: `translateY(${dropDistance}px)` },
      ],
      { duration: 450, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
    )
    connectionAnimation.onfinish = () => {
      if (!flow.isPlaying()) return

      connectorMotion.setAttribute('transform', `translate(0 ${dropDistance})`)
      connectionAnimation!.onfinish = null
      connectionAnimation!.cancel()
      connectionAnimation = undefined
      state.pipeConnected = true
      stage.classList.add('waterflow--pipe-connected')
    }
  }

  const onPinPulled: PinPulledHandler = (pinNumber) => {
    if (!flow.isPlaying()) return

    const action = stage.querySelector<SVGGElement>(
      `.pin[data-pin="${pinNumber}"]`,
    )?.dataset.action
    if (action === 'open-fail-route') state.directFailOpen = true
    if (action === 'release-connection') releaseConnection()
    if (action === 'release-water') {
      flow.releaseWater(() => {
        // 左下のピンによる分岐を先に確定し、次の分岐へは戻らない。
        if (state.directFailOpen) {
          flow.flowWater('water-direct-fail', flowToFailGoal)
        } else {
          flow.flowWater('water-before-connection', flowFromConnection)
        }
      })
    }
  }

  const cleanup = () => {
    flow.cleanup()
    if (connectionAnimation) {
      connectionAnimation.onfinish = null
      connectionAnimation.cancel()
      connectionAnimation = undefined
    }
  }

  return { state: state as Readonly<Stage2State>, onPinPulled, cleanup }
}
