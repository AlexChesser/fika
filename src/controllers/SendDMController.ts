import { logger } from '../logger';
import { WebClient } from "@slack/web-api";
import * as FikaGroupRepository from "../repository/FikaGroupRepository";

import * as APP_SETTINGS from '../app_settings';

var sendDMToGroup = async (client: WebClient, users: string[]) => {
	let sendDMToGroup = (process.env.SEND_DM_TO_GROUP || "true").toLowerCase() == "true";

	let overrideUserID = (process.env.OVERRIDE_USER_ID || "");
	let s = users.map(x => (overrideUserID == "") ? x : overrideUserID);

	if (!sendDMToGroup) {
		logger.info("not sending dm to users:", users);
		return;
	}

	// open IM channel (direct message) with members
	let result = await client.conversations.open({ users: s.join(',') })
	if (result.channel === null || result.channel?.id === null) {
		throw "Could not open conversation with members";
	}

	// post message to IM channel
	logger.info("post message to channel", result.channel!!!.id!!!)

	let msg = APP_SETTINGS.config.DM_MESSAGE(s, result.channel!!!.id!!!)
	await client.chat.postMessage({
		channel: result.channel!!!.id!!!,
		text: msg
	})
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



