import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Split stable vendor code into separate, long-cacheable chunks so no
        // single chunk exceeds the 500 kB warning. All of them are needed for
        // the first render (static imports), so they load in parallel via
        // modulepreload — no extra round-trip and no impact on LCP.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'mui', test: /node_modules[\\/](@mui|@emotion|@babel[\\/]runtime|stylis|react-transition-group|react-is|hoist-non-react-statics|clsx|prop-types)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/ },
          ],
        },
      },
    },
  },
})
