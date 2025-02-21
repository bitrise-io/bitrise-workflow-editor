/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { version: WFE_VERSION } = require('./package.json');

const CODEBASE = path.resolve(__dirname, 'source');
const OUTPUT_FOLDER = path.resolve(__dirname, 'build');
const LD_LOCAL_FILE = path.resolve(__dirname, 'ld.local.json');

const { ANALYTICS, NODE_ENV, MODE, PUBLIC_URL_ROOT, DEV_SERVER_PORT } = process.env;
const isWebsiteMode = MODE === 'WEBSITE';
const urlPrefix = isWebsiteMode ? PUBLIC_URL_ROOT : '';
const publicPath = `${urlPrefix}/${WFE_VERSION}/`;

export default defineConfig({
  root: CODEBASE,
  base: publicPath,
  build: {
    target: 'es5',
    outDir: OUTPUT_FOLDER,
    commonjsOptions: { transformMixedEsModules: true },
  },
  server: {
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
  plugins: [react()],
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
