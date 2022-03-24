const models = require("./init-models");
const db = require("@Config/database");

module.exports = models(db);
