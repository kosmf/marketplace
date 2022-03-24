"use strict";
const response = require("@Component/response")
const channelModel = require("./channelModel")

exports.getDetailChannel = async (req, res) => {

    const payload = {
        channelId: req.params.channelId
    }
    
    return channelModel.getChannelById(payload.channelId).then((resultChannel) => {

        if(!resultChannel) return response.res404(res, "Channel not found");
        return response.res200(res, "Success get channel", resultChannel);
        
    })
}

exports.getListChannel = async (req, res) => {
    
    const payload = {
        limit: req.query.limit || "1000",
        page: req.query.page || "1",
    }

    return channelModel.getAllChannel(payload.limit, payload.page).then((resultAllChannel) => {

        if(!resultAllChannel.length) return response.res404(res, "Channel not found in this page or db");
        return response.res200(res, "Success get all channel", resultAllChannel, { limit: payload.limit, page: payload.page });

    })
}