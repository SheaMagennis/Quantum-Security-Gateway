const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database( path.resolve(__dirname, '../DB/modelInfo'), (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

/*
function initialize() {
  db.serialize(() => {
    db.run(`DROP TABLE if exists modelInput`);
    db.run(`CREATE TABLE if not exists modelInput
    (name VARCHAR(100),header VARCHAR(100),type VARCHAR(100),modelType CHAR(4),label VARCHAR(100),
    PRIMARY KEY(name, modelType, header))`);
  });
}
*/

function getModelDetail(modelName, modelType, callback) {
  db.all(`SELECT DISTINCT header,type,label from modelInput WHERE name=? AND modelType=?`,
      modelName, modelType, function(err, rows) {
        return callback(rows);
      });
}

function modelExists(modelName, modelType, callback) {
  db.all(`SELECT EXISTS(SELECT 1 FROM modelInput WHERE name=? AND modelType=?) AS value`,
      modelName, modelType, function(err, rows) {
        return callback(rows);
      });
}
/*
function stopDB() {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}
*/

// initialize();

module.exports = {
  getModelDetail,
  modelExists,
};

