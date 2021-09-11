import { ICommand } from "../interface/ICommand";

import * as mongoose from "mongoose";
import { Command } from "../model/Command";

export async function add(req: ICommand): Promise<string> {
  let message: string = "you should not be getting this message :'(";
  const key = {
    team_id: req.team_id,
    channel_id: req.channel_id,
    user_id: req.user_id,
  };
  await mongoose.connect(process.env.MONGODB_URI || "");
  const command = new Command(req);
  await Command.updateOne(key, command, { upsert: true }).exec();
  message = "You have been added to the channel";
  return message;
}
