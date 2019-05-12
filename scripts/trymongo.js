'use strict';
const MongoClient = require('mongodb').MongoClient;

function usage() {
  console.log('Usage:');
  console.log('node', __filename, '<option>');
  console.log('Where option is one of');
  console.log('  callbacks Use the callback paradigm');
  console.log('  promises Use the Promises paradigm');
  console.log('  generator Use the Generator paradigm');
  console.log('  async Use the async module');
}

function testWithCallbacks() {
  MongoClient.connect('mongodb://localhost:27017', function(err, client) {
    const db = client.db('playground');
    db.collection('employees').insertOne(
      { id: 1, name: 'A. Callback' },
      function(err, result) {
        console.log('Result of insert:', result.insertedId);
        db.collection('employees')
          .find({ id: 1 })
          .toArray(function(err, docs) {
            console.log('Result of find:', docs);
            client.close();
          });
      }
    );
  });
}

function testWithPromises() {
  let client;
  MongoClient.connect('mongodb://localhost:27017').then(connection => {
    client = connection;
    const db = client.db('playground');
    return db
      .collection('employees')
      .insertOne({ id: 1, name: 'B. Promises' })
      .then(result => {
        console.log('Result of insert:', result.insertedId);
        return db
          .collection('employees')
          .find({ id: 1 })
          .toArray();
      })
      .then(docs => {
        console.log('Result of find:', docs);
        client.close();
      })
      .catch(err => {
        console.log('ERROR', err);
      });
  });
}

function testWithGenerator() {
  const co = require('co');
  co(function*() {
    const client = yield MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('playground');
    const result = yield db
      .collection('employees')
      .insertOne({ id: 1, name: 'C. Generator' });
    console.log('Result of insert:', result.insertedId);

    const docs = yield db
      .collection('employees')
      .find({ id: 1 })
      .toArray();
    console.log('Result of find:', docs);

    client.close();
  }).catch(err => {
    console.log('ERROR', err);
  });
}

function testWithAsync() {
  console.log('testWithAsync:');
  const async = require('async');
  let client;
  let db;
  async.waterfall(
    [
      next => {
        MongoClient.connect('mongodb://localhost:27017', next);
      },
      (connection, next) => {
        client = connection;
        db = client.db('playground');
        db.collection('employees').insertOne({ id: 1, name: 'D. Async' }, next);
      },
      (result, next) => {
        console.log('Insert result: ', result.insertedId);
        db.collection('employees')
          .find({ id: 1 })
          .toArray(next);
      },
      (docs, next) => {
        console.log('Result of find: ', docs);
        client.close();
        next(null, 'All done');
      }
    ],
    (err, result) => {
      if (err) {
        console.log('ERROR', err);
      } else {
        console.log(result);
      }
    }
  );
}

if (process.argv.length < 3) {
  console.log('Incorect number of argument');
  usage();
} else {
  if (process.argv[2] === 'callbacks') {
    testWithCallbacks();
  } else if (process.argv[2] === 'promises') {
    testWithPromises();
  } else if (process.argv[2] === 'generator') {
    testWithGenerator();
  } else if (process.argv[2] === 'async') {
    testWithAsync();
  } else {
    console.log('Invalid option:', process.argv[2]);
    usage();
  }
}
