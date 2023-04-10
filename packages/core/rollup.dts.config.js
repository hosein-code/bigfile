const dts = require('rollup-plugin-dts').default

module.exports = {
  input: './dist/packages/core/src/index.d.ts',
  output: {
    file: `./dist/core.d.ts`,
    format: 'es'
  },
  plugins: [
    dts()
  ],
};
