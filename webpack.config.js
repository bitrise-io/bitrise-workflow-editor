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
    outputPath: "templates/",
    name: "[name].html",
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
  entry: {
    vendor: "./source/javascripts/vendor.js",
    main: [
      "./source/javascripts/index.js",
      "./source/stylesheets/main.scss"
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
      test: /\.(erb)/,
      use: railsTransformer("erb")
    },

    {
      test: /\.(slim)/,
      use: [
        htmlExporter,
        railsTransformer("slim")
      ]
    },

    assetExporter(/\.(png|jpe?g|gif|svg)$/i, "images"),

    assetExporter(/\.(eot|woff2?|ttf)$/i, "fonts"),

    {
      test: /\.s?css(.erb)?$/,
      use: ExtractTextPlugin.extract({
        use: [
          "css-loader",
          "sass-loader",
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