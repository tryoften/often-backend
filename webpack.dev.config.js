// This config is extented from webpack.config.js. We use it for development with webpack-dev-server and autoreload/refresh
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var path = require("path");

var mainConfig = new WebpackConfig().extend("webpack.config");

var devConfigExtension = {
	entry: {
		app: [
			// We are using next two entries for hot-reload
			'webpack-dev-server/client?http://localhost:3333',
			'webpack/hot/only-dev-server',
			'./client/less/style.less'
		].concat(mainConfig.entry.app)
	},

	output: {
		filename: 'app.js',
		publicPath: "http://localhost:3333/js/"
	},

	resolve: {
		alias: mainConfig.resolve.alias
	},

	// more options here: http://webpack.github.io/docs/configuration.html#devtool
	devtool: 'eval-source-map',

	watch: true,
	debug: true,

	module: {
		loaders: [
			{
				test: /\.ts(x?)$/,
				loaders: ['react-hot', 'ts-loader?configFileName=tsconfig.webpack.json'],
				include: path.resolve(__dirname, "app")
			},
			{ test: /\.css$/, exclude: /\.import\.css$/,  loader: "style!css", include: path.resolve(__dirname, "client") },
			{ test: /\.import\.css$/,  loader: "style!css", include: path.resolve(__dirname, "client") },
			{ test: /\.less$/, exclude: /\.woff2$/, loader: "style!css!less", include: path.resolve(__dirname, "client") },
			{ test: /\.module\.less$/, loader: "style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!less", include: path.resolve(__dirname, "client") },
			{ test: /\.(jpg|png|jpg|png|woff|eot|ttf|svg|gif)$/, loader: "file-loader?name=[name].[ext]" }
		]
	},

	plugins: [
		new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
		// Used for hot-reload
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	]
};

mainConfig.module.loaders = [];
mainConfig.resolve.alias = {};
mainConfig.plugins = [];

module.exports = mainConfig.merge(devConfigExtension);
