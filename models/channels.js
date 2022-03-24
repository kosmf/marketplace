const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('channels', {
    channel_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    identifier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "channels_identifier_key"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    callback_url: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    password_salt: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    create_by: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    callback_signing: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  }, {
    sequelize,
    tableName: 'channels',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "channels_identifier_index",
        fields: [
          { name: "identifier" },
        ]
      },
      {
        name: "channels_identifier_key",
        unique: true,
        fields: [
          { name: "identifier" },
        ]
      },
      {
        name: "channels_isactive_index",
        fields: [
          { name: "is_active" },
        ]
      },
      {
        name: "channels_pkey",
        unique: true,
        fields: [
          { name: "channel_id" },
        ]
      },
    ]
  });
};
