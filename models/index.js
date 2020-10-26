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
    operatorsAliases: config.operatorsAliases,
    define : {
    charset : config.charset,
    timestamps : config.timestamps
    }
});

const initiatedModelNames = require('./init-models').initModels(sequelize);

for(let [name, value] of Object.entries(initiatedModelNames)) {
    db[name] = value;
}

Object.keys(db).forEach( modelName => {
    console.log(`modelName : ${modelName}`);
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;