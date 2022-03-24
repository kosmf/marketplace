const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vas', {
    va_id: {
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
    channel_reference: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    provider_reference: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    account_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    create_by: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'vas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "vas_accountnumber_index",
        fields: [
          { name: "account_number" },
        ]
      },
      {
        name: "vas_channelreference_index",
        fields: [
          { name: "channel_reference" },
        ]
      },
      {
        name: "vas_pkey",
        unique: true,
        fields: [
          { name: "va_id" },
        ]
      },
      {
        name: "vas_providerreference_index",
        fields: [
          { name: "provider_reference" },
        ]
      },
    ]
  });
};
