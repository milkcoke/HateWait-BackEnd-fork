/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return coupon_information.init(sequelize, DataTypes);
}

class coupon_information extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    store_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'store',
        key: 'id'
      }
    },
    benefit_description: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    maximum_stamp: {
      type: DataTypes.INTEGER(4).UNSIGNED,
      allowNull: false
    },
    validity_period_days: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: true
    },
    remark: {
      type: DataTypes.STRING(511),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'coupon_information',
    timestamps: false
    });
  return coupon_information;
  }
}
