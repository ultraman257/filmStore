const r = require('rethinkdbdash')({
  host: process.env.rethinkdb ? process.env.rethinkdb : '127.0.0.1',
  db: process.env.dbName
});

module.exports = r;
