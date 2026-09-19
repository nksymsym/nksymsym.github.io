export type PinDirection = 'left' | 'right'

export type PinPulledHandler = (
  pinNumber: number,
  direction: PinDirection,
) => void

const directionLabels: Record<PinDirection, string> = {
  left: '左',
  right: '右',
}

const isPinDirection = (value: string | undefined): value is PinDirection =>
  value === 'left' || value === 'right'

export const setupPins = (
  container: ParentNode,
  onPinPulled: PinPulledHandler,
): (() => void) => {
  const pins = container.querySelectorAll<SVGGElement>('.pin')
  const pulledPins = new WeakSet<SVGGElement>()
  const cleanupCallbacks: Array<() => void> = []

  pins.forEach((pin) => {
    const pinNumber = Number(pin.dataset.pin)
    const direction = pin.dataset.direction

    if (!Number.isInteger(pinNumber) || !isPinDirection(direction)) {
      return
    }

    pin.setAttribute('role', 'button')
    pin.setAttribute('tabindex', '0')
    pin.setAttribute(
      'aria-label',
      `ピン${pinNumber}を${directionLabels[direction]}に抜く`,
    )
    pin.setAttribute('aria-disabled', 'false')

    const pullPin = () => {
      if (pulledPins.has(pin)) {
        return
      }

      pulledPins.add(pin)
      pin.classList.add('pin--pulled')
      pin.setAttribute('aria-disabled', 'true')
      pin.setAttribute('tabindex', '-1')
      onPinPulled(pinNumber, direction)
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) {
        return
      }

      pullPin()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return
      }

      event.preventDefault()
      pullPin()
    }

    pin.addEventListener('pointerup', handlePointerUp)
    pin.addEventListener('keydown', handleKeyDown)

    cleanupCallbacks.push(() => {
      pin.removeEventListener('pointerup', handlePointerUp)
      pin.removeEventListener('keydown', handleKeyDown)
    })
  })

  return () => {
    cleanupCallbacks.forEach((cleanup) => cleanup())
  }
}
