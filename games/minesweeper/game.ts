export const BOARD_SIZE = 9
export const MINE_COUNT = 10

export type GameStatus = 'playing' | 'cleared' | 'failed'

export type Cell = {
  row: number
  column: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

export type GameState = {
  board: Cell[][]
  flagMode: boolean
  status: GameStatus
}

export function createGame(): GameState {
  const board = createEmptyBoard()

  placeMines(board)
  calculateAdjacentMines(board)

  return {
    board,
    flagMode: false,
    status: 'playing',
  }
}

export function revealCell(game: GameState, row: number, column: number): void {
  if (game.status !== 'playing') {
    return
  }

  const cell = game.board[row][column]

  if (cell.isRevealed || cell.isFlagged) {
    return
  }

  if (cell.isMine) {
    cell.isRevealed = true
    game.status = 'failed'

    revealAllMines(game)

    return
  }

  revealSafeArea(game, row, column)

  if (isGameCleared(game)) {
    game.status = 'cleared'
  }
}

export function toggleFlag(game: GameState, row: number, column: number): void {
  if (game.status !== 'playing') {
    return
  }

  const cell = game.board[row][column]

  if (cell.isRevealed) {
    return
  }

  cell.isFlagged = !cell.isFlagged
}

export function getFlagCount(game: GameState): number {
  return game.board.flat().filter((cell) => cell.isFlagged).length
}

export function getRevealedCellCount(game: GameState): number {
  return game.board.flat().filter((cell) => cell.isRevealed && !cell.isMine)
    .length
}

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, column) => ({
      row,
      column,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    })),
  )
}

function placeMines(board: Cell[][]): void {
  const mineIndexes = new Set<number>()

  while (mineIndexes.size < MINE_COUNT) {
    const index = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE)

    mineIndexes.add(index)
  }

  for (const index of mineIndexes) {
    const row = Math.floor(index / BOARD_SIZE)
    const column = index % BOARD_SIZE

    board[row][column].isMine = true
  }
}

function calculateAdjacentMines(board: Cell[][]): void {
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) {
        continue
      }

      cell.adjacentMines = countAdjacentMines(board, cell.row, cell.column)
    }
  }
}

function countAdjacentMines(
  board: Cell[][],
  row: number,
  column: number,
): number {
  let count = 0

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue
      }

      const targetRow = row + rowOffset
      const targetColumn = column + columnOffset

      if (!isInsideBoard(targetRow, targetColumn)) {
        continue
      }

      if (board[targetRow][targetColumn].isMine) {
        count++
      }
    }
  }

  return count
}

function revealSafeArea(
  game: GameState,
  startRow: number,
  startColumn: number,
): void {
  const queue: Cell[] = [game.board[startRow][startColumn]]

  const visited = new Set<string>()

  while (queue.length > 0) {
    const cell = queue.shift()

    if (!cell) {
      continue
    }

    const key = `${cell.row},${cell.column}`

    if (visited.has(key)) {
      continue
    }

    visited.add(key)

    if (cell.isRevealed || cell.isFlagged || cell.isMine) {
      continue
    }

    cell.isRevealed = true

    if (cell.adjacentMines !== 0) {
      continue
    }

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
        if (rowOffset === 0 && columnOffset === 0) {
          continue
        }

        const targetRow = cell.row + rowOffset
        const targetColumn = cell.column + columnOffset

        if (!isInsideBoard(targetRow, targetColumn)) {
          continue
        }

        queue.push(game.board[targetRow][targetColumn])
      }
    }
  }
}

function revealAllMines(game: GameState): void {
  for (const row of game.board) {
    for (const cell of row) {
      if (cell.isMine) {
        cell.isRevealed = true
      }
    }
  }
}

function isGameCleared(game: GameState): boolean {
  return game.board.flat().every((cell) => cell.isMine || cell.isRevealed)
}

function isInsideBoard(row: number, column: number): boolean {
  return row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE
}
