const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SOURCE = path.resolve(__dirname, 'src');

module.exports = {
	mode: 'development',
	output: {
		filename: '[contenthash].js',
	},
	devtool: false,
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
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(png|jpe?g|gif|svg|web(p|m)|pdf)$/i,
				include: SOURCE,
				type: 'asset/resource',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			favicon: './src/favicon.ico',
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, 'src'),
		},
		compress: true,
		port: 7777,
	},
};
