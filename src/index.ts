import { APIGatewayEvent } from "aws-lambda";
import { ICommand } from "./interface/ICommand";
import * as CommandController from "./controllers/CommandController";

const querystring = require("querystring");
// TODO: convert all text output to slack BLOCKS https://api.slack.com/block-kit
const usage = `*Usage*:
\`/fika add [minimum number of weeks between matchups]\` eg: \`/fika 4\`
\`/fika remove\` remove yourself from the current channel's matchups
\`/fika list\` see a list of all the channels you've joined`;

interface IResponse {
  headers?: any;
  statusCode: number;
  body: string;
}

function parseCommandText(text: String): string[] {
  let parts = text.split(" ");
  if (parts.length === 0) {
    throw Error("InvalidArgumentException");
  }
  if (["add", "remove", "list"].indexOf(parts[0]) < 0) {
    throw Error("InvalidArgumentException");
  }
  const IsAddCommand = parts[0] === "add";
  const IncorrectNumberOfArguments = parts.length !== 2;
  const SecondArgumentInvalid = !parseInt(parts[1]);
  if (IsAddCommand && (IncorrectNumberOfArguments || SecondArgumentInvalid)) {
    // prettier-ignore
    console.log(`IsAddCommand:${IsAddCommand} && ( IncorrectNumberOfArguments:${IncorrectNumberOfArguments} || SecondArgumentInvalid:${SecondArgumentInvalid}`);
    throw Error("InvalidArgumentException");
  }
  return parts;
}

// prettier-ignore
exports.handler = async (event: APIGatewayEvent) => {
  const res : IResponse = {
    statusCode: 0,
    body: "",
  };
  const params = querystring.parse(event.body) as ICommand;
  if (process.env.VERIFICATION_TOKEN !== params.token) {
    res.statusCode = 401;
    res.body = "Unauthorized";
    return res;
  }
  res.statusCode = 200;
  let textarray = [""];
  try {
     textarray = parseCommandText(params.text);
  } catch (error) {
    res.body = usage;
    return res;
  }
  switch(textarray[0]){
    case "add":
      res.body = await CommandController.add(params, parseInt(textarray[1]));  
      break;
      case "list":
        res.headers = {
          "Content-Type": "application/json"
        }
        res.body = JSON.stringify(await CommandController.list(params));
        break;
      case "remove":
      res.body = await CommandController.remove(params);
      break;
    default:
      res.body = usage;
      break;
  }
  return res;
};
