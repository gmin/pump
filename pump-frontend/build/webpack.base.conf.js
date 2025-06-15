const { VantResolver } = require('@vant/auto-import-resolver');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const dayjs = require('dayjs');
const ESLintPlugin = require('eslint-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
// const AutoImport = require('unplugin-auto-import/webpack');
const ComponentsPlugin = require('unplugin-vue-components/webpack');
const { VueLoaderPlugin } = require('vue-loader');
const { DefinePlugin, ProvidePlugin } = require('webpack');

const config = require('../config');
const { version } = require('../package.json');

const paths = require('./utils/paths');

const isProd = process.env.NODE_ENV === 'production';
const outputFileName = `js/[name]${isProd ? '.[contenthash:8]' : ''}.js`;

module.exports = {
  context: process.cwd(),

  // externals: {
  //   vconsole: 'VConsole',
  // },

  entry: {
    app: './src/main.js',
  },

  output: {
    path: paths.resolve(config.outputDir),
    publicPath: '/',
    filename: outputFileName,
    chunkFilename: outputFileName,
  },

  resolve: {
    alias: {
      '@': paths.resolve('src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.mjs'],
    fallback: {
      buffer: require.resolve('buffer'),
    },
  },

  module: {
    noParse: /^(vue|vue-router|pinia)$/,
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.m?jsx?$/,
        exclude: (file) => {
          // always transpile js in vue files
          if (/\.vue\.jsx?$/.test(file)) {
            return false;
          }
          // Don't transpile node_modules
          return /node_modules/.test(file);
        },
        use: ['thread-loader', 'babel-loader'],
      },
      {
        test: /\.tsx?$/,
        use: [
          'thread-loader',
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: ['\\.vue$'],
              happyPackMode: true,
            },
          },
        ],
      },

      // images
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },

      // do not base64-inline SVGs.
      // https://github.com/facebookincubator/create-react-app/pull/1180
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
        exclude: [paths.resolve('src/assets/svgIcons')],
      },

      {
        test: /\.(svg)(\?.*)?$/,
        generator: { filename: 'img/[contenthash:8][ext][query]' },
        include: [paths.resolve('src/assets/svgIcons')],
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: '[name]',
            },
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                {
                  name: 'removeAttrs',
                  params: {
                    attrs: ['fill', 'fill-rule'],
                  },
                },
              ],
            },
          },
        ],
      },
      // media
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'media/[contenthash:8][ext][query]' },
      },

      // fonts
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: { filename: 'fonts/[contenthash:8][ext][query]' },
      },
    ],
  },

  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'], // ['包名', '包中的值']
    }),
    new VueLoaderPlugin(),
    new HTMLPlugin({
      template: paths.resolve('public/index.html'),
      templateParameters: {
        BASE_URL: '/',
      },
    }),
    new CaseSensitivePathsPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: paths.resolve('public'),
          toType: 'dir',
          globOptions: {
            ignore: ['.DS_Store', '**/index.html'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new ESLintPlugin({
      emitError: true,
      emitWarning: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
      formatter: require('eslint-formatter-friendly'),
    }),
    new DefinePlugin({
      // vue3 feature flags <http://link.vuejs.org/feature-flags>
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      'process.env': {
        ...config.env,
        VERSION: JSON.stringify(version),
        BUILD_TIME: JSON.stringify(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      },
    }),

    // AutoImport.default({
    //   resolvers: [VantResolver()],
    // }),

    ComponentsPlugin({
      dirs: [paths.resolve('src/components')],
      dts: false,
      resolvers: [VantResolver()],
    }),
  ],
};
