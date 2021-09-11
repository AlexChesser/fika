import { ICommand } from "../interface/ICommand";

import * as mongoose from "mongoose";
import { Command, ICommandDocument, makeCommandKey } from "../model/Command";

export async function add(req: ICommand, weeks: number): Promise<string> {
  let message: string = "you should not be getting this message :'(";
  const key = makeCommandKey(req);
  await mongoose.connect(process.env.MONGODB_URI || "");
  const command = new Command(req as ICommandDocument).toObject();
  delete command["_id"];
  await Command.updateOne(
    key,
    { ...command, frequency: weeks },
    { upsert: true }
  ).exec();
  message = "You have been added to the channel";
  mongoose.connection.close();
  return message;
}

export async function remove(req: ICommand): Promise<string> {
  let message: string = "you should not be getting this message :'(";
  const key = makeCommandKey(req);
  await mongoose.connect(process.env.MONGODB_URI || "");
  await Command.deleteOne(key).exec();
  message = "You have been removed from this channel's pairings'";
  mongoose.connection.close();
  return message;
}

export async function list(req: ICommand): Promise<string> {
  let message: string = "you should not be getting this message :'(";
  await mongoose.connect(process.env.MONGODB_URI || "");
  const data = await Command.find({
    team_id: req.team_id,
    user_id: req.user_id,
  }).exec();
  // TODO build a slack response type
  const list: any = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "You have joined the following channels:",
        },
      },
    ],
  };
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    message = `<#${c.channel_id}> no more than once every *${c.frequency}* weeks.\n`;
    if (c.lastMatch) {
      message += `You last matched on ${c.lastMatch} and your next won't happen before ${c.nextMatch}`;
    }
    list.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: message,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "This button does nothing :rocket:",
          emoji: true,
        },
        value: c.channel_id,
        action_id: "leave",
      },
    });
  }
  mongoose.connection.close();
  return list;
}
