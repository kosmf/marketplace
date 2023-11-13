"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Components/response");
const rpcController = require("@root/controllers/xml-rpc");

const lazadaController = require("@root/controllers/Lazada");
// const lazadaController = require("@root/controllers/Lazada_backup");

const index = (req, res, next) => response.res404(res);

router.route("/xmlRPC/listMethod")
    .get(async (req, res, next) => {
        await rpcController.listMethod(req, res, next)
    });

router.route("/xmlRPC/getCapabilities")
    .get(async (req, res, next) => {
        await rpcController.getCapabilities(req, res, next)
    });

router.route("/xmlRPC/methodSignature")
    .get(async (req, res, next) => {
        await rpcController.methodSignature(req, res, next)
    });
router.route("/xmlRPC/methodHelp")
    .get(async (req, res, next) => {
        await rpcController.methodHelp(req, res, next)
    });

router.route("/xmlRPC/insertSO")
    .get(async (req, res, next) => {
        await rpcController.insertSO(req, res, next)
    });

router.route("/xmlRPC/insertSOD")
    .get(async (req, res, next) => {
        await rpcController.insertSOD(req, res, next)
    });

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

router.route("/callback")
    .get(async (req, res, next) => {
        await lazadaController.callback(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.route("/callback")
    .post(async (req, res, next) => {
        await lazadaController.callback(req, res, next).catch((error) => {
            console.error(error);
            return response.res500(res)
        })
    });

router.all("*", index);

module.exports = router;
