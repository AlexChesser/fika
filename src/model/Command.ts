import { model, Schema, Document, Model } from "mongoose";
import { IUser } from "../interface/IUser";
import { ICommand } from "../interface/ICommand";

/* sample incoming slack request
token=gIkuvaNzQIHg97ATvDxqgjtO
&team_id=T0001
&team_domain=example
&enterprise_id=E0001
&enterprise_name=Globular%20Construct%20Inc
&channel_id=C2147483705
&channel_name=test
&user_id=U2147483697
&user_name=Steve
&command=/weather
&text=94070
&response_url=https://hooks.slack.com/commands/1234/5678
&trigger_id=13345224609.738474920.8088930838d88f008e0
&api_app_id=A123456
*/
const CommandSchema = new Schema<ICommand>({
  team_id: String,
  team_domain: String,
  enterprise_id: String,
  enterprise_name: String,
  channel_id: String,
  channel_name: String,
  user_id: String,
  user_name: String,
  command: String,
  text: String,
});
export interface ICommandDocument extends Document, ICommand {}
export interface ICommandModel extends Model<ICommandDocument> {}
export const Command = model<ICommandDocument>(
  "Command",
  CommandSchema
) as ICommandModel;
