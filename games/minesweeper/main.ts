import '../../src/shared/base.css'
import './style.css'

import {
  BOARD_SIZE,
  MINE_COUNT,
  createGame,
  getFlagCount,
  getRevealedCellCount,
  revealCell,
  toggleFlag,
  type Cell,
} from './game'

const app = document.querySelector<HTMLDivElement>('#app')

let game = createGame()

render()

function render(): void {
  if (!app) {
    throw new Error('#app が見つかりません。')
  }

  app.replaceChildren()

  const gameArea = document.createElement('div')
  gameArea.className = 'minesweeper'

  const sidePanel = createSidePanel()
  const board = createBoard()

  gameArea.append(sidePanel, board)
  app.append(gameArea)
}

function createSidePanel(): HTMLElement {
  const sidePanel = document.createElement('section')
  sidePanel.className = 'minesweeper__side-panel'

  const scene = createScene()
  const controls = createControls()

  sidePanel.append(scene, controls)

  return sidePanel
}

function createScene(): HTMLElement {
  const scene = document.createElement('div')
  scene.className = 'minesweeper__scene'

  const text = document.createElement('p')
  text.className = 'minesweeper__scene-text'

  if (game.status === 'cleared') {
    text.textContent = 'クリア！'
  } else if (game.status === 'failed') {
    text.textContent = '失敗'
  } else {
    const revealedCellCount = getRevealedCellCount(game)
    const safeCellCount = BOARD_SIZE * BOARD_SIZE - MINE_COUNT

    const progress = revealedCellCount / safeCellCount

    if (revealedCellCount === 0) {
      text.textContent = 'ゲーム開始'
    } else if (progress < 1 / 3) {
      text.textContent = '探索中'
    } else if (progress < 2 / 3) {
      text.textContent = '順調'
    } else {
      text.textContent = 'あと少し'
    }
  }

  scene.append(text)

  return scene
}

function createControls(): HTMLElement {
  const controls = document.createElement('div')
  controls.className = 'minesweeper__controls'

  const status = document.createElement('div')
  status.className = 'minesweeper__status'

  const mineCount = document.createElement('span')
  mineCount.className = 'minesweeper__mine-count'
  mineCount.textContent = `地雷: ${MINE_COUNT}`

  const flagCount = document.createElement('span')
  flagCount.className = 'minesweeper__flag-count'
  flagCount.textContent = `旗: ${getFlagCount(game)}`

  status.append(mineCount, flagCount)

  const actions = document.createElement('div')
  actions.className = 'minesweeper__actions'

  const resetButton = document.createElement('button')
  resetButton.type = 'button'
  resetButton.className = 'minesweeper__control-button'
  resetButton.textContent = 'リセット'

  resetButton.addEventListener('click', () => {
    game = createGame()
    render()
  })

  const flagModeButton = document.createElement('button')
  flagModeButton.type = 'button'
  flagModeButton.className = 'minesweeper__control-button'

  flagModeButton.textContent = game.flagMode ? '旗モード: ON' : '旗モード: OFF'

  flagModeButton.setAttribute('aria-pressed', String(game.flagMode))

  flagModeButton.disabled = game.status !== 'playing'

  flagModeButton.addEventListener('click', () => {
    game.flagMode = !game.flagMode
    render()
  })

  actions.append(resetButton, flagModeButton)
  controls.append(status, actions)

  return controls
}

function createBoard(): HTMLElement {
  const board = document.createElement('div')
  board.className = 'minesweeper__board'

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const cell = game.board[row][column]

      const button = document.createElement('button')

      button.type = 'button'
      button.className = 'minesweeper__cell'

      button.dataset.row = String(cell.row)
      button.dataset.column = String(cell.column)

      if (cell.isRevealed) {
        button.classList.add('minesweeper__cell--revealed')

        if (cell.isMine) {
          button.textContent = '*'

          button.classList.add('minesweeper__cell--mine')
        } else if (cell.adjacentMines > 0) {
          button.textContent = String(cell.adjacentMines)

          button.dataset.number = String(cell.adjacentMines)
        }
      } else if (cell.isFlagged) {
        button.textContent = '⚑'

        button.classList.add('minesweeper__cell--flagged')
      }

      button.setAttribute('aria-label', createCellAriaLabel(cell))

      button.disabled = game.status !== 'playing' || cell.isRevealed

      button.addEventListener('click', () => {
        handleCellClick(row, column)
      })

      button.addEventListener('contextmenu', (event) => {
        event.preventDefault()

        toggleFlag(game, row, column)
        render()
      })

      board.append(button)
    }
  }

  return board
}

function handleCellClick(row: number, column: number): void {
  if (game.flagMode) {
    toggleFlag(game, row, column)
  } else {
    revealCell(game, row, column)
  }

  render()
}

function createCellAriaLabel(cell: Cell): string {
  const position = `${cell.row + 1}行 ${cell.column + 1}列`

  if (cell.isFlagged) {
    return `${position} 旗`
  }

  if (!cell.isRevealed) {
    return `${position} 未開封`
  }

  if (cell.isMine) {
    return `${position} 地雷`
  }

  return `${position} 周囲の地雷 ${cell.adjacentMines}`
}
