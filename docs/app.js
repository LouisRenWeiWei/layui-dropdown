const ejs = require('ejs');
const path = require('path');
const http = require('http');

http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    // 渲染文件 index.ejs
    ejs.renderFile(path.resolve(__dirname, 'src/index.ejs'), {
      title: 'ejs-index',  // 渲染的数据key: 对应到了ejs中的title
      index: '首页' },  // 渲染的数据key: 对应到了ejs中的index
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.end(data);
      }
    });
  }
}).listen(3002);
