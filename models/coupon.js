/* jshint indent: 2 */

const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return coupon.init(sequelize, DataTypes);
}

class coupon extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    issue_number: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    store_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'coupon_information',
        key: 'store_id'
      }
    },
    member_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'member',
        key: 'id'
      }
    },
    //you can only use CURRENT_TIMESTAMP as the default value for a TIMESTAMP field.
    //bellow 5.5 version so use 'TIMESTAMP'
    // ORM sequelize Datatype document https://ellapresso.tistory.com/61
    //https://sequelize.readthedocs.io/en/latest/docs/models-definition/#definition
    issue_date: {
      type: 'TIMESTAMP',
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    expiration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    used_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'coupon',
    timestamps: false
    });
  return coupon;
  }
}
