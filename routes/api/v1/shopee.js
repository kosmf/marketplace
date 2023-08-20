"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");

const shopeController = require("@root/controllers/Shopee");
// const { getToken } = require("@Middlewares/tokopedia")

const index = (req, res, next) => response.res404(res);

router.route("/getOrderList")
    .get(async (req, res, next) => {
        await shopeController.getOrderList(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.all("*", index);

module.exports = router;
