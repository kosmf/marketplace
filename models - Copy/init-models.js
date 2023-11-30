var DataTypes = require("sequelize").DataTypes;
var _custbranch = require("./custbranch");
var _debtorsmaster = require("./debtorsmaster");
var _log = require("./log");
var _salesorderdetails = require("./salesorderdetails");
var _salesorders = require("./salesorders");

function initModels(sequelize) {
  var custbranch = _custbranch(sequelize, DataTypes);
  var debtorsmaster = _debtorsmaster(sequelize, DataTypes);
  var log = _log(sequelize, DataTypes);
  var salesorderdetails = _salesorderdetails(sequelize, DataTypes);
  var salesorders = _salesorders(sequelize, DataTypes);


  return {
    custbranch,
    debtorsmaster,
    log,
    salesorderdetails,
    salesorders,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
