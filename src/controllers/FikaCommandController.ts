import { logger } from '../utils/logger';
import * as APP_SETTINGS from '../utils/app_settings';

import { AckFn, RespondArguments, RespondFn, SlashCommand } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { generatePairs } from './PairUsersController';

export var processCommand = async (body: SlashCommand, ack: AckFn<string | RespondArguments>, respond: RespondFn, client: WebClient) => {
	logger.info('process commands', JSON.stringify(body));
	await ack();
	var params: string[] = [];
	if (body.text != '') {
		params = body.text.split(' ');
	}

	// invalid number of arguments, show usage
	if (params.length <= 0) {
		console.log('no params');
		await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
		return;
	}

	var action = params[0].toLowerCase();
	console.log(`calling action: ${action}`);
	// invalid command, show usage
	if ([APP_SETTINGS.config.FIKA_COMMAND_PAIR].indexOf(action) < 0) {
		console.log("invalid command")
		await respond(`Command \`${action}\` is invalid.\n${APP_SETTINGS.config.SLASH_COMMAND_USAGE}`);
		return;
	}

	// else this is a valid command
	try {
		switch (action) {
			case APP_SETTINGS.config.FIKA_COMMAND_PAIR:
				console.log("generating pairs!")
				await generatePairs(body, respond, client);
				break;
			default:
				await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
				break;
		}
		return;
	} catch (e) {
		logger.error('error:', e);
		await respond(APP_SETTINGS.config.SLASH_COMMAND_USAGE);
		return;
	}
};
