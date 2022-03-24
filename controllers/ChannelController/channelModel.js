"use strict";
const { channels } = require("@Model/index")

exports.getChannelById = async (channelId) => {
    return channels.findOne({
        raw: true,
        where: {
            channel_id: channelId
        }
    })
};

exports.getAllChannel = async (limit, page) => {
    const offset = +limit * (+page - 1);
    return channels.findAll({
        raw: true,
        attributes: ["channel_id", "identifier", "name", "callback_url"],
        limit,
        offset
    })
}