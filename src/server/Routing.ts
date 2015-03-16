import express = require('express');

// Routing is use make resources and compiled files available.
class Routing {
  constructor(app:express.Application){
    app.use('/', express.static('../../resources'));
    app.use('/js', express.static('../client'));
    // this is used to have the map file liked
    app.use('/ts', express.static('../../src/client'));
    app.use('/css', express.static('../css'));
  }
}
export = Routing;