"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");

const lazadaController = require("@root/controllers/Lazada");

const index = (req, res, next) => response.res404(res);

router.route("/getOrderList")
    .get(async (req, res, next) => {
        await lazadaController.getOrderList(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/getToken")
    .get(async (req, res, next) => {
        await lazadaController.getToken(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/refreshToken")
    .get(async (req, res, next) => {
        await lazadaController.refreshToken(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.all("*", index);

module.exports = router;
