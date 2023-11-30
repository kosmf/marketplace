"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");

const tokopediaController = require("@root/controllers/Tokopedia");
const { getToken, getShop } = require("@Middlewares/tokopedia")

const index = (req, res, next) => response.res404(res);

router.route("/getOrderList")
    .get(getToken, getShop, async (req, res, next) => {
        await tokopediaController.getOrderList(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/getOrder/:order_id")
.get(getToken, async (req, res, next) => {
    await tokopediaController.getSingleOrder(req, res, next).catch((error) => {
        console.error(error);
        return response.res500(res)
    })
});

router.route("/getShop")
.get(getToken, async (req, res, next) => {
    await tokopediaController.getShop(req, res, next).catch((error) => {
        console.error(error);
        return response.res500(res)
    })
});

router.route("/stressTest")
.get(async (req, res, next) => {
    await tokopediaController.stressTest(req, res, next).catch((error) => {
        console.error(error);
        return response.res500(res)
    })
});

router.all("*", index);

module.exports = router;
