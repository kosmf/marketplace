const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salesorderdetails', {
    orderlineno: {
      type: DataTypes.STRING(40),
      allowNull: false,
      primaryKey: true
    },
    orderno: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    koli: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    stkcode: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    qtyinvoiced: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    unitprice: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    estimate: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    discountpercent: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    discountpercent2: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    actualdispatchdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    completed: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    narrative: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    itemdue: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Due date for line item.  Some customers require \\r\\nacknowledgements with due dates by line item"
    },
    poline: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Some Customers require acknowledgements with a PO line number for each sales line"
    },
    migration: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    success: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Success Migration Message"
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Error Migration Message"
    },
    executed: {
      type: DataTypes.DATE,
      allowNull: true
    },
    marketplace: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shop: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salesorderdetails',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "salesorderdetails_pkey",
        unique: true,
        fields: [
          { name: "orderlineno" },
        ]
      },
    ]
  });
};
