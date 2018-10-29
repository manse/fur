const md5 = require('md5');
const path = require('path');
const { fromPairs } = require('ramda');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const now = Date.now();
const prod = require('yargs').argv.mode === 'production';
const cssModulesScopedName = prod ? '_[hash:base64:12]' : '[name]__[local]___[hash:base64:5]';
const dependencies = [
  {
    from: `node_modules/react/umd/react.${prod ? 'production.min' : 'development'}.js`,
    to: `${md5('react' + now)}.js`,
    module: 'react',
    global: 'React'
  },
  {
    from: `node_modules/react-dom/umd/react-dom.${prod ? 'production.min' : 'development'}.js`,
    to: `${md5('react-dom' + now)}.js`,
    module: 'react-dom',
    global: 'ReactDOM'
  },
  {
    from: `node_modules/recompose/dist/Recompose.min.js`,
    to: `${md5('recompose' + now)}.js`,
    module: 'recompose',
    global: 'Recompose'
  },
  {
    from: 'node_modules/mobx/lib/mobx.umd.min.js',
    to: `${md5('mobx' + now)}.js`,
    module: 'mobx',
    global: 'mobx'
  },
  {
    from: 'node_modules/mobx-react/index.min.js',
    to: `${md5('mobx-react' + now)}.js`,
    module: 'mobx-react',
    global: 'mobxReact'
  },
  {
    from: 'node_modules/ramda/dist/ramda.min.js',
    to: `${md5('ramda' + now)}.js`,
    module: 'ramda',
    global: 'R'
  },
  {
    from: 'node_modules/konva/konva.min.js',
    to: `${md5('konva' + now)}.js`,
    module: 'konva',
    global: 'Konva'
  }
];
const rules = [
  {
    test: /\.pug$/,
    use: 'pug-loader'
  },
  {
    test: /\.(jpe?g|gif|png)$/,
    use: 'file-loader?name=assets/images/[hash].[ext]'
  },
  {
    test: /\.inline\.svg$/,
    use: [
      'babel-loader',
      {
        loader: 'react-svg-loader',
        options: {
          svgo: {
            plugins: [{ removeAttrs: { attrs: 'data.*|id|fill' } }, { removeTitle: true }, { removeStyleElement: true }]
          }
        }
      }
    ]
  },
  {
    test: /^(?!.*\.inline\.svg$).*\.svg$/,
    use: [
      'file-loader?name=assets/images/[hash].[ext]',
      {
        loader: 'svgo-loader',
        options: {
          plugins: [{ removeAttrs: { attrs: 'data.*' } }, { removeTitle: true }]
        }
      }
    ]
  },
  {
    test: /\.p?css$/,
    use: [
      prod ? MiniCssExtractPlugin.loader : 'style-loader',
      'css-loader?modules=true&importLoaders=1&sourceMap=true&localIdentName=' + cssModulesScopedName,
      {
        loader: 'postcss-loader',
        options: {
          plugins: _ => [
            require('postcss-simple-vars')({
              variables: require('./src/styles/constant.js')
            }),
            require('postcss-color-function')(),
            require('postcss-calc')(),
            require('postcss-cssnext')(),
            require('postcss-nested')(),
            require('postcss-preset-env')()
          ]
        }
      }
    ]
  },
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: prod ? ['@babel/preset-env'] : [],
          plugins: [
            'transform-react-jsx',
            [
              'react-css-modules',
              {
                generateScopedName: cssModulesScopedName,
                webpackHotModuleReloading: true,
                handleMissingStyleName: prod ? 'throw' : 'warn',
                filetypes: {
                  '.pcss': {
                    syntax: 'postcss-scss'
                  }
                }
              }
            ]
          ]
        }
      },
      'awesome-typescript-loader'
    ]
  },
  { enforce: 'pre', test: /\.js$/, use: 'source-map-loader' }
];

module.exports = () => ({
  context: process.cwd(),
  mode: prod ? 'production' : 'development',
  entry: ['./src/index.tsx'],
  output: {
    filename: `${prod ? md5('bundle' + now) : 'bundle'}.js`,
    path: path.join(__dirname, './public')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  watch: !prod,
  devtool: prod ? '_' : 'source-map',
  performance: { hints: false },
  devServer: {
    open: true,
    contentBase: 'public',
    overlay: true,
    hot: true
  },
  externals: fromPairs(dependencies.map(({ module, global }) => [module, global])),
  plugins: [
    new CleanWebpackPlugin(['public']),
    new HtmlWebpackPlugin({
      template: './src/index.pug'
    }),
    new CopyWebpackPlugin(dependencies.map(({ to, from }) => ({ to, from }))),
    new ScriptExtHtmlWebpackPlugin({ defaultAttribute: 'defer' }),
    new MiniCssExtractPlugin({
      filename: prod ? `${md5('style' + now)}.css` : '[name].css'
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: [...dependencies.map(({ to }) => to), ...(prod ? [`${md5(now)}.css`] : [])],
      append: false
    }),
    new OptimizeCSSAssetsPlugin({}),
    new ErrorOverlayPlugin({})
  ],
  module: {
    rules
  }
});
