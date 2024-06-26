"use strict";
const { Sequelize, DataTypes } = require("sequelize");
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

const db = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  timezone: "+07:00",
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

db.authenticate()
  .then(() => console.log(`Connected to database : ${DB_HOST}:${DB_PORT}`))
  .catch(() => console.error(`Unable to connect to the database!`));

const salesorders = require("@Models/salesorders");
const salesorderdetails = require("@Models/salesorderdetails");
const custbranch = require("@Models/custbranch");
const debtorsmaster = require("@Models/debtorsmaster");
const log_marketplace = require("@Models/log_marketplace");
const log_rpc = require("@Models/log_rpc");

module.exports = {
  salesorders: salesorders(db, DataTypes),
  salesorderdetails: salesorderdetails(db, DataTypes),
  custbranch: custbranch(db, DataTypes),
  debtorsmaster: debtorsmaster(db, DataTypes),
  log_marketplace: log_marketplace(db, DataTypes),
  log_rpc: log_rpc(db, DataTypes),
};
