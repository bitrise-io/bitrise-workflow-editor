const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const { ProvidePlugin } = require("webpack");

const OUTPUT_FOLDER = path.join(__dirname, "build");
const CODEBASE = path.join(__dirname, "source");

const railsTransformer = (mode) => ({
  loader: "shell-loader",
  options: {
    script: `bundle exec ruby rails_transformer.rb ${mode}`,
    maxBuffer: Math.pow(1024, 3)
  }
});

const htmlExporter = {
  loader: "file-loader",
  options: {
    name: "[path][name].html",
  },
};

const assetExporter = (regex, folder) => ({
  test: regex,
  use: [{
    loader: "file-loader",
    options: {
      outputPath: folder,
      name: "[name].[ext]",
      publicPath: `/${folder}`,
    }
  }],
});

module.exports = {
  context: CODEBASE,

  devServer: {
    contentBase: OUTPUT_FOLDER,
    compress: true,
    port: 4567
  },

  entry: {
    vendor: "./javascripts/vendor.js",
    main: "./javascripts/index.js",
  },

  output: {
    filename: "javascripts/[name].js",
    path: OUTPUT_FOLDER
  },

  resolve: {
    extensions: [".js", ".js.erb", ".json", ".scss", ".scss.erb"],
  },

  module: {
    rules: [{
      test: /\.erb$/,
      use: railsTransformer("erb")
    },

    {
      test: /\.(slim)$/,
      use: [
        htmlExporter,
        railsTransformer("slim")
      ]
    },

    assetExporter(/\.(png|jpe?g|gif|svg)$/i, "images"),

    assetExporter(/\.(eot|woff2?|ttf)$/i, "fonts"),

    {
      test: /\.css$/,
      include: path.join(__dirname, "node_modules", "monaco-editor"),
      use: ["style-loader", "css-loader"],
    },

    {
      test: /\.scss(\.erb)?$/,
      use: [
        MiniCssExtractPlugin.loader,
        "css-loader",
        railsTransformer("erb"),
        "sass-loader",
      ]
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "stylesheets/[name].css"
    }),
    new MonacoWebpackPlugin({
      languages: ["yaml"],
      features: [
        "!accessibilityHelp",
        "!bracketMatching",
        "!caretOperations",
        "!clipboard",
        "!codeAction",
        "!codelens",
        "!colorDetector",
        "!comment",
        "!contextmenu",
        "!cursorUndo",
        "!dnd",
        "!folding",
        "!fontZoom",
        "!format",
        "!gotoError",
        "!gotoLine",
        "!gotoSymbol",
        "!hover",
        "!iPadShowKeyboard",
        "!inPlaceReplace",
        "!inspectTokens",
        "!linesOperations",
        "!links",
        "!multicursor",
        "!parameterHints",
        "!quickCommand",
        "!quickOutline",
        "!referenceSearch",
        "!rename",
        "!smartSelect",
        "!snippets",
        "!suggest",
        "!toggleHighContrast",
        "!toggleTabFocusMode",
        "!transpose",
        "!wordHighlighter",
        "!wordOperations",
        "!wordPartOperations"
      ]
    }),
    new ProvidePlugin({
      "window.jQuery": "jquery",
      "window._": "underscore",
    })
  ]
};