const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const config = require('../config/sequelize_setting');

const db = {};

const sequelize = new Sequelize(
    config.DB_NAME,
    config.DB_USER,
    config.DB_PASSWORD,
    config.options
);

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        // 모든 model 파일들 걸러냄.
        return (file.indexOf(".") !== 0) && (file !== "index.js" || file !== "init-models.js");
    })
    .forEach(function(file) {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
        console.log('model.name:' + model.name);  // 테스트로그 model명..
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;