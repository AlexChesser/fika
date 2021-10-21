import mongoose = require("mongoose");
import { makeFikaGroupKey, IFikaGroupDocument, FikaGroupModel } from "../model/FikaGroup";

/**
 * Database Repository class for Fika Groups
 */
export async function upsert(req: any): Promise<boolean> {
	const key = makeFikaGroupKey(req);

	let document = req as IFikaGroupDocument;
	const command = new FikaGroupModel(document).toObject();
	delete command["_id"];
	await FikaGroupModel.updateOne(
		key,
		command,
		{ upsert: true }
	).exec();

	return true;
}

export async function findPendingDMs(): Promise<(IFikaGroupDocument & { _id: any })[]> {
	let data = await FikaGroupModel.find({
		notified: null, // has not been notified
		expired: { // has not expired
			"$gt": new Date()
		}
	}).exec();
	return data;
}
