import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // resvg ships a native .node binary: load it from node_modules, never bundle it.
  optimizeDeps: { exclude: ['@resvg/resvg-js'] },
  ssr: { external: ['@resvg/resvg-js'] },
  plugins: [devtools(), nitro(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
