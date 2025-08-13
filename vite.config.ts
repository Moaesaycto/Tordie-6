import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        exportType: "default",          // <- change this
        svgo: true,
        svgoConfig: { plugins: [{ name: "removeAttrs", params: { attrs: "(fill)" } }] },
      },
    }),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: { include: ['react-konva-to-svg'] },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@domain': path.resolve(__dirname, 'src/domain'),
    },
  },
})
