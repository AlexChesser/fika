
import { model, Schema, Document, Model } from "mongoose";
import { ICommand } from "../interface/ICommand"

/**
 * Database Model to store incoming events from slack for logging purposes
 */

const CommandSchema = new Schema<ICommand>({
	token: String,
	command: String,
	text: String,
	response_url: String,
	trigger_id: String,

	user_id: String,
	user_name: String,

	team_id: String,
	team_domain: String,

	channel_id: String,
	channel_name: String,

	api_app_id: String,

	enterprise_id: String,
	enterprise_name: String,

	is_enterprise_install: String,

	timestamp: Date
});

export interface ICommandDocument extends Document, ICommand { }
export interface ICommandModel extends Model<ICommandDocument> { }
export const CommandModel = model<ICommandDocument>("Command", CommandSchema) as ICommandModel;

