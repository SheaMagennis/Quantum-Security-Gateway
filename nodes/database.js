const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database( '../DB/modelInfo', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const addQuery = db.prepare(`INSERT INTO modelInput VALUES ? ? ? ?`);
const getModelsQuery = db.prepare(`SELECT modelName,modelTypes from modelInput`);
const getModelDetailQuery = db.prepare(`SELECT modelName,modelTypes from modelInput`);
const getRMQuery = db.prepare(`DELETE from modelInput WHERE modelName=? AND modelType=?`);


function initialize() {
  db.serialize(() => {
    db.run(`DROP TABLE model`);
    db.run(`DROP TABLE modelInput`);
    db.run(`CREATE TABLE if not exists model (name VARCHAR(100), modelType CHAR(4), PRIMARY KEY(name, modelType))`);
    db.run(`CREATE TABLE if not exists modelInput (name VARCHAR(100), header VARCHAR(100), type VARCHAR(100), modelType CHAR(4), PRIMARY KEY(name, modelType, header))`);
  });
}

function addData(modelName, modelType, headers, types) {
  for (let i = 0; i < headers.length; i++) {
    addQuery.run(modelName, modelType, headers[i], types[i]);
  }
}

function getModels(modelName, modelType) {
  getModelsQuery.run(modelName, modelType);
}

function getModelDetail(modelName, modelType) {
  getModelDetailQuery.run(modelName, modelType);
}

function removeModel(modelName, modelType) {
  getRMQuery.run(modelName, modelType);
}

/*
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
*/

module.exports = {
  addData,
  getModelDetail,
  getModels,
  removeModel,
};
