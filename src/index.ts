import { APIGatewayEvent, Context, Callback } from "aws-lambda";
import { ICommand } from "./interface/ICommand";
import * as CommandController from "./controllers/CommandController";

const querystring = require("querystring");
const usage = `*Usage*:
\`/fika add [minimum number of weeks between matchups]\` eg: \`/fika 4\`
\`/fika remove\` remove yourself from the current channel's matchups
\`/fika list\` see a list of all the channels you've joined`;

interface IResponse {
  header?: any;
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
exports.handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
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
        res.header = {
          "Content-Type": "application/json"
        }  
      case "remove":
      res.body = await CommandController[textarray[0]](params);  
      break;
    default:
      res.body = usage;
      break;
  }
  return res;
};
