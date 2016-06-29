import path from 'path'
import webpack from 'webpack'

export default {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: 'http://localhost:8090/dist/',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['', '.vue', '.js']
  },
  externals: {
    jquery: 'jQuery',
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/,},
      {test: /\.vue$/, loader: 'vue', exclude: /node_modules/,}
    ]
  },
  babel: {
    presets: ['es2015']
  },
  devServer: {
    // contentBase: 'index/'
    inline : true,
		host : 'localhost',
		port : '8090'
  },
  Plugins: [
    new webpack.ProvidePlugin({
      //把jquery模块暴露成全局变量，这样就不需要require('jquery')了
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
        // NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // new webpack.optimize.MinChunkSizePlugin(minSize),//压缩插件，用法未研究
  ],
}
