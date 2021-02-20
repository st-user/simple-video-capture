const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const packageInfo = require('./package.json');
const path = require('path');

const PROJECT_NAME = packageInfo.name;

module.exports = {
  entry: {
    main: './src/index.js',
    style: './src/style.js'
  },
  output: {
    filename: `./${PROJECT_NAME}/js/[name].js`,
    path: path.resolve(__dirname, 'dist/'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
            {
                loader: 'style-loader',
                options: {
                    injectType: 'singletonStyleTag'
                }
            },
            'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: `${PROJECT_NAME}/[hash][ext]` + '?q=' + packageInfo.version
        }
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "./html/index.html", to: `./${PROJECT_NAME}` },
        { from: "./assets/favicon.ico", to: `./${PROJECT_NAME}` }
      ],
    })
  ]
};
