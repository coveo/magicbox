// https://www.npmjs.com/package/express
// Fast, unopinionated, minimalist web framework
import express = require('express');

// https://www.npmjs.com/package/minimist
// parse argument options
import optimist = require('optimist');

import Routing = require('./Routing');
import Info = require('./Info');

interface Options extends Info.Options {
  port?:number;
  config?:string;
}

class Main {
  constructor(options:Options) {
    var app = express();

    new Routing(app);
    new Info(options, app);

    app.listen(options.port || 3000);
  }
}

// load options from arguments
var options:Options = optimist(process.argv).argv;

if (options.config != null) {
  // load options from config file
  var configOption:Options = require(options.config);
  Object.keys(options).forEach((key)=> {
    configOption[key] = options[key];
  });
  options = configOption;
}

new Main(options);