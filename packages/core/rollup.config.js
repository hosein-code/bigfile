const commonjs = require('@rollup/plugin-node-resolve')
const resolve = require('@rollup/plugin-commonjs')
const babel = require('@rollup/plugin-babel')
const typescript = require('@rollup/plugin-typescript')

module.exports = {
  input: './src/index.ts',
  output: [
    {
      file: `./dist/core.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `./dist/core.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
    resolve({ extensions: ['.js', '.jsx'] }),
    commonjs(),
    babel({
      presets: [],
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
  ],
};
