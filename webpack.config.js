const path = require('path');
const { existsSync, readFileSync } = require('fs');
const { ProvidePlugin, DefinePlugin } = require('webpack');

const CopyPlugin = require('copy-webpack-plugin');
const TerserPLugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

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

const railsTransformer = (mode) => ({
  loader: 'shell-loader',
  options: {
    script: `bundle exec ruby transformer.rb ${mode}`,
    cwd: './rails',
    maxBuffer: 1024 ** 3,
    env: { ...process.env, wfe_version: version },
  },
});

const htmlExporter = {
  loader: 'file-loader',
  options: {
    name: '[path][name].html',
  },
};

const entry = {
  vendor: './javascripts/vendor.js',
  strings: './javascripts/strings.js.erb',
  routes: './javascripts/routes.js.erb',
  main: './javascripts/index.js',
};
if (isClarityEnabled) {
  entry.clarity = './javascripts/clarity.js';
}
if (isDataDogRumEnabled) {
  entry.datadogrum = './javascripts/datadog-rum.js.erb';
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
    extensions: ['.js', '.js.erb', '.ts', '.tsx', '.css', '.scss', '.scss.erb'],
  },
  module: {
    rules: [
      /* --- Javascript & TypeScript --- */
      {
        test: /\.(stories|mswMocks?|mocks?|specs?|tests?)\.tsx?$/i,
        use: 'ignore-loader',
      },
      {
        test: /\.erb$/i,
        use: railsTransformer('erb'),
      },
      {
        test: /\.tsx?$/i,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
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
        test: /\.(slim)$/i,
        use: [htmlExporter, railsTransformer('slim')],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss(\.erb)?$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', railsTransformer('erb'), 'sass-loader'],
      },

      /* --- Images --- */
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        generator: {
          filename: '[name]-[hash][ext][query]',
          outputPath: 'images',
          publicPath: isWebsiteMode ? `${publicPath}images/` : '/images/',
        },
      },

      /* --- Fonts --- */
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset',
        generator: {
          filename: '[name]-[hash][ext][query]',
          outputPath: 'fonts',
          publicPath: isWebsiteMode ? `${publicPath}fonts/` : '/fonts/',
        },
      },
    ],
  },

  /* --- Plugins --- */
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
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
      patterns: [{ from: 'images/favicons/*', to: OUTPUT_FOLDER }],
    }),
    new DefinePlugin({
      'process.env.MODE': JSON.stringify(MODE || 'WEBSITE'),
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV || 'development'),
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
  ],
};
