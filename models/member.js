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
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      unique: "phone_2"
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false
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
