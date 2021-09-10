"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const mongoose_1 = require("mongoose");
const ChannelSchema = new mongoose_1.Schema({
    team_id: String,
    channel_id: String,
    channel_name: String,
    user_ids: [String],
});
exports.Channel = (0, mongoose_1.model)("Channel", ChannelSchema);
