const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { IgnorePlugin, ProvidePlugin } = require("webpack");

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
  context: path.join(__dirname, 'source'),

  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    port: 4567
  },

  entry: {
    vendor: "./javascripts/vendor.js",
    main: "./javascripts/index.js",
  },

  output: {
    filename: "javascripts/[name].js",
    path: path.resolve(__dirname, "build")
  },

  resolve: {
    extensions: [".js", ".js.erb", ".json", ".scss", ".scss.erb"]
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
      test: /\.s?css(\.erb)?$/,
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
    new IgnorePlugin({
      resourceRegExp: /vs\/editor\/editor\.main/
    }),
    new ProvidePlugin({
      "window.jQuery": "jquery",
      "window._": "underscore",
    })
  ]
};