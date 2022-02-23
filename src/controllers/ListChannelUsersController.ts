import { logger } from '../utils/logger';
import { WebClient } from "@slack/web-api";
import { RespondFn, SlashCommand } from '@slack/bolt';

export var sendUserlist = async (body: SlashCommand, respond: RespondFn, client: WebClient) => {
    logger.info(body, respond);
    // get full channel userlist 
    const users = client.conversations.members({ channel: body.channel_id });
    logger.info(JSON.stringify(users))
    // send to requesting user
    // end request
	return {
		statusCode: 200,
		body: "send-dm",
	};
};