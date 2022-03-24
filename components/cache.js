"use strict";

const NodeCache = require("node-cache");

exports.sampleCache = new NodeCache({ stdTTL: 3, checkperiod: 5 });
