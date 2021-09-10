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
const ChannelController = require("./controllers/ChannelController");
const querystring = require("querystring");
// prettier-ignore
exports.handler = (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const res = {
        statusCode: 0,
        body: "",
    };
    const params = querystring.parse(event.body);
    if (process.env.VERIFICATION_TOKEN !== params.token) {
        res.statusCode = 401;
        res.body = "Unauthorized";
        return res;
    }
    res.statusCode = 200;
    switch (params.text) {
        case "add":
            res.body = yield ChannelController.add(params);
            break;
        case "remove":
            break;
        case "list":
            break;
        default:
            res.body = "Sorry, I did not understand that, valid options are: add,remove,list";
            break;
    }
    return res;
});
