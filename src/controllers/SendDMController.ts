import { logger } from '../logger';
import { WebClient } from "@slack/web-api";
import * as FikaGroupRepository from "../repository/FikaGroupRepository";

var sendDMToGroup = async (client: WebClient, users: string[]) => {
	let sendDMToGroup = (process.env.SEND_DM_TO_GROUP || "true").toLowerCase()=="true";


	try {
		let overrideUserID = (process.env.OVERRIDE_USER_ID || "");
		let s = users.map(x => (overrideUserID == "") ? x : overrideUserID).join(",");

		if (!sendDMToGroup) {
			console.log("not sending dm to users:", users);
			return;
		}

		// open IM channel (direct message) with members
		let result = await client.conversations.open({
			users:s
		})
		if (result.channel === null || result.channel?.id === null) {
			throw "Could not open conversation with members";
		}

		// post message to IM channel
		logger.info("post message to channel", result.channel!!!.id!!!)

		let msg = "Hey gang!  You've been matched!"
		await client.chat.postMessage({
			channel: result.channel!!!.id!!!,
			text: msg
		})
	} catch (e) {
		// TODO - hate swallowing errors like this.  Handle errors better later
		logger.error("There was an error:" + e);
	}
}


export var processCommand = async (client: WebClient) => {
	// get all pending dms
	logger.info("fetch pending dms")
	let groups = await FikaGroupRepository.findPendingDMs();

	// randomly assign groups
	logger.info("send dm")
	// for each group
	// - send direct message to group to coordinate meetup
	// - update notified field
	for (let group of groups) {
		// send dm to group
		let users = group.members.map(r => r.user_id + "");
		logger.info("send dm to users:", users);
		await sendDMToGroup(client, users);

		// save group match in db
		group.notified = new Date();
		logger.info("update group:", group);
		await FikaGroupRepository.upsert(group);
	}

	return {
		statusCode: 200,
		body: "send-dm",
	};
};



