const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('channel_to_bank', {
    channel_to_bank_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    channel_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'channels',
        key: 'channel_id'
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
    provider_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'channel_to_bank',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "channel_to_bank_pkey",
        unique: true,
        fields: [
          { name: "channel_to_bank_id" },
        ]
      },
    ]
  });
};
