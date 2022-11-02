const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SOURCE = path.resolve(__dirname, 'src');

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	output: {
		filename: 'index-[contenthash].min.js',
		path: path.resolve(__dirname, 'dist'),
		assetModuleFilename: 'assets/[contenthash][ext]',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: SOURCE,
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
				use: 'html-loader',
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(png|jpe?g|gif|svg|pdf)$/i,
				include: SOURCE,
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
	],
};
