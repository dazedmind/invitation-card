import 'dotenv/config'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import createFileRouterPlugin from "vite-plugin-pages-router/plugin";

import { apiPlugin } from './apiPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    apiPlugin(),
    createFileRouterPlugin({
      pagesDir: "src/pages", // Directory containing page components
      notFoundPage: "src/pages/404.tsx", // 404 error page component path
      loadingComponent: "src/components/Loading.tsx", // Loading component path
    }),
  ],
  resolve: {
    alias: {
      src: "/src",
    },
  },
})
