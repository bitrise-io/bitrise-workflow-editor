const path = require("path")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

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
    }
  }],
});

module.exports = {
  entry: {
    site: [
      "./source/javascripts/index.js",
      "./source/stylesheets/main.scss"
    ],
  },

  output: {
    filename: "source/javascripts/[name].js",
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
      test: /\.scss(.erb)?$/,
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
    })
  ]
};