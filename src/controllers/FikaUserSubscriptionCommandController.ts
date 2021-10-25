import { logger } from '../utils/logger';
import * as APP_SETTINGS from '../utils/app_settings';

import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import * as FikaUserSubscriptionRepository from "../repository/FikaUserSubscriptionRepository";
import * as CommandRepository from "../repository/CommandRepository";

const parseNumber = (s: string): number => {
	try {
		return parseInt(s);
	} catch (e) {
		// invalid number of weeks
		throw "Could not parse number of weeks";
	}
};

const logCommand = async (body: SlashCommand) => {
	await CommandRepository.add(body);
};

const processAdd = async (body: SlashCommand, respond: RespondFn, params: string[]) => {
	logger.info("Adding user subscription")
	var frequency = APP_SETTINGS.config.DEFAULT_FREQUENCY;
	if (params.length >= 2) {
		frequency = parseNumber(params[1]);
	}

	if (!(await FikaUserSubscriptionRepository.add(body, frequency))) {
		await respond(APP_SETTINGS.config.ADD_FAILURE_MESSAGE());
		return;
	}

	await respond(APP_SETTINGS.config.ADD_SUCCESS_MESSAGE(frequency, body.channel_id));
};

const processRemove = async (body: SlashCommand, respond: RespondFn) => {
	logger.info("Removing user subscription")
	if (!(await FikaUserSubscriptionRepository.remove(body))) {
		await respond(APP_SETTINGS.config.REMOVE_FAILURE_MESSAGE());
		return;
	}
	await respond(APP_SETTINGS.config.REMOVE_SUCCESS_MESSAGE(body.channel_id));
};

const processList = async (body: SlashCommand, respond: RespondFn) => {
	logger.info("Listing user subscription")
	let data = await FikaUserSubscriptionRepository.getListForUserID(body);

	// TODO build a slack response type
	const list: any = {
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "You have joined the following channels:",
				},
			},
		],
	};
	for (let i = 0; i < data.length; i++) {
		const c = data[i];
		let message = `<#${c.channel_id}> with a frequency of *${c.frequency}* active pairing(s).\n`;
		list.blocks.push({
			type: "section",
			text: {
				type: "mrkdwn",
				text: message,
			},
			accessory: {
				type: "button",
				text: {
					type: "plain_text",
					text: "This button does nothing :rocket:",
					emoji: true,
				},
				value: c.channel_id,
				action_id: "leave",
			},
		});
	}
	await respond(list);
};

export var processCommand = async (body: SlashCommand, ack: AckFn<string | RespondArguments>, respond: RespondFn, client: WebClient) => {
	logger.info("process commands")
	await ack();
	await logCommand(body);

	var params: string[] = [];
	if (body.text != "") {
		params = body.text.split(" ");
	}

	// invalid number of arguments, show usage
	if (params.length <= 0) {
		await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
		return;
	}

	var action = params[0].toLowerCase();
	// invalid command, show usage
	if ([APP_SETTINGS.config.FIKA_COMMAND_ADD, APP_SETTINGS.config.FIKA_COMMAND_REMOVE, APP_SETTINGS.config.FIKA_COMMAND_LIST].indexOf(action) < 0) {
		await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
		return;
	}

	// else this is a valid command
	try {
		switch (action) {
			case APP_SETTINGS.config.FIKA_COMMAND_ADD:
				await processAdd(body, respond, params);
				break;
			case APP_SETTINGS.config.FIKA_COMMAND_REMOVE:
				await processRemove(body, respond);
				break;
			case APP_SETTINGS.config.FIKA_COMMAND_LIST:
				await processList(body, respond);
				break;
			default:
				await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
				break;
		}
	} catch (e) {
		logger.error("error:", e);
		await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
		return;
	}
};
