import { name } from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { eslint } from 'rollup-plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';
import liveServer from 'rollup-plugin-live-server';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import chalk from 'chalk';

const { NODE_ENV, ROLLUP_WATCH } = process.env;

console.log(chalk.yellowBright(`执行环境：${NODE_ENV}`));
console.log(chalk.yellowBright(`服务启动：${ROLLUP_WATCH}`));

const isProd = NODE_ENV === 'production';
const isWatch = ROLLUP_WATCH === 'true';

export default {
  input : 'src/index.js',
  output: {
    file   : isProd ? `dist/${name}.min.js` : `test/${name}.js`,
    format : 'iife',
    name   : 'dropdown',
    globals: {
      layui: 'layui'
    },
    sourcemap: !isProd
  },
  external: ['layui'],
  plugins : [
    json(),
    eslint(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    resolve(),
    babel({
      exclude: ['node_modules/**']
    }),
    commonjs(),
    postcss({
      plugins: [autoprefixer, isProd && cssnano],
      extract: isProd ? `dist/${name}.min.css` : `test/${name}.css`
    }),
    isWatch && liveServer({
      port: 3000,
      root: 'test',
      file: 'index.html',
      open: false,
      wait: 500
    }),
    isProd && uglify({
      compress: {
        pure_getters: true,
        unsafe      : true,
        unsafe_comps: true,
        warnings    : false
      }
    })
  ]
};
