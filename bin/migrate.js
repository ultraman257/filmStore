// NOTE: Just playing around here buddy
const chalk = require("chalk");

const r = require('./database');

// yes matt you can complain about this
// and I will
const dbName = process.env.dbName;

// build database
module.exports = function() {

  // check to see if Db already exists
  r.dbList().contains(dbName) // list dbs + check for databaseExists
    .do(function(databaseExists) {
      return r.branch(
        databaseExists,
        { dbs_created: 0 },
        r.dbCreate(dbName)
      );
    }).run()
    // check tables
    .then(
      (data) => {
        if (data.dbs_created == 0) {
          createTables(r, dbName);
        } else {
          createTables(r, data.config_changes[0].new_val.name);
        }
      }, // try createTables
      (data) => console.log(data) // error
    ).catch(error => {
    console.log(error);
  })
}

function createTables(r, name) {
  // tables to create
  let tableArr = [
    'films'
  ]

  // check all tables
  for (let i = 0; i < tableArr.length; i++) {
    // check if table exists else create table
    r.db(name).tableList().contains(tableArr[i])
      .do(function (tableExists) {
        return r.branch(
          tableExists,
          { tables_created: 0 },
          r.db(name).tableCreate(tableArr[i])
        )
      }).run()
      .then(
        (data) => {console.log(`${chalk.bgGreen(chalk.whiteBright('initDatabase'))} Tables Created: ${data.tables_created}`);}
      ).catch(error => {
      console.log(error);
    })
  }

}
