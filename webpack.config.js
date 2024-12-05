const path = require('path');
const { existsSync, readFileSync } = require('fs');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserPLugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { ProvidePlugin, DefinePlugin } = require('webpack');
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
    compress: true,
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
      // This makes all dependencies of this file - build dependencies
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
        test: /\.(stories|mswMocks?|mocks?|spec)\.tsx?$/i,
        use: 'ignore-loader',
      },
      {
        test: /\.erb$/i,
        use: railsTransformer('erb'),
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              sourceMap: !isProd,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            allowTsInNodeModules: true,
            compilerOptions: {
              sourceMap: !isProd,
            },
          },
        },
        include: /node_modules\/@bitrise\/bitkit/,
      },

      /* --- HTML & CSS --- */
      {
        test: /\.(slim)$/,
        use: [htmlExporter, railsTransformer('slim')],
      },
      {
        test: /\.css$/i,
        include: path.join(__dirname, 'node_modules'),
        use: ['style-loader', 'css-loader'],
      },
      {
        test: path.resolve(__dirname, 'node_modules/normalize.css'),
        use: 'null-loader',
      },
      {
        test: /\.s[ac]ss(\.erb)?$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', railsTransformer('erb'), 'sass-loader'],
      },

      /* --- Images --- */
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          outputPath: 'images',
          filename: '[name]-[hash][ext][query]',
          publicPath: `${publicPath}images/`,
        },
      },

      /* --- Fonts --- */
      {
        test: /\.(eot|woff2?|ttf)$/i,
        type: 'asset/resource',
        generator: {
          outputPath: 'fonts',
          filename: '[name]-[hash][ext][query]',
          publicPath: `${publicPath}fonts/`,
        },
      },
    ],
  },

  /* --- Plugins --- */
  plugins: [
    new webpack.EnvironmentPlugin({ MODE: MODE || 'WEBSITE', NODE_ENV: NODE_ENV || 'development' }),
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
