import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600, // Suppress warning for tiptap-editor chunk (505KB)
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Tiptap editor and extensions
          if (id.includes('@tiptap') || id.includes('tiptap-markdown')) {
            return 'tiptap-editor';
          }
          
          // UI libraries
          if (id.includes('lucide-react') || 
              id.includes('react-hot-toast') || 
              id.includes('zustand')) {
            return 'ui-vendor';
          }
        },
      },
    },
  },
})
