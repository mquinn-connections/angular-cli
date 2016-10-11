const path = require('path');

import * as webpack from 'webpack';

const autoprefixer = require('autoprefixer');
const postcssAssets = require('postcss-assets');

declare module 'webpack' {
    export interface LoaderOptionsPlugin {}
    export interface LoaderOptionsPluginStatic {
        new (optionsObject: any): LoaderOptionsPlugin;
    }
    interface Webpack {
        LoaderOptionsPlugin: LoaderOptionsPluginStatic;
    }
};

export const getWebpackDevConfigPartial = function(projectRoot: string, appConfig: any) {
  return {
    devtool: 'source-map',
    output: {
      path: path.resolve(projectRoot, appConfig.outDir),
      filename: '[name].bundle.js',
      sourceMapFilename: '[name].map',
      chunkFilename: '[id].chunk.js'
    },
    resolve: {
      alias: {
        'masonry': 'masonry-layout',
        'isotope': 'isotope-layout'
      }
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          tslint: {
            emitErrors: false,
            failOnHint: false,
            resourcePath: path.resolve(projectRoot, appConfig.root)
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
