import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  input: {
    main: resolve(import.meta.dirname, 'index.html'),
    minesweeper: resolve(import.meta.dirname, 'games/minesweeper/index.html'),
    waterflow: resolve(import.meta.dirname, 'games/waterflow/index.html'),
  },
})
