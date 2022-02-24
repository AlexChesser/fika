import { logger } from '../utils/logger';
import { WebClient } from "@slack/web-api";
import { RespondFn, SlashCommand } from '@slack/bolt';
import { getAccessToken } from './SlackOAuthV2Controller';

export var generatePairs = async (body: SlashCommand, respond: RespondFn, client: WebClient) => {
    logger.info("creating pairs"); 
    const users = await client.conversations.members({
        token: await getAccessToken(body.team_id),
        channel: body.channel_id,
        limit: 999
    });
    if(users.ok){
        const members = users.members?.map((m :string) => `<@${m}>`);
        let pairs :string[] = [];
        while(members != undefined && members.length > 0){
            const one = members.shift();
            if(members.length == 0){
                pairs.push(`standby: ${one}`);
                break;
            }
            const two = members.splice(Math.floor(Math.random()*members.length),1)[0];
            pairs.push(`${one} meet ${two}`);
        }
        await respond(pairs.join("\n"));
    }
	return {
		statusCode: 200,
		body: "create-pairs",
	};
};