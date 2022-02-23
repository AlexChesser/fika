import { logger } from '../utils/logger';
import * as APP_SETTINGS from '../utils/app_settings';

import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { sendUserlist } from './ListChannelUsersController';

export var processCommand = async (body: SlashCommand, ack: AckFn<string | RespondArguments>, respond: RespondFn, client: WebClient) => {
	logger.info("process commands", JSON.stringify(body))
	await ack();
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
	if ([APP_SETTINGS.config.FIKA_COMMAND_USERS].indexOf(action) < 0) {
		await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
		return;
	}

	// else this is a valid command
	try {
		switch (action) {
			case APP_SETTINGS.config.FIKA_COMMAND_USERS:
				await sendUserlist(body, respond, client);
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
