import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import viteCompression from 'vite-plugin-compression';

import packageJson from './package.json';

const rootDir = dirname(fileURLToPath(import.meta.url));
const version = packageJson.version;
const ldLocalFile = join(rootDir, 'ld.local.json');

function localFeatureFlagsPlugin(): Plugin {
  return {
    name: 'local-feature-flags',
    transformIndexHtml() {
      if (!existsSync(ldLocalFile)) return [];
      try {
        return [
          {
            tag: 'script',
            injectTo: 'head',
            children: `window.localFeatureFlags = ${JSON.stringify(JSON.parse(readFileSync(ldLocalFile, 'utf-8')))};`,
          },
        ];
      } catch {
        return [];
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const isProd = env.NODE_ENV === 'production';
  const urlPrefix = (env.MODE || 'CLI') === 'WEBSITE' ? env.PUBLIC_URL_ROOT || '' : '';

  return {
    root: resolve(rootDir, 'source'),
    base: `${urlPrefix}/${version}/`,

    plugins: [
      react(),
      localFeatureFlagsPlugin(),
      ...(isProd ? [viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 })] : []),
    ],

    resolve: {
      alias: { '@': resolve(rootDir, 'source/javascripts') },
      dedupe: ['zustand'], // Required for iframe compatibility
    },

    define: {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
      'import.meta.env.MODE': JSON.stringify(env.MODE || 'CLI'),
      'import.meta.env.ANALYTICS': JSON.stringify(env.ANALYTICS || 'false'),
      'import.meta.env.DATADOG_RUM': JSON.stringify(env.DATADOG_RUM || 'false'),
      'import.meta.env.WFE_VERSION': JSON.stringify(version),
    },

    build: {
      outDir: resolve(rootDir, 'build'),
      sourcemap: isProd ? 'hidden' : true,
      minify: isProd,
    },

    server: {
      port: parseInt(env.DEV_SERVER_PORT || '4567', 10),
      proxy: { '/api': 'http://localhost:4000' },
    },

    envPrefix: ['VITE_', 'MODE', 'ANALYTICS', 'DATADOG_RUM', 'NODE_ENV', 'PUBLIC_URL_ROOT'],
  };
});
