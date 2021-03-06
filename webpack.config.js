const webpack = require('webpack');

module.exports = {
  entry: {
    app: './client/Client.jsx',
    vendor: [
      'react',
      'react-dom',
      'whatwg-fetch',
      'isomorphic-fetch',
      'react-router',
      'react-bootstrap',
      'react-router-bootstrap',
    ],
  },
  output: {
    path: './static',
    filename: 'app.bundle.js',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
        },
      },
    ],
  },
  devServer: {
    port: 8888,
    contentBase: 'static',
    proxy: {
      '**': {
        target: 'http://localhost:3000',
      },
    },
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
