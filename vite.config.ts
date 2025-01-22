import { defineConfig } from 'vite'

import { fileURLToPath, URL } from 'node:url'
import vuePlugin from '@vitejs/plugin-vue'
// import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [
    vuePlugin(
      {
        template: {
          // support for custom elements and remove the unknown element warnings
          // support for asset url conversion
          // transformAssetUrls,
        },
      }
    )
  ],
  css: {
    postcss: {
      plugins: [
        // autoprefixer
      ],
    }
  },
  base: '',
  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 1500
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
      // '@': './src',
    }
  }
})