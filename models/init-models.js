var DataTypes = require("sequelize").DataTypes;
var _salesorderdetails = require("./salesorderdetails");
var _salesorders = require("./salesorders");

function initModels(sequelize) {
  var salesorderdetails = _salesorderdetails(sequelize, DataTypes);
  var salesorders = _salesorders(sequelize, DataTypes);


  return {
    salesorderdetails,
    salesorders,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
