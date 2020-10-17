const DataTypes = require("sequelize").DataTypes;
const _visit_log = require("./visit_log");
const _coupon = require("./coupon");
const _member = require("./member");
const _coupon_information = require("./coupon_information");
const _store = require("./store");
const _waiting_customer = require("./waiting_customer");

function initModels(sequelize) {
  const visit_log = _visit_log(sequelize, DataTypes);
  const coupon = _coupon(sequelize, DataTypes);
  const member = _member(sequelize, DataTypes);
  const coupon_information = _coupon_information(sequelize, DataTypes);
  const store = _store(sequelize, DataTypes);
  const waiting_customer = _waiting_customer(sequelize, DataTypes);

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
