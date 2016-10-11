import * as path from 'path';
const WebpackMd5Hash = require('webpack-md5-hash');
const CompressionPlugin = require('compression-webpack-plugin');
import * as webpack from 'webpack';

const autoprefixer = require('autoprefixer');
const postcssAssets = require('postcss-assets');

export const getWebpackProdConfigPartial = function(projectRoot: string, appConfig: any) {
  return {
    devtool: 'source-map',
    output: {
      path: path.resolve(projectRoot, appConfig.outDir),
      filename: '[name].bundle.js',
      sourceMapFilename: '[name].bundle.map',
      chunkFilename: '[id].[chunkhash].chunk.js'
    },
    resolve: {
      alias: {
        'masonry': 'masonry-layout',
        'isotope': 'isotope-layout'
      }
    },
    plugins: [
      new WebpackMd5Hash(),
      new webpack.optimize.UglifyJsPlugin(<any>{
        mangle: { screw_ie8 : true },
        compress: { screw_ie8: true }
      }),
      new CompressionPlugin({
          asset: '[path].gz[query]',
          algorithm: 'gzip',
          test: /\.js$|\.html$/,
          threshold: 10240,
          minRatio: 0.8
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          tslint: {
            emitErrors: true,
            failOnHint: true,
            resourcePath: path.resolve(projectRoot, appConfig.root)
          },
          htmlLoader: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?\]?=/]
          },
          postcss: function () {
            return [autoprefixer, postcssAssets()];
          }
        }
      })
    ],
    node: {
      fs: 'empty',
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  };
};
