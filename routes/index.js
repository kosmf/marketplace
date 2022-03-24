"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Component/response");

const index = (req, res, next) => response.res404(res);

router.all("/", index);
router.use("/api", require("./api"));
router.all("*", index);

module.exports = router;
