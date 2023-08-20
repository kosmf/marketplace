const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salesorders', {
    orderno: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    debtorno: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    branchcode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    customerref: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    buyername: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "NULL"
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "longblob"
    },
    orddate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    ordertype: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    shipvia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    deladd1: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    deladd2: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    deladd3: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    deladd4: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: "NULL"
    },
    deladd5: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    deladd6: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    contactphone: {
      type: DataTypes.STRING(25),
      allowNull: true,
      defaultValue: "NULL"
    },
    contactemail: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: "NULL"
    },
    deliverto: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    deliverblind: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 1
    },
    freightcost: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    fromstkloc: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    deliverydate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    confirmeddate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    printedpackingslip: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    datepackingslipprinted: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    quotation: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    quotedate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    poplaced: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    salesperson: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    userid: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salesorders',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "salesorders_pkey",
        unique: true,
        fields: [
          { name: "orderno" },
        ]
      },
    ]
  });
};
