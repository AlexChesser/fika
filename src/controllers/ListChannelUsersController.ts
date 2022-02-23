import { logger } from '../utils/logger';
import { WebClient } from "@slack/web-api";
import { RespondFn, SlashCommand } from '@slack/bolt';

export var sendUserlist = async (body: SlashCommand, respond: RespondFn, client: WebClient) => {
    logger.info("sending userlist");
    // get full channel userlist 
    const users = client.conversations.members({ channel: body.channel_id });
    logger.info(JSON.stringify(users))
    // send to requesting user
    // end request
    await respond(JSON.stringify(users))
    await client.chat.postMessage({
        text: JSON.stringify(users),
        channel: body.channel_id
    })
	return {
		statusCode: 200,
		body: "send-dm",
	};
};