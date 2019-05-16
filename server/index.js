import SourceMapSupport from 'source-map-support';
SourceMapSupport.install();
import 'babel-polyfill';
import http from 'http';

import { MongoClient } from 'mongodb';

let appModule = require('./server.js');
let client;
let server;

MongoClient.connect('mongodb://localhost:27017')
  .then(connection => {
    client = connection;
    server = http.createServer();
    appModule.setDb(client);

    server.on('request', appModule.app);
    server.listen(3000, () => {
      console.log('App started on port 3000.');
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });

if (module.hot) {
  module.hot.accept('./server.js', () => {
    server.removeListener('request', appModule.app);
    appModule = require('./server.js'); // eslint-disable-line
    appModule.setDb(client);
    server.on('request', appModule.app);
  });
}
