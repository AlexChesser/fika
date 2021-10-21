import mongoose = require("mongoose");
import { IFikaActiveUserSubscriptionGroup } from "../interface/IFikaActiveUserSubscriptionGroup";
import { makeFikaUserSubscriptionKey, IFikaUserSubscriptionDocument, FikaUserSubscriptionModel } from "../model/FikaUserSubscription";

/**
 * Database Repository class for Fika User Subscriptions
 */
export async function add(req: any, weeks: number = 4): Promise<boolean> {
	const key = makeFikaUserSubscriptionKey(req);

	let document = req as IFikaUserSubscriptionDocument;
	const command = new FikaUserSubscriptionModel(document).toObject();
	delete command["_id"];
	await FikaUserSubscriptionModel.updateOne(
		key,
		{ ...command, frequency: weeks },
		{ upsert: true }
	).exec();

	return true;
}

export async function remove(req: any): Promise<boolean> {
	const key = makeFikaUserSubscriptionKey(req);

	await FikaUserSubscriptionModel.deleteOne(key).exec();

	return true;
}

export async function getListForUserID(req: any): Promise<(IFikaUserSubscriptionDocument & { _id: any })[]> {
	const data = await FikaUserSubscriptionModel.find({
		team_id: req.team_id,
		user_id: req.user_id,
	}).exec();
	return data;
}

export async function getActiveSubscriptions(date: Date = new Date()): Promise<IFikaActiveUserSubscriptionGroup[]> {
	var pipeline: any[] = [
		{
			// left align fikagroups
			"$lookup": {
				"from": "fikagroups",
				"as": "groups",
				// assign variables for team_id, channel_id user_id
				"let": {
					"fg_team_id": "$team_id",
					"fg_channel_id": "$channel_id",
					"fg_user_id": "$user_id",
				},
				"pipeline": [
					// find subscriptions that have not yet expired
					{
						"$match": {
							"expired": {
								"$gt": date
							},
						},
					},
					// unwind the user_id from members collection, ie members is an array of user_ids, but we want to create a unique record per user_id
					// members = [1, 2, 3] becomes {user_id:1}, {user_id:2}, {user_id:3}
					{
						"$unwind": {
							"path": "$members",
						},
					}, {
						"$set": {
							"user_id": "$members.user_id",
						},
					}, {
						"$unset": [
							"members"
						],
					},
					// join FikaGroup to FikaUserSubscription
					{
						"$match": {
							"$expr": {
								"$and": [
									{ "$eq": ["$team_id", "$$fg_team_id"] },
									{ "$eq": ["$channel_id", "$$fg_channel_id"] },
									{ "$eq": ["$user_id", "$$fg_user_id"] },
								]
							}
						},
					},
				]
			}
		}, {
			// find the size of active groups and then subtract it from the frequency required
			"$set": {
				"active": {
					"$size": "$groups"
				},
				"remaining": {
					"$subtract": [
						"$frequency",
						{
							"$size": "$groups"
						}
					]
				}
			},
		},
		// find all user subscriptions that sill need to match
		{
			"$match": {
				"remaining": {
					"$gt": 0
				},
			},
		},
		{
			"$group": {
				// group records by team_id and channel_id
				_id: {
					team_id: "$team_id",
					channel_id: "$channel_id"
				},
				// convert results to match user subscriptions record
				subscriptions: {
					"$push": {
						team_id: "$team_id",
						channel_id: "$channel_id",
						channel_name: "$channel_name",
						user_id: "$user_id"
					}
				}
			}
		},
		{
			"$set": {
				team_id: "$_id.team_id",
				channel_id: "$_id.channel_id"
			}
		}
	];

	console.dir(pipeline, { depth: null });


	let data = await FikaUserSubscriptionModel.aggregate(pipeline);

	return data;
}
