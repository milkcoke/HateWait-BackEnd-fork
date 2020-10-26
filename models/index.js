const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const config = require('../config/sequelize_setting');
const db = {};

//timestamp : true 일 경우 createAt, updateAt, deleteAt 칼럼이 자동생성됨

const sequelize = new Sequelize(config.database, config.username, config.password, {
    dialect : config.dialect,
    port : config.port,
    host : config.host,
    define : {
    charset : config.charset,
    timestamps : config.timestamps
    }
});

const initiatedModelNames = require('./init-models').initModels(sequelize);

for(let [name, value] of Object.entries(initiatedModelNames)) {
    db[name] = value;
}

console.log('first db console : ' + db);

Object.keys(db).forEach( modelName => {
    console.log(`modelName : ${modelName}`);
    if (db[modelName].associate in db[modelName]) {
        db[modelName].associate(db);
    }
});
console.log('second db console : ' + db);
// fs
//     .readdirSync(__dirname)
//     .filter(function(file) {
//         // 모든 model 파일들 걸러냄.
//         return (file.indexOf(".") !== 0 && file !== "index.js" && file !== "init-models.js");
//     })
//     .forEach(function(file) {
//         console.log('file string : ' + file);
//         const model = require(path.join(__dirname, file));
//         console.log('model : ' + model);
//         db[model.name] = model;
//         console.log('model.name:' + model.name);  // 테스트로그 model명..
//     });



db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;