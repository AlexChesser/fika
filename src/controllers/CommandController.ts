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
  message = "You have joined the following channels:\n";
  for (let i = 0; i < data.length; i++) {
    message += `${data[i].channel_name} once every ${data[i].frequency} weeks.`;
    if (data[i].lastMatch) {
      message += `You were last matched on ${data[i].lastMatch}`;
    }
    message += "\n";
  }
  mongoose.connection.close();
  return message;
}
