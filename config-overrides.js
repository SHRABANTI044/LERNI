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
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.options && Object.prototype.hasOwnProperty.call(minimizer.options, 'parallel')) {
          minimizer.options.parallel = false;
        }
      });
    }
    return config;
  }
);
