var DataTypes = require("sequelize").DataTypes;
var _banks = require("./banks");
var _channel_callback_logs = require("./channel_callback_logs");
var _channel_to_bank = require("./channel_to_bank");
var _channels = require("./channels");
var _provider_to_bank = require("./provider_to_bank");
var _providers = require("./providers");
var _transactions = require("./transactions");
var _vas = require("./vas");

function initModels(sequelize) {
  var banks = _banks(sequelize, DataTypes);
  var channel_callback_logs = _channel_callback_logs(sequelize, DataTypes);
  var channel_to_bank = _channel_to_bank(sequelize, DataTypes);
  var channels = _channels(sequelize, DataTypes);
  var provider_to_bank = _provider_to_bank(sequelize, DataTypes);
  var providers = _providers(sequelize, DataTypes);
  var transactions = _transactions(sequelize, DataTypes);
  var vas = _vas(sequelize, DataTypes);

  channel_to_bank.belongsTo(banks, { as: "bank", foreignKey: "bank_id"});
  banks.hasMany(channel_to_bank, { as: "channel_to_banks", foreignKey: "bank_id"});
  provider_to_bank.belongsTo(banks, { as: "bank", foreignKey: "bank_id"});
  banks.hasMany(provider_to_bank, { as: "provider_to_banks", foreignKey: "bank_id"});
  vas.belongsTo(banks, { as: "bank", foreignKey: "bank_id"});
  banks.hasMany(vas, { as: "vas", foreignKey: "bank_id"});
  channel_to_bank.belongsTo(channels, { as: "channel", foreignKey: "channel_id"});
  channels.hasMany(channel_to_bank, { as: "channel_to_banks", foreignKey: "channel_id"});
  vas.belongsTo(channels, { as: "channel", foreignKey: "channel_id"});
  channels.hasMany(vas, { as: "vas", foreignKey: "channel_id"});
  provider_to_bank.belongsTo(providers, { as: "provider", foreignKey: "provider_id"});
  providers.hasMany(provider_to_bank, { as: "provider_to_banks", foreignKey: "provider_id"});
  vas.belongsTo(providers, { as: "provider", foreignKey: "provider_id"});
  providers.hasMany(vas, { as: "vas", foreignKey: "provider_id"});
  channel_callback_logs.belongsTo(transactions, { as: "transaction", foreignKey: "transaction_id"});
  transactions.hasMany(channel_callback_logs, { as: "channel_callback_logs", foreignKey: "transaction_id"});

  return {
    banks,
    channel_callback_logs,
    channel_to_bank,
    channels,
    provider_to_bank,
    providers,
    transactions,
    vas,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
