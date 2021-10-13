import mongoose = require("mongoose");
import { ICommandDocument, CommandModel } from "../model/Command";

/**
 * Database Repository class for Slack Command Events
 */
export async function add(req: any): Promise<boolean> {
	await mongoose.connect(process.env.MONGODB_URI || "");

	let document = req as ICommandDocument;
	document.timestamp = new Date();
	let r = new CommandModel(document);
	await r.save();

	await mongoose.connection.close();
	return true;
}
