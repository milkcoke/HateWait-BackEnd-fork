/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return visit_log.init(sequelize, DataTypes);
}

class visit_log extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    visit_time: {
      type: DataTypes.DATE,
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
    customer_number: {
      type: DataTypes.INTEGER(2).UNSIGNED,
      allowNull: false
    },
    member_id: {
      type: DataTypes.STRING(15),
      allowNull: true,
      references: {
        model: 'member_id',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'visit_log',
    timestamps: false
    });
  return visit_log;
  }
}
