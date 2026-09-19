import type { PinPulledHandler } from '../pin'
import { focusForKeyboard } from '../focus'
import clearResultImage from '../images/clear_3.webp'
import failResultImage from '../images/fail_3.webp'
import {
  leaveWaterTrace,
  prepareWaterArtwork,
  waterFlowLength,
} from './stageFlow'

export type Stage3State = {
  wrenchReleased: boolean
  pipeBroken: boolean
  waterReleased: boolean
  waterReachedBranch: boolean
  clearRouteOpen: boolean
  result: 'playing' | 'clear' | 'fail'
}

export type Stage3Controller = {
  state: Readonly<Stage3State>
  onPinPulled: PinPulledHandler
  cleanup: () => void
}

type Stage3ControllerOptions = {
  onFinish: () => void
  onRetry: () => void
}

// 現在のスパナ下端 (y ≈ 282) からパイプ上端 (y = 342) まで。
const wrenchDropDistance = 60
// 波形の水面を首の下端より下へ移動する。
const tankDrainDistance = 100
const waterReleaseDuration = 2200

export const createStage3Controller = (
  container: ParentNode,
  { onFinish, onRetry }: Stage3ControllerOptions,
): Stage3Controller => {
  const stage = container.querySelector<HTMLElement>('[data-stage="3"]')
  const resultLayer = stage?.querySelector<HTMLDivElement>('.waterflow__result')
  const resultImage = stage?.querySelector<HTMLImageElement>(
    '.waterflow__result-image',
  )
  const resultMessage = stage?.querySelector<HTMLParagraphElement>(
    '.waterflow__result-message',
  )
  const retryButton =
    stage?.querySelector<HTMLButtonElement>('.waterflow__retry')
  const releasePin = stage?.querySelector<SVGGElement>(
    '.pin[data-action="release-wrench"]',
  )
  const waterReleasePin = stage?.querySelector<SVGGElement>(
    '.pin[data-action="release-water"]',
  )
  const clearRoutePin = stage?.querySelector<SVGGElement>(
    '.pin[data-action="open-clear-route"]',
  )
  const wrenchMotion = stage?.querySelector<SVGGElement>('.wrench__motion')
  const tankWaterMotion = stage?.querySelector<SVGGElement>(
    '.tank-water__motion',
  )
  const inletWater = stage?.querySelector<SVGPathElement>('#water-tank-outlet')
  if (stage) prepareWaterArtwork(stage)
  const inletLength = inletWater ? waterFlowLength(inletWater) : 0

  const state: Stage3State = {
    wrenchReleased: false,
    pipeBroken: false,
    waterReleased: false,
    waterReachedBranch: false,
    clearRouteOpen: false,
    result: 'playing',
  }
  let animation: Animation | undefined
  let tankWaterAnimation: Animation | undefined
  const waterAnimations = new Set<Animation>()
  let disposed = false

  const finishStage = (result: 'clear' | 'fail') => {
    if (!disposed && state.result === 'playing') {
      state.result = result
      stage?.classList.add('waterflow--finished')
      stage?.querySelectorAll<SVGGElement>('.pin').forEach((pin) => {
        pin.setAttribute('aria-disabled', 'true')
        pin.setAttribute('tabindex', '-1')
      })
      onFinish()

      // 到達直前に抜いたスパナは現在位置に留め、終了後の破損を防ぐ。
      // ゴールまで流れ終わった水の表示・アニメーションには触れない。
      if (animation) {
        animation.onfinish = null
        animation.pause()
      }

      if (resultImage) {
        resultImage.src =
          result === 'clear' ? clearResultImage : failResultImage
      }
      if (resultMessage) {
        resultMessage.textContent =
          result === 'clear' ? 'ステージクリア！' : 'ゲームオーバー'
      }
      if (resultLayer) {
        resultLayer.hidden = false
      }
      focusForKeyboard(retryButton)
    }
  }

  const flowWater = (waterId: string, onReached: () => void) => {
    const water = stage?.querySelector<SVGPathElement>(`#${waterId}`)
    if (
      disposed ||
      state.result !== 'playing' ||
      !water?.getAttribute('d') ||
      !inletLength
    ) {
      return
    }

    water.style.opacity = '1'
    const active = water.animate(
      [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
      {
        duration: (waterReleaseDuration * waterFlowLength(water)) / inletLength,
        easing: 'linear',
        fill: 'forwards',
      },
    )
    waterAnimations.add(active)
    active.onfinish = () => {
      active.onfinish = null
      waterAnimations.delete(active)
      if (disposed) {
        active.cancel()
        return
      }

      water.style.strokeDashoffset = '0'
      active.cancel()
      leaveWaterTrace(water)
      onReached()
    }
  }

  const flowToFailGoal = () => {
    flowWater('water-fail-goal-2', () => finishStage('fail'))
  }

  const flowFromSecondBranch = () => {
    // 到達時に一度だけ選択し、その後のピン操作では選び直さない。
    if (state.clearRouteOpen) {
      flowWater('water-clear-goal', () => finishStage('clear'))
    } else {
      flowWater('water-fail-goal-1', flowToFailGoal)
    }
  }

  const flowFromFirstBranch = () => {
    if (state.pipeBroken) {
      flowWater('water-broken-invisible', () => {
        flowWater('water-broken', flowToFailGoal)
      })
    } else {
      flowWater('water-not-broken', flowFromSecondBranch)
    }
  }

  const releaseWrench = () => {
    if (state.wrenchReleased || !stage || !wrenchMotion) {
      return
    }

    state.wrenchReleased = true
    // 回転を持つ #wrench の外側を動かし、ステージの下方向へ落とす。
    animation = wrenchMotion.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: `translateY(${wrenchDropDistance}px)` },
      ],
      { duration: 360, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
    )
    animation.onfinish = () => {
      if (disposed || state.result !== 'playing') {
        return
      }

      wrenchMotion.setAttribute(
        'transform',
        `translate(0 ${wrenchDropDistance})`,
      )
      animation?.cancel()
      animation = undefined
      state.pipeBroken = true
      stage.classList.add('waterflow--pipe-broken')
    }
  }

  const releaseWater = () => {
    if (
      state.waterReleased ||
      !tankWaterMotion ||
      !inletWater ||
      !inletLength
    ) {
      return
    }

    state.waterReleased = true
    tankWaterAnimation = tankWaterMotion.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: `translateY(${tankDrainDistance}px)` },
      ],
      { duration: waterReleaseDuration, easing: 'linear', fill: 'forwards' },
    )
    tankWaterAnimation.onfinish = () => {
      if (disposed) {
        return
      }

      tankWaterMotion.setAttribute(
        'transform',
        `translate(0 ${tankDrainDistance})`,
      )
      tankWaterAnimation?.cancel()
      tankWaterAnimation = undefined
    }

    flowWater('water-tank-outlet', () => {
      state.waterReachedBranch = true
      flowFromFirstBranch()
    })
  }

  const onPinPulled: PinPulledHandler = (pinNumber) => {
    if (disposed || state.result !== 'playing') {
      return
    }

    if (releasePin && pinNumber === Number(releasePin.dataset.pin)) {
      releaseWrench()
    }

    if (waterReleasePin && pinNumber === Number(waterReleasePin.dataset.pin)) {
      releaseWater()
    }

    if (clearRoutePin && pinNumber === Number(clearRoutePin.dataset.pin)) {
      state.clearRouteOpen = true
    }
  }

  const handleRetry = () => {
    if (!disposed && state.result !== 'playing') {
      onRetry()
    }
  }
  retryButton?.addEventListener('click', handleRetry)

  const cleanup = () => {
    disposed = true
    retryButton?.removeEventListener('click', handleRetry)
    for (const active of [animation, tankWaterAnimation, ...waterAnimations]) {
      if (active) {
        active.onfinish = null
        active.cancel()
      }
    }
    animation = undefined
    tankWaterAnimation = undefined
    waterAnimations.clear()
  }

  return { state, onPinPulled, cleanup }
}
