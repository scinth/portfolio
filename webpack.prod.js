const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	output: {
		filename: 'index-[contenthash].min.js',
		path: path.resolve(__dirname, 'dist'),
		assetModuleFilename: 'assets/[contenthash][ext]',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [/node_modules/, /dist/, /\.dev/],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime'],
						cacheDirectory: true,
					},
				},
			},
			{
				test: /\.html$/,
				use: ['html-loader'],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: 'asset/resource',
			},
		],
	},
	optimization: {
		minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			minify: {
				removeAttributeQuotes: true,
				removeComments: true,
				collapseWhitespace: true,
			},
			favicon: './src/favicon.ico',
		}),
		new MiniCssExtractPlugin({
			filename: 'style-[contenthash].min.css',
		}),
		new CleanWebpackPlugin(),
	],
};
