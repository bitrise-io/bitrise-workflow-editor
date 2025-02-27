/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defineConfig } from 'vite';
import reactSWCPlugin from '@vitejs/plugin-react-swc';
import { version as WFE_VERSION } from './package.json';

const CODEBASE = path.resolve(__dirname, 'source');
const OUTPUT_FOLDER = path.resolve(__dirname, 'build');
const LD_LOCAL_FILE = path.resolve(__dirname, 'ld.local.json');

const { ANALYTICS, NODE_ENV, MODE, PUBLIC_URL_ROOT, DEV_SERVER_PORT } = process.env;
const isWebsiteMode = MODE === 'WEBSITE';
const urlPrefix = isWebsiteMode ? PUBLIC_URL_ROOT : '';
const publicPath = `${urlPrefix}/${WFE_VERSION}/`;
const isProd = NODE_ENV === 'prod';

export default defineConfig({
  root: CODEBASE,
  base: publicPath,
  mode: isProd ? 'production' : 'development',
  build: {
    target: 'ES2015',
    emptyOutDir: true,
    outDir: OUTPUT_FOLDER,
    sourcemap: isProd ? 'hidden' : false,
    rollupOptions: {
      input: {
        main: path.resolve(CODEBASE, 'index.html'),
        index: path.resolve(CODEBASE, 'javascripts/index.js'),
        vendor: path.resolve(CODEBASE, 'javascripts/vendor.js'),
      },
      output: {
        entryFileNames: 'javascripts/[name].js',
        chunkFileNames: 'javascripts/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(DEV_SERVER_PORT || 4567),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'source/javascripts'),
    },
    extensions: ['.html', '.js', '.ts', '.tsx', '.css'],
  },
  plugins: [
    reactSWCPlugin({
      devTarget: 'ES2015',
    }),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(CODEBASE, 'templates'),
          dest: '.',
        },
      ],
    }),
  ],
  define: {
    global: '{}',
    'process.env.MODE': JSON.stringify(MODE),
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    'process.env.ANALYTICS': JSON.stringify(ANALYTICS),
    'process.env.PUBLIC_URL': JSON.stringify(publicPath),
    'process.env.WFE_VERSION': JSON.stringify(WFE_VERSION),
    'window.localFeatureFlags': (() => {
      if (existsSync(LD_LOCAL_FILE)) {
        try {
          return JSON.stringify(JSON.parse(readFileSync(LD_LOCAL_FILE, 'utf-8')));
        } catch (error) {
          console.warn('Failed to parse ld.local.json:', error);
          return '{}';
        }
      }

      return '{}';
    })(),
  },
});
