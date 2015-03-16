import express = require('express');

// example how to use module to export interfaces
module Info {
  export interface Options {
    detail?:any;
  }
}
import I = Info;

// this is a simple example how to add a rest router
class Info {
  constructor(options:I.Options, app:express.Application){
    var router = express.Router();

    router.get('/', (req:express.Request, res:express.Response)=>{
      res.json('Running');
    });

    router.get('/detail', (req:express.Request, res:express.Response)=>{
      res.json(options.detail);
    });

    app.use('/info', router);
  }
}
export = Info;