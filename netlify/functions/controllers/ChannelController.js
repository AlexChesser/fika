"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = void 0;
const Channel_1 = require("../model/Channel");
const mongoose = require("mongoose");
function add(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let message = "you should not be getting this message :'(";
        const channel_key = {
            team_id: req.team_id,
            channel_id: req.channel_id,
        };
        yield mongoose.connect(process.env.MONGODB_URI || "");
        const channel = yield Channel_1.Channel.findOne(channel_key).exec();
        if (!channel) {
            yield Channel_1.Channel.updateOne(channel_key, new Channel_1.Channel(Object.assign(Object.assign({}, channel_key), { user_ids: [req.user_id] })), {
                upsert: true,
            }).exec();
            message = `You're the first member of this channel who wants to Fika! Maybe make a post inviting others to sign up!`;
        }
        else {
            if (channel.user_ids.indexOf(req.user_id) < 0) {
                channel.user_ids.push(req.user_id);
                channel.save();
                message = `You've been added to this channel's fika! There are ${channel.user_ids.length} other participants`;
            }
            else {
                message = `You're already part of this channel's fika party! woo hoo! (:dancing-penguin:)`;
            }
        }
        return message;
    });
}
exports.add = add;
