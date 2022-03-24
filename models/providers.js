const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('providers', {
    provider_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    identifier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "providers_identifier_key"
    },
    name: {
      type: DataTypes.STRING(100),
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
    }
  }, {
    sequelize,
    tableName: 'providers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "providers_identifier_index",
        fields: [
          { name: "identifier" },
        ]
      },
      {
        name: "providers_identifier_key",
        unique: true,
        fields: [
          { name: "identifier" },
        ]
      },
      {
        name: "providers_isactive_index",
        fields: [
          { name: "is_active" },
        ]
      },
      {
        name: "providers_pkey",
        unique: true,
        fields: [
          { name: "provider_id" },
        ]
      },
    ]
  });
};
