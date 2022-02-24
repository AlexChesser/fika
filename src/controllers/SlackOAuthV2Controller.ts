import { OauthV2AccessResponse, WebClient } from '@slack/web-api';
import { logger } from '../utils/logger';
import { Oauth } from '../model/OauthToken';
import { getMongoose } from '../utils/mongoose-data-utils';

export async function SlackOAuthV2(client: WebClient, code: string) {
	if (!code) {
		// access denied
		logger.log('Access denied');
		return {
			statusCode: 200,
			body: 'access-denied'
		};
	}
	logger.info(`getting oauth for ${code}`);
	const response: OauthV2AccessResponse = await client.oauth.v2.access({
		client_id: process.env.SLACK_CLIENT_ID || 'SLACK_CLIENT_ID',
		client_secret: process.env.SLACK_CLIENT_SECRET || 'SLACK_CLIENT_SECRET',
		code
	});
	const mongoose = await getMongoose();
	await Oauth.findOneAndUpdate({ team_id: response.team?.id }, {
		team_id: response.team?.id,
		access_token: response.access_token,
		response
	})
	.exec();
	mongoose.disconnect();
	logger.info(JSON.stringify(response));
	return {
		statusCode: 200,
		body: "oauth-v2-success"
	};
}

export async function getAccessToken(team_id: string) : Promise<string>  {
	const mongoose = await getMongoose();
	const oauth = await Oauth.findOne({ team_id: team_id }).exec();
	const at = oauth?.access_token || "access_token_not_found";
	mongoose.disconnect();
	return at;
}