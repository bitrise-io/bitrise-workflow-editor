const path = require('path');
const { existsSync, readFileSync } = require('fs');
const { ProvidePlugin, DefinePlugin, EnvironmentPlugin } = require('webpack');

const CopyPlugin = require('copy-webpack-plugin');
const TerserPLugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

const { version } = require('./package.json');

const LD_LOCAL_FILE = path.join(__dirname, 'ld.local.json');
const OUTPUT_FOLDER = path.join(__dirname, 'build');
const CODEBASE = path.join(__dirname, 'source');
const MonacoPluginOptions = {
  languages: ['yaml'],
  customLanguages: [
    {
      label: 'yaml',
      entry: 'monaco-yaml',
      worker: {
        id: 'monaco-yaml/yamlWorker',
        entry: 'monaco-yaml/yaml.worker',
      },
    },
  ],
  features: [
    '!accessibilityHelp',
    '!bracketMatching',
    '!caretOperations',
    '!clipboard',
    '!codeAction',
    '!codelens',
    '!colorDetector',
    '!contextmenu',
    '!cursorUndo',
    '!dnd',
    '!fontZoom',
    '!format',
    '!gotoError',
    '!gotoSymbol',
    '!hover',
    '!iPadShowKeyboard',
    '!inPlaceReplace',
    '!inspectTokens',
    '!links',
    '!multicursor',
    '!parameterHints',
    '!quickCommand',
    '!quickOutline',
    '!referenceSearch',
    '!rename',
    '!smartSelect',
    '!snippets',
    '!suggest',
    '!toggleHighContrast',
    '!toggleTabFocusMode',
    '!transpose',
    '!wordHighlighter',
    '!wordOperations',
    '!wordPartOperations',
  ],
};

const { NODE_ENV, MODE, PUBLIC_URL_ROOT, CLARITY, DEV_SERVER_PORT, DATADOG_RUM } = process.env;
const isProd = NODE_ENV === 'prod';
const isWebsiteMode = MODE === 'WEBSITE';
const urlPrefix = isWebsiteMode ? PUBLIC_URL_ROOT : '';
const isClarityEnabled = CLARITY === 'true';
const isDataDogRumEnabled = DATADOG_RUM === 'true';
const publicPath = `${urlPrefix}/${version}/`;

const entry = {
  vendor: './javascripts/vendor.js',
  main: './javascripts/index.js',
};
if (isClarityEnabled) {
  entry.clarity = './javascripts/clarity.js';
}
if (isDataDogRumEnabled) {
  entry.datadogrum = './javascripts/datadog-rum.js';
}

/** @type {import('webpack').Configuration} */
module.exports = {
  context: CODEBASE,
  entry,
  mode: isProd ? 'production' : 'development',
  output: {
    filename: 'javascripts/[name].js',
    path: OUTPUT_FOLDER,
    publicPath,
    crossOriginLoading: 'anonymous',
  },

  /* --- Development --- */
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  devServer: {
    watchFiles: './source/**/*',
    port: DEV_SERVER_PORT || 4567,
    allowedHosts: ['host.docker.internal', 'localhost'],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    devMiddleware: {
      stats: 'errors-only',
    },
    static: {
      directory: OUTPUT_FOLDER,
      publicPath,
    },
  },
  watchOptions: {
    ignored: ['node_modules', 'build', 'public'],
  },

  /* --- Performance --- */
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPLugin({
        extractComments: true,
        parallel: true,
        terserOptions: {
          mangle: false,
          safari10: true,
          output: {
            comments: /@license/i,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 40000000,
    maxEntrypointSize: 60000000,
  },

  /* --- Rules --- */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'source/javascripts'),
    },
    extensions: ['.js', '.ts', '.tsx', '.css'],
  },
  module: {
    rules: [
      /* --- Javascript & TypeScript --- */
      {
        test: /\.(stories|mswMocks?|mocks?|specs?|tests?)\.tsx?$/i,
        use: 'ignore-loader',
      },
      {
        test: /\.tsx?$/i,
        use: {
          loader: 'swc-loader',
          options: {
            sourceMaps: true,
            jsc: {
              target: 'es5',
              parser: {
                tsx: true,
                decorators: true,
                syntax: 'typescript',
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
      },

      /* --- HTML & CSS --- */
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },

      /* --- Images --- */
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        generator: {
          filename: '[name]-[hash][ext][query]',
          outputPath: 'images',
          publicPath: `${publicPath}images/`,
        },
      },

      /* --- Fonts --- */
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset',
        generator: {
          filename: '[name]-[hash][ext][query]',
          outputPath: 'fonts',
          publicPath: isWebsiteMode ? `${publicPath}fonts/` : 'fonts/',
        },
      },
    ],
  },

  /* --- Plugins --- */
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 4096,
        configFile: path.join(__dirname, 'tsconfig.json'),
      },
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /.js$|.css$/,
    }),
    new MiniCssExtractPlugin({
      filename: 'stylesheets/[name].css',
    }),
    new MonacoWebpackPlugin(MonacoPluginOptions),
    new ProvidePlugin({
      'window.jQuery': 'jquery',
      'window._': 'underscore',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'images/favicons/*', to: OUTPUT_FOLDER },
        { from: 'templates/*', to: OUTPUT_FOLDER },
      ],
    }),
    new EnvironmentPlugin({
      ANALYTICS: 'false',
      MODE: 'WEBSITE',
      NODE_ENV: 'development',
      PUBLIC_URL_ROOT: '',
      WFE_VERSION: version,
    }),
    new DefinePlugin({
      'window.localFeatureFlags': DefinePlugin.runtimeValue(
        () => {
          if (existsSync(LD_LOCAL_FILE)) {
            try {
              return JSON.parse(readFileSync(LD_LOCAL_FILE));
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn('Failed to parse ld.local.json:', error);
              return {};
            }
          }

          return {};
        },
        {
          fileDependencies: [LD_LOCAL_FILE],
        },
      ),
    }),
    new HtmlWebpackPlugin({
      publicPath,
      scriptLoading: 'blocking',
      template: 'index.html',
    }),
    new SubresourceIntegrityPlugin(),
  ],
};
