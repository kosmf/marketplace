"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");

const tiktokController = require("@root/controllers/Tiktok");

const index = (req, res, next) => response.res404(res);

router.route("/getToken")
    .get(async (req, res, next) => {
        await tiktokController.getToken(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/refreshToken")
    .get(async (req, res, next) => {
        await tiktokController.refreshToken(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/getOrderList")
    .get(async (req, res, next) => {
        await tiktokController.getOrderList(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/getOrderDetail")
    .get(async (req, res, next) => {
        await tiktokController.getOrderDetail(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.all("*", index);

module.exports = router;
