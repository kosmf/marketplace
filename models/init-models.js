var DataTypes = require("sequelize").DataTypes;
var _custbranch = require("./custbranch");
var _debtorsmaster = require("./debtorsmaster");
var _log_marketplace = require("./log_marketplace");
var _log_rpc = require("./log_rpc");
var _salesorderdetails = require("./salesorderdetails");
var _salesorders = require("./salesorders");

function initModels(sequelize) {
  var custbranch = _custbranch(sequelize, DataTypes);
  var debtorsmaster = _debtorsmaster(sequelize, DataTypes);
  var log_marketplace = _log_marketplace(sequelize, DataTypes);
  var log_rpc = _log_rpc(sequelize, DataTypes);
  var salesorderdetails = _salesorderdetails(sequelize, DataTypes);
  var salesorders = _salesorders(sequelize, DataTypes);


  return {
    custbranch,
    debtorsmaster,
    log_marketplace,
    log_rpc,
    salesorderdetails,
    salesorders,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
