import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to make CSS non-render-blocking
const asyncCSSPlugin = (): Plugin => ({
  name: 'async-css',
  transformIndexHtml(html) {
    // Transform CSS links to load asynchronously
    return html.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+\.css)"/g,
      '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'" crossorigin><noscript><link rel="stylesheet" crossorigin href="$1"</noscript'
    );
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && asyncCSSPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group all node_modules into vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Bundle all lucide-react icons together instead of splitting them
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
}));
