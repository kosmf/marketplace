const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('custbranch', {
    branchcode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    debtorno: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ""
    },
    salesman: {
      type: DataTypes.STRING(4),
      allowNull: false,
      defaultValue: ""
    },
    defaultlocation: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'custbranch',
    schema: 'public',
    timestamps: false
  });
};
