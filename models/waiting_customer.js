/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return waiting_customer.init(sequelize, DataTypes);
}

class waiting_customer extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    phone: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    store_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'store',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    people_number: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    is_member: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'waiting_customer',
    timestamps: false
    });
  return waiting_customer;
  }
}
