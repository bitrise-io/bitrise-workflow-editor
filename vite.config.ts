import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import viteCompression from 'vite-plugin-compression';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

import packageJson from './package.json';

const rootDir = dirname(fileURLToPath(import.meta.url));
const version = packageJson.version;
const ldLocalFile = join(rootDir, 'ld.local.json');

// Plugin to inject local feature flags into HTML
function localFeatureFlagsPlugin(): Plugin {
  return {
    name: 'local-feature-flags',
    transformIndexHtml() {
      if (!existsSync(ldLocalFile)) return [];

      try {
        const localFlags = JSON.parse(readFileSync(ldLocalFile, 'utf-8'));
        return [
          {
            tag: 'script',
            injectTo: 'head',
            children: `window.localFeatureFlags = ${JSON.stringify(localFlags)};`,
          },
        ];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse ld.local.json:', error);
        return [];
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const isProd = env.NODE_ENV === 'production';
  const appMode = env.MODE || 'CLI'; // Default to CLI if not set
  const urlPrefix = appMode === 'WEBSITE' ? env.PUBLIC_URL_ROOT || '' : '';
  const publicPath = `${urlPrefix}/${version}/`;

  return {
    root: resolve(rootDir, 'source'),
    base: publicPath,

    plugins: [
      react({
        tsDecorators: true,
      }),
      localFeatureFlagsPlugin(),
      monacoEditorPlugin({
        languageWorkers: ['editorWorkerService', 'json'],
        customWorkers: [
          {
            label: 'yaml',
            entry: 'monaco-yaml/yaml.worker',
          },
        ],
      }),
      ...(isProd
        ? [
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 1024,
              deleteOriginFile: false,
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        '@': resolve(rootDir, 'source/javascripts'),
      },
      // Deduplicate zustand to prevent multiple instances in iframes
      dedupe: ['zustand'],
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
      'process.env': {},
      // Define custom env variables for HTML replacement
      'import.meta.env.MODE': JSON.stringify(appMode),
      'import.meta.env.ANALYTICS': JSON.stringify(env.ANALYTICS || 'false'),
      'import.meta.env.DATADOG_RUM': JSON.stringify(env.DATADOG_RUM || 'false'),
      'import.meta.env.PUBLIC_URL_ROOT': JSON.stringify(env.PUBLIC_URL_ROOT || ''),
      'import.meta.env.WFE_VERSION': JSON.stringify(version),
      'import.meta.env.BASE_URL': JSON.stringify(publicPath),
    },

    optimizeDeps: {
      include: [
        'monaco-editor/esm/vs/editor/editor.api',
        'monaco-editor/esm/vs/editor/editor.worker',
        'monaco-editor/esm/vs/language/json/json.worker',
        'monaco-yaml',
        '@monaco-editor/react',
      ],
    },

    worker: {
      format: 'es',
    },

    build: {
      outDir: resolve(rootDir, 'build'),
      emptyOutDir: true,
      sourcemap: isProd ? 'hidden' : true,
      target: 'ES2022',
      rollupOptions: {
        output: {
          entryFileNames: 'javascripts/[name].js',
          chunkFileNames: 'javascripts/[name].js',
          assetFileNames(assetInfo) {
            const name = assetInfo.name || '';
            if (name.endsWith('.css')) return 'stylesheets/[name][extname]';
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'fonts/[name]-[hash][extname]';
            if (/\.(png|jpe?g|gif|svg)$/i.test(name)) return 'images/[name]-[hash][extname]';
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      minify: isProd,
      chunkSizeWarningLimit: 60000,
    },

    server: {
      port: parseInt(env.DEV_SERVER_PORT || '4567', 10),
      host: true,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },

    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },

    envPrefix: ['VITE_', 'MODE', 'ANALYTICS', 'DATADOG_RUM', 'NODE_ENV', 'PUBLIC_URL_ROOT'],
  };
});
