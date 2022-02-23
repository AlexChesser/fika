import { logger } from '../utils/logger';
import { WebClient } from "@slack/web-api";
import { RespondFn, SlashCommand } from '@slack/bolt';
import { cli } from 'winston/lib/winston/config';

export var sendUserlist = async (body: SlashCommand, respond: RespondFn, client: WebClient) => {
    logger.info("sending userlist");
    // get full channel userlist 
    const users = await client.conversations.members({ channel: body.channel_id });
    logger.info("users", JSON.stringify(users))
    // send to requesting user
    // end request
    client.conversations.join({
        channel: body.channel_id
    });
    if(users.ok){
        console.log("got list of users");
        const members = users.members?.map((m :string) => `<@${m}>`)
            .join("\n") || "no members in channel";
        console.log(members);
        await respond(members);
        await client.chat.postMessage({
            text: members,
            channel: body.channel_id
        })

    }
    client.conversations.leave({
        channel: body.channel_id
    });
	return {
		statusCode: 200,
		body: "list-channel-users",
	};
};