import { ISlashCommand } from "../interface/ISlashCommand";
import { Channel } from "../model/Channel";
import * as mongoose from "mongoose";

export async function add(req: ISlashCommand): Promise<string> {
  let message: string = "you should not be getting this message :'(";
  const channel_key = {
    team_id: req.team_id,
    channel_id: req.channel_id,
  };
  await mongoose.connect(process.env.MONGODB_URI || "");
  const channel = await Channel.findOne(channel_key).exec();
  if (!channel) {
    await Channel.updateOne(
      channel_key,
      new Channel({
        ...channel_key,
        user_ids: [req.user_id],
      }),
      {
        upsert: true,
      }
    ).exec();
    message = `You're the first member of this channel who wants to Fika! Maybe make a post inviting others to sign up!`;
  } else {
    if (channel.user_ids.indexOf(req.user_id) < 0) {
      channel.user_ids.push(req.user_id);
      channel.save();
      message = `You've been added to this channel's fika! There are ${channel.user_ids.length} other participants`;
    } else {
      message = `You're already part of this channel's fika party! woo hoo! (:dancing-penguin:)`;
    }
  }
  return message;
}
