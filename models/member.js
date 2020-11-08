/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return member.init(sequelize, DataTypes);
}

class member extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: "phone_2"
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    no_show: {
      type: DataTypes.INTEGER(2).UNSIGNED,
      allowNull : false,
      defaultValue : 0
    },
    pw: {
      type: DataTypes.STRING(127),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'member',
    timestamps: false
    });
  return member;
  }
}
