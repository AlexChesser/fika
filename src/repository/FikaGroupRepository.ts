import mongoose = require("mongoose");
import { IFikaGroupDocument, FikaGroupModel } from "../model/FikaGroup";

/**
 * Database Repository class for Fika Groups
 */
export async function add(req: any): Promise<boolean> {
	await mongoose.connect(process.env.MONGODB_URI || "");

	let document = req as IFikaGroupDocument;
	let r = new FikaGroupModel(document);
	await r.save();

	await mongoose.connection.close();
	return true;
}
