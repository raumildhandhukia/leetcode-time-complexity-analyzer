const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content.tsx',
    popup: './src/popup/index.tsx',
    background: './src/background.ts'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource'
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    assetModuleFilename: 'assets/[name][ext]'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/icons", to: "icons" },
        { from: "src/popup/popup.html", to: "popup.html" },
        { from: "src/manifest.json", to: "manifest.json" }
      ],
    }),
  ],
  optimization: {
    minimize: false
  }
};
