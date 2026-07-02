import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Shadery GLSL są trzymane jako inline stringi (GlobeScene) — vite-plugin-glsl
// nie jest potrzebny, dopóki nie pojawią się osobne pliki .glsl.
// base: './' → relative asset paths, so the same build works on Vercel,
// Netlify and GitHub Pages (also when served from a sub-path like /repo-name/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
