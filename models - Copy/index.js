const models = require("./init-models");
const db = require("@Configs/database");

module.exports = models(db);
