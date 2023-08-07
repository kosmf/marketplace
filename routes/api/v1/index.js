"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");

const index = (req, res, next) => response.res404(res);

router.all("/", index);
router.use("/channel", require("./channel"));
router.use("/tokopedia", require("./tokopedia"));
router.use("/shopee", require("./shopee"));
router.use("/lazada", require("./lazada"));
router.use("/tiktok", require("./tiktok"));
router.all("*", index);

module.exports = router;
