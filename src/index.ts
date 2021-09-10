import { APIGatewayEvent, Context, Callback } from "aws-lambda";
import { Channel } from "./model/Channel";
import { ISlashCommand } from "./interface/ISlashCommand";
import * as ChannelController from "./controllers/ChannelController";

const querystring = require("querystring");

interface IResponse {
  statusCode: number;
  body: string;
}

// prettier-ignore
exports.handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const res : IResponse = {
    statusCode: 0,
    body: "",
  };
  const params = querystring.parse(event.body) as ISlashCommand;
  if (process.env.VERIFICATION_TOKEN !== params.token) {
    res.statusCode = 401;
    res.body = "Unauthorized";
    return res;
  }
  res.statusCode = 200;
  switch(params.text){
    case "add":
      res.body = await ChannelController.add(params);  
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
};
