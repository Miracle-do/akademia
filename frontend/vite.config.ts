import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

const APP_VERSION: string = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')).version;

const BUILD_ID = String(Date.now());

// Publie l'identifiant de version : l'application installée le compare à sa propre version pour proposer la mise à jour.
const versionFile = () => ({
  name: 'version-file',
  generateBundle() {
    (this as unknown as { emitFile: (f: object) => void }).emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: BUILD_ID, version: APP_VERSION }) });
  },
});

// Liste de tous les fichiers générés (pages, chapitres, quiz… chargés à la demande) pour le précache hors ligne.
const assetManifest = () => ({
  name: 'asset-manifest',
  generateBundle(_: unknown, bundle: Record<string, unknown>) {
    const files = Object.keys(bundle).filter((f) => /\.(js|css)$/.test(f)).map((f) => '/' + f);
    (this as unknown as { emitFile: (f: object) => void }).emitFile({ type: 'asset', fileName: 'asset-manifest.json', source: JSON.stringify(files) });
  },
});

export default defineConfig({
  plugins: [react(), assetManifest(), versionFile()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID), __APP_VERSION__: JSON.stringify(APP_VERSION) },
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
