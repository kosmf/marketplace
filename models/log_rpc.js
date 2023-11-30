const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('log_rpc', {
    uid: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true
    },
    marketplace: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shop_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    executed: {
      type: DataTypes.DATE,
      allowNull: true
    },
    api: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phase: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'log_rpc',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "log_marketplace_copy1_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
