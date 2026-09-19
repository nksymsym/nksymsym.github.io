import { focusForKeyboard } from '../focus'

export type StageFlowState = {
  waterReleased: boolean
  waterReachedBranch: boolean
  result: 'playing' | 'clear' | 'fail'
}

export type StageControllerOptions = {
  onFinish: () => void
  onRetry: () => void
  onNext?: () => void
}

type StageFlowOptions = StageControllerOptions & {
  clearImage: string
  failImage: string
}

// SVG座標で毎秒160進む。経路の長さが変わっても水の速さを揃える。
const waterSpeed = 160
const tankDrainDistance = 100

// Both controller implementations use the same channel mask and visual paths.
// Free-falling routes are included, even though their backing pipe is invisible.
export const prepareWaterArtwork = (stage: HTMLElement) => {
  const svgNS = 'http://www.w3.org/2000/svg'
  const mask = document.createElementNS(svgNS, 'mask')
  mask.id = 'water-channel-mask'
  mask.setAttribute('maskUnits', 'userSpaceOnUse')
  mask.setAttribute('x', '0')
  mask.setAttribute('y', '0')
  mask.setAttribute('width', '600')
  mask.setAttribute('height', '800')
  const channels = document.createElementNS(svgNS, 'g')
  channels.setAttribute('mask', 'url(#water-channel-mask)')
  stage.querySelector('#water-layer')!.prepend(channels)
  stage
    .querySelectorAll<SVGPathElement>('.pipe-water[data-pipe]')
    .forEach((water) => {
      const pipe = stage.querySelector<SVGPathElement>(
        `#${water.dataset.pipe}`,
      )!
      const d = pipe.getAttribute('d')!
      water.setAttribute('d', d)
      water.dataset.flowLength = pipe.dataset.flowLength
      const channel = document.createElementNS(svgNS, 'path')
      channel.setAttribute('d', d)
      channel.setAttribute('fill', 'none')
      channel.setAttribute('stroke', 'white')
      channel.setAttribute('stroke-width', '22')
      channel.setAttribute('stroke-linecap', 'round')
      channel.setAttribute('stroke-linejoin', 'round')
      mask.append(channel)
      const liquid = document.createElementNS(svgNS, 'g')
      liquid.setAttribute('class', 'water-stream')
      liquid.append(water)
      channels.append(liquid)
    })
  stage.querySelector('defs')!.append(mask)
}

export const waterFlowLength = (water: SVGPathElement) =>
  Number(water.dataset.flowLength)

export const leaveWaterTrace = (water: SVGPathElement) => {
  water.parentElement!.classList.add('water-stream--traversed')
}

export const createStageFlow = (
  stage: HTMLElement,
  state: StageFlowState,
  { onFinish, onRetry, onNext, clearImage, failImage }: StageFlowOptions,
) => {
  const tankWater = stage.querySelector<SVGGElement>('.tank-water__motion')!
  const inletWater = stage.querySelector<SVGPathElement>('#water-tank-outlet')!
  const resultLayer = stage.querySelector<HTMLDivElement>('.waterflow__result')!
  const resultImage = stage.querySelector<HTMLImageElement>(
    '.waterflow__result-image',
  )!
  const resultMessage = stage.querySelector<HTMLParagraphElement>(
    '.waterflow__result-message',
  )!
  const retryButton =
    stage.querySelector<HTMLButtonElement>('.waterflow__retry')!
  const nextButton = stage.querySelector<HTMLButtonElement>('.waterflow__next')
  const animations = new Set<Animation>()
  let disposed = false

  prepareWaterArtwork(stage)

  const isPlaying = () => !disposed && state.result === 'playing'

  const finishStage = (result: 'clear' | 'fail') => {
    if (!isPlaying()) return

    state.result = result
    stage.classList.add('waterflow--finished')
    stage.querySelectorAll<SVGGElement>('.pin').forEach((pin) => {
      pin.setAttribute('aria-disabled', 'true')
      pin.setAttribute('tabindex', '-1')
    })
    for (const animation of animations) {
      animation.onfinish = null
      animation.pause()
    }
    onFinish()
    resultImage.src = result === 'clear' ? clearImage : failImage
    resultMessage.textContent =
      result === 'clear' ? 'ステージクリア！' : 'ゲームオーバー'
    if (nextButton) nextButton.hidden = result !== 'clear' || !onNext
    resultLayer.hidden = false
    focusForKeyboard(retryButton)
  }

  const flowWater = (waterId: string, onReached: () => void) => {
    if (!isPlaying()) return

    const water = stage.querySelector<SVGPathElement>(`#${waterId}`)!
    water.style.opacity = '1'
    const animation = water.animate(
      [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
      {
        duration: (waterFlowLength(water) / waterSpeed) * 1000,
        easing: 'linear',
        fill: 'forwards',
      },
    )
    animations.add(animation)
    animation.onfinish = () => {
      animation.onfinish = null
      animations.delete(animation)
      if (!isPlaying()) {
        animation.cancel()
        return
      }
      water.style.strokeDashoffset = '0'
      animation.cancel()
      leaveWaterTrace(water)
      onReached()
    }
  }

  const releaseWater = (onReachedBranch: () => void) => {
    if (!isPlaying() || state.waterReleased) return

    state.waterReleased = true
    const animation = tankWater.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: `translateY(${tankDrainDistance}px)` },
      ],
      {
        duration: (waterFlowLength(inletWater) / waterSpeed) * 1000,
        easing: 'linear',
        fill: 'forwards',
      },
    )
    animations.add(animation)
    animation.onfinish = () => {
      animation.onfinish = null
      animations.delete(animation)
      if (isPlaying()) {
        tankWater.setAttribute('transform', `translate(0 ${tankDrainDistance})`)
      }
      animation.cancel()
    }
    flowWater('water-tank-outlet', () => {
      state.waterReachedBranch = true
      onReachedBranch()
    })
  }

  const handleRetry = () => {
    if (!disposed && state.result !== 'playing') onRetry()
  }
  retryButton.addEventListener('click', handleRetry)

  const handleNext = () => {
    if (!disposed && state.result === 'clear') onNext?.()
  }
  nextButton?.addEventListener('click', handleNext)

  const cleanup = () => {
    disposed = true
    retryButton.removeEventListener('click', handleRetry)
    nextButton?.removeEventListener('click', handleNext)
    for (const animation of animations) {
      animation.onfinish = null
      animation.cancel()
    }
    animations.clear()
  }

  return { isPlaying, flowWater, releaseWater, finishStage, cleanup }
}
