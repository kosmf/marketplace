const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('banks', {
    bank_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    bank_short_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "banks_bank_short_code_key"
    },
    bank_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      unique: "banks_bank_code_key"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'banks',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "banks_bank_code_key",
        unique: true,
        fields: [
          { name: "bank_code" },
        ]
      },
      {
        name: "banks_bank_short_code_key",
        unique: true,
        fields: [
          { name: "bank_short_code" },
        ]
      },
      {
        name: "banks_bankcode_index",
        fields: [
          { name: "bank_code" },
        ]
      },
      {
        name: "banks_bankshortcode_index",
        fields: [
          { name: "bank_short_code" },
        ]
      },
      {
        name: "banks_pkey",
        unique: true,
        fields: [
          { name: "bank_id" },
        ]
      },
    ]
  });
};
