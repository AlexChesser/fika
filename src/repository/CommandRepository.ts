import mongoose = require("mongoose");
import { ICommandDocument, CommandModel } from "../model/Command";

/**
 * Database Repository class for Slack Command Events
 */
export async function add(req: any): Promise<boolean> {
	let document = req as ICommandDocument;
	document.timestamp = new Date();
	let r = new CommandModel(document);
	await r.save();
	return true;
}
