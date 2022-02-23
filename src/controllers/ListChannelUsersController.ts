import { logger } from '../utils/logger';
import { WebClient } from "@slack/web-api";
import { RespondFn, SlashCommand } from '@slack/bolt';

export var sendUserlist = async (body: SlashCommand, respond: RespondFn, client: WebClient) => {
    logger.info("sending userlist");
    // get full channel userlist 
    const users = await client.conversations.members({ channel: body.channel_id });
    logger.info("users", JSON.stringify(users))
    // send to requesting user
    // end request
    if(users.ok){
        const members = users.members?.join("\n") || "no members in channel";
        await client.chat.postMessage({
            text: members,
            channel: body.channel_id
        })
        await respond(members);
    }
	return {
		statusCode: 200,
		body: "list-channel-users",
	};
};