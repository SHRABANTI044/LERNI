// Empty module used to satisfy Node core module imports (e.g. `fs` from
// face-api.js) in browser bundles. Webpack 5 / CRA 5 does not polyfill these.
const emptyModule = {};
export default emptyModule;
