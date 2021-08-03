const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const TerserPLugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const { version } = require("./package.json");

const OUTPUT_FOLDER = path.join(__dirname, "build");
const CODEBASE = path.join(__dirname, "source");

const { NODE_ENV, MODE, PUBLIC_URL_ROOT, HOTJAR, FRESHPAINT, DEV_SERVER_PORT, DATADOG_RUM } = process.env;
const isProd = NODE_ENV === "prod";

const urlPrefix = MODE === "WEBSITE" ? PUBLIC_URL_ROOT : "";
const isHotjarEnabled = HOTJAR === "true";
const isFreshpaintEnabled = FRESHPAINT === "true";
const isDataDogRumEnabled = DATADOG_RUM === "true";
const publicPath = `${urlPrefix}/${version}/`;

const railsTransformer = mode => ({
	loader: "shell-loader",
	options: {
		script: `bundle exec ruby transformer.rb ${mode}`,
		cwd: "./rails",
		maxBuffer: Math.pow(1024, 3),
		env: { ...process.env, wfe_version: version }
	}
});

const htmlExporter = {
	loader: "file-loader",
	options: {
		name: "[path][name].html"
	}
};

const assetExporter = (regex, folder) => ({
	test: regex,
	use: [
		{
			loader: "file-loader",
			options: {
				outputPath: folder,
				name: "[name].[ext]",
				publicPath: `${publicPath}${folder}`
			}
		}
	]
});

const entry = {
	vendor: "./javascripts/vendor.js",
	strings: "./javascripts/strings.js.erb",
	routes: "./javascripts/routes.js.erb",
	main: "./javascripts/index.js"
};
if (isHotjarEnabled) {
	entry.hotjar = "./javascripts/hotjar.js";
}
if (isFreshpaintEnabled) {
	entry.freshpaint = "./javascripts/freshpaint.js.erb";
}
if (isDataDogRumEnabled) {
	entry.datadogrum = "./javascripts/datadog-rum.js.erb";
}

module.exports = {
	context: CODEBASE,

	devServer: {
		contentBase: OUTPUT_FOLDER,
		contentBasePublicPath: publicPath,
		compress: true,
		port: DEV_SERVER_PORT || 4567,
		stats: "errors-only",
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
		}
	},

	devtool: `${isProd ? "hidden-" : ""}source-map`,

	entry: entry,

	optimization: {
		minimize: isProd,
		minimizer: [
			new TerserPLugin({
				extractComments: true,
				parallel: true,
				terserOptions: {
					output: {
						comments: /@license/i
					}
				}
			})
		]
	},

	output: {
		filename: "javascripts/[name].js",
		path: OUTPUT_FOLDER,
		publicPath
	},

	resolve: {
		extensions: [".js", ".js.erb", ".ts", ".tsx", ".css", ".scss", ".scss.erb"]
	},

	module: {
		rules: [
			{
				test: /\.erb$/,
				use: railsTransformer("erb")
			},

			{
				test: /\.tsx?$/,
				use: [
					{ loader: "babel-loader" },
				],
				exclude: /node_modules/
			},

			{
				test: /\.(slim)$/,
				use: [htmlExporter, railsTransformer("slim")]
			},

			assetExporter(/\.(png|jpe?g|gif|svg)$/i, "images"),

			assetExporter(/\.(eot|woff2?|ttf)$/i, "fonts"),

			{
				test: /\.css$/i,
				include: path.join(__dirname, "node_modules"),
				use: ["style-loader", "css-loader"]
			},

			{
				test: /\.scss(\.erb)?$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", railsTransformer("erb"), "sass-loader"]
			},

			{
				test: path.resolve(__dirname, "node_modules/normalize.css"),
				use: "null-loader"
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": JSON.stringify(process.env)
		}),
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
			"window._": "underscore"
		}),
		new CopyPlugin([{ from: "images/favicons/*", to: OUTPUT_FOLDER }])
	]
};
