import mongoose = require("mongoose");
import { makeCommandKey, IFikaUserSubscriptionDocument, FikaUserSubscriptionModel } from "../model/FikaUserSubscription";

/**
 * Database Repository class for Fika User Subscriptions
 */
export async function add(req: any, weeks: number = 4): Promise<boolean> {
	const key = makeCommandKey(req);
	await mongoose.connect(process.env.MONGODB_URI || "");
	let document = req as IFikaUserSubscriptionDocument;
	const command = new FikaUserSubscriptionModel(document).toObject();
	delete command["_id"];
	await FikaUserSubscriptionModel.updateOne(
		key,
		{ ...command, frequency: weeks },
		{ upsert: true }
	).exec();
	mongoose.connection.close();
	return true;
}

export async function remove(req: any): Promise<boolean> {
	const key = makeCommandKey(req);
	await mongoose.connect(process.env.MONGODB_URI || "");
	await FikaUserSubscriptionModel.deleteOne(key).exec();
	mongoose.connection.close();
	return true;
}

export async function getListForUserID(req: any): Promise<(IFikaUserSubscriptionDocument & { _id: any })[]> {
	await mongoose.connect(process.env.MONGODB_URI || "");
	const data = await FikaUserSubscriptionModel.find({
		team_id: req.team_id,
		user_id: req.user_id,
	}).exec();
	mongoose.connection.close();
	return data;
}

export async function getActiveSubscriptions(): Promise<(IFikaUserSubscriptionDocument & { _id: any })[]> {
	await mongoose.connect(process.env.MONGODB_URI || "");
	const data = await FikaUserSubscriptionModel.find().exec();
	mongoose.connection.close();
	return data;
}

