/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return store.init(sequelize, DataTypes);
}

class store extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: "phone"
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    info: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    business_hour: {
      type: DataTypes.STRING(511),
      allowNull: true
    },
    maximum_capacity: {
      type: DataTypes.INTEGER(4).UNSIGNED,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    coupon_enable: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    refresh_token: {
      type: DataTypes.STRING(511),
      allowNull: true
    },
    pw: {
      type: DataTypes.STRING(127),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'store',
    timestamps: false
    });
  return store;
  }
}
