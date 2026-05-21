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

function absoluteUrlsPlugin(urlPrefix: string): Plugin {
  // Skip URLs Vite already prefixed (via `base`) so a relative `urlPrefix`
  // like "/workflow_editor" doesn't get applied twice. The regex has already
  // consumed the leading "/", so the lookahead matches against the remainder.
  const afterSlash = urlPrefix.startsWith('/') ? urlPrefix.slice(1) : urlPrefix;
  const escaped = afterSlash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skipPrefixed = urlPrefix.startsWith('/') && afterSlash ? `(?!${escaped}/)` : '';
  const srcRegex = new RegExp(`(src|href)="\\/${skipPrefixed}([^"/][^"]*)"`, 'g');
  const fromRegex = new RegExp(`from "\\/${skipPrefixed}([^"]+)"`, 'g');
  return {
    name: 'absolute-urls',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => html.replace(srcRegex, `$1="${urlPrefix}/$2"`).replace(fromRegex, `from "${urlPrefix}/$1"`),
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const isProd = env.NODE_ENV === 'production';
  const isWebsiteMode = (env.MODE || 'CLI') === 'WEBSITE';
  const urlPrefix = isWebsiteMode ? env.PUBLIC_URL_ROOT || '' : '';

  return {
    root: resolve(rootDir, 'source'),
    base: `${urlPrefix}/${version}/`,

    plugins: [
      react(),
      localFeatureFlagsPlugin(),
      ...(!isProd && urlPrefix ? [absoluteUrlsPlugin(urlPrefix)] : []),
      ...(isProd ? [viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 })] : []),
    ],

    resolve: {
      alias: {
        '@': resolve(rootDir, 'source/javascripts'),
        '@bitrise/languageserver-core': resolve(rootDir, 'node_modules/@bitrise/languageserver/packages/core'),
        '@bitrise/languageserver-monaco': resolve(
          rootDir,
          'node_modules/@bitrise/languageserver/packages/monaco-worker',
        ),
      },
      dedupe: ['zustand'], // Required for iframe compatibility
    },

    define: {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
      'import.meta.env.MODE': JSON.stringify(env.MODE || 'CLI'),
      'import.meta.env.CLARITY': JSON.stringify(env.CLARITY || 'false'),
      'import.meta.env.ANALYTICS': JSON.stringify(env.ANALYTICS || 'false'),
      'import.meta.env.DATADOG_RUM': JSON.stringify(env.DATADOG_RUM || 'false'),
      'import.meta.env.PUBLIC_URL_ROOT': JSON.stringify(env.PUBLIC_URL_ROOT || ''),
      'import.meta.env.WFE_VERSION': JSON.stringify(version),
      'import.meta.env.INTERCOM_APP_ID': JSON.stringify(env.INTERCOM_APP_ID || ''),
    },

    build: {
      outDir: resolve(rootDir, 'build'),
      sourcemap: isProd ? 'hidden' : true,
      minify: isProd,
    },

    // Pre-bundle lazy-loaded deps upfront so Vite doesn't re-optimize mid-session
    // and delete old chunks the browser is still referencing. Mid-session reload
    // requires HMR over WebSocket, which the monolith asset proxy doesn't carry.
    // The `include` list covers deps Vite's entry scan misses (e.g. those used
    // inside `?worker` modules, which Vite bundles separately).
    optimizeDeps: {
      entries: ['index.html', 'javascripts/**/*.{ts,tsx}'],
      include: ['@bitrise/languageserver-core', 'monaco-yaml/yaml.worker.js'],
    },

    server: {
      port: parseInt(env.DEV_SERVER_PORT || '4567', 10),
      proxy: { '/api': 'http://localhost:4000' },
      // server.origin must be a full URL (http://...). Skip for relative prefixes.
      origin: /^https?:\/\//.test(urlPrefix) ? urlPrefix : undefined,
      allowedHosts: true,
      // Vite 6+ defaults server.cors.origin to a localhost-only regex, which
      // rejects HMR WebSocket upgrades from any other origin (e.g. when the
      // page is loaded through a tunnel/remote dev box). Allow all in dev.
      cors: true,
    },

    envPrefix: [
      'MODE',
      'VITE_',
      'CLARITY',
      'NODE_ENV',
      'ANALYTICS',
      'DATADOG_RUM',
      'PUBLIC_URL_ROOT',
      'INTERCOM_APP_ID',
    ],
  };
});
