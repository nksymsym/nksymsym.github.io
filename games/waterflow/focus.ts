// ページ内で最後に使った操作方法を記録する。ステージ再描画時も引き継ぐ。
// 入力方法が不明な間は、キーボード等でのフォーカス移動を維持する。
let usingKeyboard = true

document.addEventListener(
  'pointerdown',
  () => {
    usingKeyboard = false
  },
  true,
)

document.addEventListener(
  'keydown',
  (event) => {
    if (!event.altKey && !event.ctrlKey && !event.metaKey) {
      usingKeyboard = true
    }
  },
  true,
)

// タップ・クリック後は自動フォーカスによる不要な外枠を表示させない。
export const focusForKeyboard = (
  element: HTMLElement | SVGElement | null | undefined,
) => {
  if (usingKeyboard) element?.focus({ preventScroll: true })
}
