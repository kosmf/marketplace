const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('channel_callback_logs', {
    channel_callback_log_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    transaction_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'transaction_id'
      }
    },
    request_data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    response_data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    response_status: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    is_error: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'channel_callback_logs',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "channel_callback_logs_pkey",
        unique: true,
        fields: [
          { name: "channel_callback_log_id" },
        ]
      },
      {
        name: "channelcallbacklogs_iserror_index",
        fields: [
          { name: "is_error" },
        ]
      },
    ]
  });
};
