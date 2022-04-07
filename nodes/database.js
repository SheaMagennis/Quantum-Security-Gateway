const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database( './../DB/modelInfo', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

//const addQuery = db.prepare('INSERT INTO modelInput VALUES ? ? ? ?');
//const getModelsQuery = db.prepare('SELECT name,modelType from modelInput');
const getModelDetailQuery = db.prepare('SELECT DISTINCT header,type from modelInput WHERE name=? AND modelType=?');
//const getRMQuery = db.prepare('DELETE from modelInput WHERE name=? AND modelType=?');

function initialize() {
  db.serialize(() => {
    db.run(`DROP TABLE model`);
    db.run(`DROP TABLE modelInput`);
    db.run(`CREATE TABLE if not exists model (name VARCHAR(100), modelType CHAR(4), PRIMARY KEY(name, modelType))`);
    db.run(`CREATE TABLE if not exists modelInput (name VARCHAR(100), header VARCHAR(100), type VARCHAR(100), modelType CHAR(4), PRIMARY KEY(name, modelType, header))`);
  });
}
/*
function addData(modelName, modelType, headers, types) {
  for (let i = 0; i < headers.length; i++) {
    addQuery.run(modelName, modelType, headers[i], types[i]);
  }
}

function getModels(modelName, modelType) {
  getModelsQuery.run(modelName, modelType);
}
*/
function getModelDetail(modelName, modelType,callback) {
  // let details = getModelDetailQuery.run(modelName, modelType);
  //return await getModelDetailQuery.run('testnu', 'qsvc');
  let val = []
  db.all(`SELECT DISTINCT header,type from modelInput WHERE name=? AND modelType=?`, modelName, modelType, function(err,rows){
    console.log(rows[0])
    console.log(rows)
    val = rows
    return callback(rows)
    //return rows
//rows contain values while errors, well you can figure out.
});//db.run(`SELECT DISTINCT header,type from modelInput WHERE name='testnu' AND modelType='qsvc'`);
}
/*
function removeModel(modelName, modelType) {
  getRMQuery.run(modelName, modelType);
}
*/
/*
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
*/
getModelDetail("testnu", "qsvc", function(resp) {
  console.log("here")
  console.log(typeof(resp[0]))
  console.log(resp[0].header)
  console.log(resp.header)
  let x = resp.map( y => y.header)
  let z = resp.map( w => w.type)
  console.log(x)
})//.then(r => console.log("here: "+r + r[0]))

module.exports = {
  //addData,
  getModelDetail,
  //getModels,
  //removeModel,
};

