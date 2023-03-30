import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tictactoe: resolve(__dirname, 'tictactoe/index.html'),
        maze: resolve(__dirname, 'maze/index.html'),
      },
    },
  },
})
