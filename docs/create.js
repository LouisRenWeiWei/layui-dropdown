#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const chalk = require('chalk');

const files = [
  { name: 'index', title: '主页' },
  { name: '404', title: '404' },
  { name: 'simple', title: '简单应用' },
  { name: 'multi-direction', title: '多方向' },
  { name: 'scene', title: '场景应用' }
];

const asset = string => path.resolve(__dirname, 'src', string);

for (const { name, title, params } of files) {
  ejs.renderFile(path.resolve(__dirname, 'src', name + '.ejs'), Object.assign({}, { currentPage: name, title, asset }, params), {}, function(err, str) {
    if (err) throw err;

    const targetFileName = path.resolve(__dirname, '..', 'test', name + '.html');

    try {
      fs.writeFile(targetFileName, str, function() {
        console.log(chalk.green(targetFileName + ' create success.'));
      });
    } catch (error) {
      console.error(error);
    }
  });
}
