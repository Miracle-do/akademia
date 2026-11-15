import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  define: { __BUILD_ID__: JSON.stringify(String(Date.now())) },
  envDir: path.resolve(__dirname, '..'),
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    proxy: {
      '/api': {
        target: 'https://akademia-pgmm.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Bibliothèques regroupées par usage : le moteur Markdown (lourd) n'est chargé qu'avec les pages de lecture/quiz.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run)\//.test(id)) return 'vendor-react';
          if (/node_modules\/(react-markdown|remark-[^/]+|rehype-[^/]+|unified|micromark[^/]*|mdast-[^/]+|hast-[^/]+|unist-[^/]+|vfile[^/]*|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|devlop|trough|bail|is-plain-obj|github-slugger|html-url-attributes|estree-[^/]+|parse5|zwitch|ccount|character-entities[^/]*|trim-lines|markdown-table|longest-streak|web-namespaces|html-void-elements|stringify-entities)\//.test(id)) return 'vendor-markdown';
          return undefined;
        },
      },
    },
  },
});
