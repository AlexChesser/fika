import { logger } from '../utils/logger';
import { WebClient } from "@slack/web-api";
import { RespondFn, SlashCommand } from '@slack/bolt';

export var generatePairs = async (body: SlashCommand, respond: RespondFn, client: WebClient) => {
    logger.info("creating pairs"); 
    const users = await client.conversations.members({ channel: body.channel_id });
    if(users.ok){
        const members = users.members?.map((m :string) => `<@${m}>`);
        let pairs :string[] = [];
        while(members != undefined && members.length > 0){
            const one = members.pop();
            if(members.length == 0){
                pairs.push(`standby: ${one}`);
                break;
            }
            const two = members.splice(Math.floor(Math.random()*members.length));
            pairs.push(`${one} meet ${two}`);
        }
        await respond(pairs.join("\n"));
    }
	return {
		statusCode: 200,
		body: "create-pairs",
	};
};