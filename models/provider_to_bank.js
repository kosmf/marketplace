const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('provider_to_bank', {
    provider_to_bank_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    provider_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'providers',
        key: 'provider_id'
      }
    },
    bank_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'banks',
        key: 'bank_id'
      }
    },
    provider_bank_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'provider_to_bank',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "provider_to_bank_pkey",
        unique: true,
        fields: [
          { name: "provider_to_bank_id" },
        ]
      },
    ]
  });
};
