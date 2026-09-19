import { setupPins, type PinPulledHandler } from './pin'
import { focusForKeyboard } from './focus'
import { stage1Markup } from './stages/stage1'
import { createStage1Controller } from './stages/stage1Controller'
import { stage2Markup } from './stages/stage2'
import { createStage2Controller } from './stages/stage2Controller'
import { stage3Markup } from './stages/stage3'
import { createStage3Controller } from './stages/stage3Controller'

export const stageNumbers = [1, 2, 3] as const
export type StageNumber = (typeof stageNumbers)[number]

const stageMarkups: Record<StageNumber, string> = {
  1: stage1Markup,
  2: stage2Markup,
  3: stage3Markup,
}

const stageControllers = {
  1: createStage1Controller,
  2: createStage2Controller,
  3: createStage3Controller,
}

export type StageManager = {
  renderStage: (stageNumber: StageNumber) => void
}

export const createStageManager = (
  app: HTMLElement,
  onPinPulled: PinPulledHandler,
  onStageChange?: (stageNumber: StageNumber) => void,
): StageManager => {
  let cleanupPins: (() => void) | undefined
  let cleanupStage: (() => void) | undefined

  const renderStage = (stageNumber: StageNumber) => {
    const markup = stageMarkups[stageNumber]

    if (!markup) {
      throw new Error(`Stage ${stageNumber} のレイアウトがありません`)
    }

    cleanupPins?.()
    cleanupStage?.()
    app.innerHTML = markup
    const focusFirstPin = () => {
      focusForKeyboard(app.querySelector<SVGGElement>('.pin[tabindex="0"]'))
    }
    const nextStage = stageNumbers[stageNumbers.indexOf(stageNumber) + 1]
    const stageController = stageControllers[stageNumber](app, {
      onFinish: () => cleanupPins?.(),
      onRetry: () => {
        renderStage(stageNumber)
        focusFirstPin()
      },
      onNext: nextStage
        ? () => {
            renderStage(nextStage)
            focusFirstPin()
          }
        : undefined,
    })
    cleanupStage = stageController.cleanup
    cleanupPins = setupPins(app, (pinNumber, direction) => {
      stageController.onPinPulled(pinNumber, direction)
      onPinPulled(pinNumber, direction)
    })
    onStageChange?.(stageNumber)
  }

  return { renderStage }
}
