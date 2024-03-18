const path = require("path");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const TerserPLugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const { version } = require("./package.json");

const OUTPUT_FOLDER = path.join(__dirname, "build");
const CODEBASE = path.join(__dirname, "source");

const { NODE_ENV, MODE, PUBLIC_URL_ROOT, HOTJAR, FRESHPAINT, SEGMENT, DEV_SERVER_PORT, DATADOG_RUM } = process.env;
const isProd = NODE_ENV === "prod";
const isWebsiteMode = MODE === "WEBSITE";
const urlPrefix = isWebsiteMode ? PUBLIC_URL_ROOT : "";
const isHotjarEnabled = HOTJAR === "true";
const isFreshpaintEnabled = FRESHPAINT === "true";
const isDataDogRumEnabled = DATADOG_RUM === "true";
const isSegmentEnabled = SEGMENT === "true";
const publicPath = `${urlPrefix}/${version}/`;

const railsTransformer = (mode) => ({
	loader: "shell-loader",
	options: {
		script: `bundle exec ruby transformer.rb ${mode}`,
		cwd: "./rails",
		maxBuffer: Math.pow(1024, 3),
		env: { ...process.env, wfe_version: version },
	},
});

const htmlExporter = {
	loader: "file-loader",
	options: {
		name: "[path][name].html",
	},
};

const entry = {
	vendor: "./javascripts/vendor.js",
	strings: "./javascripts/strings.js.erb",
	routes: "./javascripts/routes.js.erb",
	main: "./javascripts/index.js",
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
if (isSegmentEnabled) {
	entry.segment = "./javascripts/segment.js.erb";
}

module.exports = {
	context: CODEBASE,
	mode: isProd ? "production" : "development",
  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, ".webpack_cache"),
    buildDependencies: {
      config: [__filename],
    },
  },
	devServer: {
		compress: true,
		watchFiles: "./source/**/*",
		port: DEV_SERVER_PORT || 4567,
		allowedHosts: ["host.docker.internal", "localhost"],
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
		},
		devMiddleware: {
			stats: "errors-only",
		},
		static: {
			directory: OUTPUT_FOLDER,
			publicPath: publicPath,
		},
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
		hints: "error",
		maxAssetSize: 20000000,
		maxEntrypointSize: 40000000,
	},

	output: {
		filename: "javascripts/[name].js",
		path: OUTPUT_FOLDER,
		publicPath,
	},

	resolve: {
		extensions: [".js", ".js.erb", ".ts", ".tsx", ".css", ".scss", ".scss.erb"],
	},

	module: {
		rules: [
			{
				test: /\.erb$/i,
				use: railsTransformer("erb"),
			},
			{
				test: /\.tsx?$/,
				use: {
					loader: "ts-loader",
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
					loader: "ts-loader",
					options: {
						allowTsInNodeModules: true,
						compilerOptions: {
							sourceMap: !isProd,
						},
					},
				},
				include: /node_modules\/@bitrise\/bitkit/,
			},

			{
				test: /\.(slim)$/,
				use: [htmlExporter, railsTransformer("slim")],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: "asset/resource",
				generator: {
					outputPath: "images",
					filename: "[name]-[hash][ext][query]",
					publicPath: `${publicPath}images/`,
				},
			},
			{
				test: /\.(eot|woff2?|ttf)$/i,
				type: "asset/resource",
				generator: {
					outputPath: "fonts",
					filename: "[name]-[hash][ext][query]",
					publicPath: `${publicPath}fonts/`,
				},
			},
			{
				test: /\.css$/i,
				include: path.join(__dirname, "node_modules"),
        use: [MiniCssExtractPlugin.loader, "css-loader"],
			},

			{
				test: /\.s[ac]ss(\.erb)?$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader", railsTransformer("erb"), "sass-loader"],
			},

			{
				test: path.resolve(__dirname, "node_modules/normalize.css"),
				use: "null-loader",
			},
		],
	},
	plugins: [
		new webpack.EnvironmentPlugin({ MODE: MODE || "WEBSITE" }),
		new CompressionPlugin({
			algorithm: "gzip",
			test: /.js$|.css$/,
		}),
		new MiniCssExtractPlugin({
			filename: "stylesheets/[name].css",
		}),
		new MonacoWebpackPlugin({
			languages: ["yaml"],
			customLanguages: [
				{
					label: "yaml",
					entry: "monaco-yaml",
					worker: {
						id: "monaco-yaml/yamlWorker",
						entry: "monaco-yaml/yaml.worker",
					},
				},
			],
			features: [
				"!accessibilityHelp",
				"!bracketMatching",
				"!caretOperations",
				"!clipboard",
				"!codeAction",
				"!codelens",
				"!colorDetector",
				"!contextmenu",
				"!cursorUndo",
				"!dnd",
				"!fontZoom",
				"!format",
				"!gotoError",
				"!gotoSymbol",
				"!hover",
				"!iPadShowKeyboard",
				"!inPlaceReplace",
				"!inspectTokens",
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
				"!wordPartOperations",
			],
		}),
		new ProvidePlugin({
			"window.jQuery": "jquery",
			"window._": "underscore",
		}),
		new CopyPlugin({
			patterns: [{ from: "images/favicons/*", to: OUTPUT_FOLDER }],
		}),
	],
};
