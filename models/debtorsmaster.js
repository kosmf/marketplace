const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('debtorsmaster', {
    debtorno: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      defaultValue: ""
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    address1: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    address2: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    address3: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    address4: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ""
    },
    address5: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    address6: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    country: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    kodepos: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: ""
    },
    currcode: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: ""
    },
    salestype: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      defaultValue: ""
    },
    clientsince: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    holdreason: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    paymentterms: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      defaultValue: "f"
    },
    discount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    pymtdiscount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    lastpaid: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    lastpaiddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    creditlimit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1000
    },
    targetbulan: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1000
    },
    targettahun: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1000000
    },
    ikut: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    invaddrbranch: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    discountcode: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      defaultValue: ""
    },
    ediinvoices: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    ediorders: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    edireference: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    editransport: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: "email"
    },
    ediaddress: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ""
    },
    ediserveruser: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    ediserverpwd: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    taxref: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    customerpoline: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    typeid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1
    },
    language_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "en_GB.utf8"
    },
    alokasi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    idseller: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'debtorsmaster',
    schema: 'public',
    timestamps: false
  });
};
