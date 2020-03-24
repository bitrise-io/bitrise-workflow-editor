const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const TerserPLugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const { version } = require("./package.json");

const OUTPUT_FOLDER = path.join(__dirname, "build");
const CODEBASE = path.join(__dirname, "source");

const { NODE_ENV, MODE } = process.env;
const isProd = NODE_ENV === "prod";

const urlPrefix = MODE === "WEBSITE" ? "bitrise_workflow_editor-" : "";
const publicPath = isProd ? `/${urlPrefix}${version}/` : "";

const railsTransformer = mode => ({
	loader: "shell-loader",
	options: {
		script: `bundle exec ruby transformer.rb ${mode}`,
		cwd: "./rails",
		maxBuffer: Math.pow(1024, 3),
		env: { ...process.env, version },
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
				publicPath: path.join(publicPath, `/${folder}`)
			}
		}
	]
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
		main: "./javascripts/index.js"
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
				use: "ts-loader",
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
