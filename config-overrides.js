const path = require('path');
const { override, addWebpackAlias } = require('customize-cra');

// face-api.js imports Node's `fs` module. Webpack 5 / CRA 5 does not polyfill
// Node core modules for browser builds, which blocks production builds. Map
// `fs` to an empty module so resolution fails safely in the browser.
module.exports = override(
  addWebpackAlias({
    fs: path.resolve(__dirname, 'src/empty-module.js'),
  }),
  (config) => {
    if (config.mode === 'production') {
      config.devtool = false;
      config.optimization.minimize = false;
      const sourceMapLoaderRule = config.module.rules.find(
        (rule) => rule.enforce === 'pre' && rule.loader && rule.loader.includes('source-map-loader')
      );
      if (sourceMapLoaderRule) {
        sourceMapLoaderRule.exclude = [
          ...(Array.isArray(sourceMapLoaderRule.exclude)
            ? sourceMapLoaderRule.exclude
            : [sourceMapLoaderRule.exclude].filter(Boolean)),
          /[\\/]node_modules[\\/]face-api\.js[\\/]/i,
        ];
      }
    }
    return config;
  }
);
