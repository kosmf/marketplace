"use strict";

const express = require("express");
const router = express.Router();
const response = require("@Component/response");

const channelController = require("@Controller/ChannelController/index");
const validator = require("@Middleware/validator")

const index = (req, res, next) => response.res404(res);

router.route("/:channelId*?")
    .get(validator.channelGetValidator(), validator.validate, (req, res, next) => {
        // Route to specified channel or get list channel
        if(req.params.channelId){
            channelController.getDetailChannel(req, res).catch((error) => {
                console.error(error);
                return response.res500(res)
            })
        } else {
            channelController.getListChannel(req, res).catch((error) => {
                console.error(error);
                return response.res500(res)
            })  
        }
    });

router.all("*", index);

module.exports = router;
