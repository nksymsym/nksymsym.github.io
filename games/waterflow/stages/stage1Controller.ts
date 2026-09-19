import type { PinPulledHandler } from '../pin'
import clearImage from '../images/clear_1.webp'
import failImage from '../images/fail_1.webp'
import {
  createStageFlow,
  type StageControllerOptions,
  type StageFlowState,
} from './stageFlow'

export type Stage1State = StageFlowState & { clearRouteOpen: boolean }

export const createStage1Controller = (
  container: ParentNode,
  options: StageControllerOptions,
) => {
  const stage = container.querySelector<HTMLElement>('[data-stage="1"]')!
  const state: Stage1State = {
    waterReleased: false,
    waterReachedBranch: false,
    clearRouteOpen: false,
    result: 'playing',
  }
  const flow = createStageFlow(stage, state, {
    ...options,
    clearImage,
    failImage,
  })

  const onPinPulled: PinPulledHandler = (pinNumber) => {
    if (!flow.isPlaying()) return

    const action = stage.querySelector<SVGGElement>(
      `.pin[data-pin="${pinNumber}"]`,
    )?.dataset.action
    if (action === 'open-clear-route') state.clearRouteOpen = true
    if (action === 'release-water') {
      flow.releaseWater(() => {
        // 分岐到達時に進路を確定し、その後のピン操作では変更しない。
        const result = state.clearRouteOpen ? 'clear' : 'fail'
        flow.flowWater(`water-${result}-goal`, () => flow.finishStage(result))
      })
    }
  }

  return {
    state: state as Readonly<Stage1State>,
    onPinPulled,
    cleanup: flow.cleanup,
  }
}
