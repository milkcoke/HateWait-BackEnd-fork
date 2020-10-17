var DataTypes = require("sequelize").DataTypes;
var _visit_log = require("./visit_log");
var _coupon = require("./coupon");
var _member = require("./member");
var _coupon_information = require("./coupon_information");
var _store = require("./store");
var _waiting_customer = require("./waiting_customer");

function initModels(sequelize) {
  var visit_log = _visit_log(sequelize, DataTypes);
  var coupon = _coupon(sequelize, DataTypes);
  var member = _member(sequelize, DataTypes);
  var coupon_information = _coupon_information(sequelize, DataTypes);
  var store = _store(sequelize, DataTypes);
  var waiting_customer = _waiting_customer(sequelize, DataTypes);

  return {
    visit_log,
    coupon,
    member,
    coupon_information,
    store,
    waiting_customer,
  };
}
module.exports = { initModels };
