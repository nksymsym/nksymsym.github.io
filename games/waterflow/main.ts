import '../../src/shared/base.css'
import './style.css'

import {
  createStageManager,
  stageNumbers,
  type StageNumber,
} from './stageManager'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('#app が見つかりません')
}

const { renderStage } = createStageManager(
  app,
  (pinNumber) => {
    console.log(`pin ${pinNumber} pulled`)
  },
  (stageNumber) => updateStageControls(stageNumber),
)

// レイアウト調整中はクリア判定に関係なく切り替えられるようにする。
const controls = document.createElement('div')
controls.className = 'waterflow-controls'
controls.innerHTML = `
  <div class="waterflow-controls__buttons" role="group" aria-label="ステージ操作"></div>
`
app.before(controls)

const buttons = controls.querySelector<HTMLDivElement>(
  '.waterflow-controls__buttons',
)!
const initialStage = Number(
  new URLSearchParams(window.location.search).get('stage'),
)
let currentStage: StageNumber =
  stageNumbers.find((stageNumber) => stageNumber === initialStage) ?? 1

const stageButtons = stageNumbers.map((stageNumber) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'waterflow-controls__button'
  button.textContent = `Stage ${stageNumber}`
  button.setAttribute('aria-controls', 'app')
  button.addEventListener('click', () => {
    renderStage(stageNumber)
  })
  buttons.append(button)
  return { stageNumber, button }
})

const resetButton = document.createElement('button')
resetButton.type = 'button'
resetButton.className = 'waterflow-controls__button'
resetButton.textContent = 'リセット'
resetButton.setAttribute('aria-controls', 'app')
resetButton.addEventListener('click', () => renderStage(currentStage))
buttons.append(resetButton)

const updateStageControls = (stageNumber: StageNumber) => {
  currentStage = stageNumber
  stageButtons.forEach(({ stageNumber: number, button }) => {
    button.setAttribute('aria-pressed', String(number === stageNumber))
  })
  // 再読み込みやファイル編集後も、現在のステージを開く。
  const url = new URL(window.location.href)
  url.searchParams.set('stage', String(stageNumber))
  window.history.replaceState(null, '', url)
}

renderStage(currentStage)
