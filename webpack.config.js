const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");

const railsTransformer = (mode) => ({
  loader: "shell-loader",
  options: {
    script: `bundle exec ruby rails_transformer.rb ${mode}`
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
    main: [
      "./javascripts/index.js",
      "./stylesheets/main.scss"
    ],
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
      test: /\.(erb)$/,
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
      use: ExtractTextPlugin.extract({
        use: [
          "css-loader",
          "sass-loader",
          railsTransformer("erb")
        ]
      })
    }]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: "stylesheets/[name].css"
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /vs\/editor\/editor\.main/
    })
  ]
};