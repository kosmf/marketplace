"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");

const shopeController = require("@root/controllers/Shopee");
// const { tokenAuth } = require("@Middlewares/shopee")

const index = (req, res, next) => response.res404(res);

router.route("/getToken/:shopId/:authCode")
    .get(async (req, res, next) => {
        await shopeController.getToken(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });
    
router.route("/refreshToken/:shopId")
    .get(async (req, res, next) => {
        await shopeController.refreshToken(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });
router.route("/getOrderList/:shopId")
    .get(async (req, res, next) => {
        await shopeController.getOrderList(req, res, next).catch((error) => {
            console.log("ERROR NI")
            console.error(error);
            return response.res500(res, error)
        })
    });
router.route("/getOrderDetail")
    .get(async (req, res, next) => {
        await shopeController.getOrderDetail(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.all("*", index);

module.exports = router;
