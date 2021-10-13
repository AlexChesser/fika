import { WebClient } from "@slack/web-api";
import * as FikaUserSubscriptionRepository from "../repository/FikaUserSubscriptionRepository";
import * as FikaGroupRepository from "../repository/FikaGroupRepository";
import * as MatchingService from "../service/MatchingService"

var sendDMToGroup = async (client: WebClient, users: string[]) => {
	try {
		let msg = "Hey gang!  You've been matched!"
		let s = users.join(",")

		// open IM channel (direct message) with members
		let result = await client.conversations.open({
			users:s
		})
		if (result.channel === null || result.channel?.id === null) {
			throw "Could not open conversation with members";
		}

		// post message to IM channel
		console.log("post message to channel", result.channel!!!.id!!!)
		await client.chat.postMessage({
			channel: result.channel!!!.id!!!,
			text: msg
		})
	} catch (e) {
		// TODO - hate swallowing errors like this.  Handle errors better later
		console.log("There was an error:" + e);
	}
}


export var processCommand = async (client: WebClient) => {
	// get all active subscriptions
	console.log("fetch subscriptions")
	let data = await FikaUserSubscriptionRepository.getActiveSubscriptions();

	// randomly assign groups
	console.log("generate matches")
	let random = MatchingService.generateMatches(data, 2);

	// for each group
	// - save in DB with expiration date 7 days from now
	// - then send direct message to group to coordinate meetup
	for (var group of random) {
		// save group match in db
		group.created = new Date();
		group.expired = new Date(group.created.setDate(group.created.getDate() + 7))
		console.log("create group:", group);
		await FikaGroupRepository.add(group);

		// send dm to group
		let users = group.members.map(r => r.user_id + "");
		console.log("send dm to users:", users);
		await sendDMToGroup(client, users);
	}

	return {
		statusCode: 200,
		body: "assigned",
	};
};
