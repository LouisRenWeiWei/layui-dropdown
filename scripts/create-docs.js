#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const chalk = require('chalk');
const { copy, exists } = require('./copy-file');
const files = [
  { name: 'index', title: '主页' },
  { name: '404', title: '404' },
  { name: 'simple', title: '简单应用' },
  { name: 'multi-direction', title: '多方向' },
  { name: 'scene', title: '场景应用' }
];

const asset = string => path.resolve(__dirname, '..', string);

for (const { name, title, params } of files) {
  ejs.renderFile(asset(`./docs/${name}.ejs`), Object.assign({}, { currentPage: name, title, asset: string => path.resolve(__dirname, '..', string) }, params), {}, function(err, str) {
    if (err) throw err;

    const targetFileName = asset(`./test/${name}.html`);

    try {
      fs.writeFile(targetFileName, str, function() {
        console.log(chalk.green(targetFileName + ' create success.'));
      });
    } catch (error) {
      console.error(error);
    }
  });
}

// exists(asset('./lib/layui'), asset('./test/js/layui'), copy);
