'use strict';

const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const getLocalIP = require('./utils/getLocalIP');
const { info, clearConsole } = require('./utils/logger');
const webpackDevConf = require('./webpack.dev.conf');

const devServerOptions = webpackDevConf.devServer;
const protocol = devServerOptions.https ? 'https' : 'http';
const host = devServerOptions.host;
const port = devServerOptions.port;

info('Starting development server...');

const compiler = webpack(webpackDevConf);
const server = new WebpackDevServer(devServerOptions, compiler);

compiler.hooks.done.tap('serve', (stats) => {
  if (stats.hasErrors()) {
    return;
  }
  clearConsole();
  console.log();
  console.log();
  console.log(`App running at:`);
  console.log(`  - Local:   ${chalk.cyan(`${protocol}://localhost:${port}`)}`);
  console.log(`  - Network: ${chalk.cyan(`${protocol}://${getLocalIP()}:${port}`)}`);
  console.log();
});

server.start(port, host, (err) => {
  if (err) {
    process.exit(0);
  }
});
