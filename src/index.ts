import { logger } from './utils/logger';

import * as APP_SETTINGS from './utils/app_settings';
import { APIGatewayEvent, Context } from "aws-lambda";
import { App, ExpressReceiver, ReceiverEvent } from "@slack/bolt";

import * as FikaCommandController from "./controllers/FikaCommandController";


/**
 * Initialize Slack Bot communication with bot token and signing secret
 */
const expressReceiver = new ExpressReceiver({
	signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
	processBeforeResponse: true,
});

const app = new App({
	signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
	token: `${process.env.SLACK_BOT_TOKEN}`,
	receiver: expressReceiver
});


/**
 * Configure Slack Bot Commands
 */
app.command(
	APP_SETTINGS.config.FIKA_SLASH_COMMAND_USERMANAGEMENT,
	async ({ body, ack, respond, client }) => {
		return await FikaCommandController.processCommand(
			body,
			ack,
			respond,
			client
		);
	}
);

/**
 * Helper function to parse request body.  Depending if the request is coming from slackbot command, or coming from slackbot event, the body is different
 */
function parseRequestBody(stringBody: string | null, contentType: string | undefined) {
	try {
		let inputStringBody: string = stringBody ?? "";
		// depending on incoming request, body can be formated as urlencoded form elements or just decoded string
		// determine appropriate format to decode body content
		if (contentType && contentType === "application/x-www-form-urlencoded") {
			let result: any = {};
			var keyValuePairs = inputStringBody.split("&");
			keyValuePairs.forEach(function (pair: string): void {
				let individualKeyValuePair: string[] = pair.split("=");
				result[individualKeyValuePair[0]] = decodeURIComponent((individualKeyValuePair[1] || "").replace("+", " "));
			});
			return JSON.parse(JSON.stringify(result));

		} else {
			return JSON.parse(inputStringBody);
		}
	} catch {
		return undefined;
	}
}

/**
 * Main handler for all incoming events
 *
 * Handles:
 *  * slack url-verification requests
 * 	* slack commands
 *  * external requests to trigger scheduled jobs.
 * 		- Ideally, netlify would allow us to create a cron job, but it doesnt.  Thus creating an endpoint for github actions to hit.
 */
export async function handler(event: APIGatewayEvent, context: Context) {
	try {
		// verify incoming request is valid
		const payload = parseRequestBody(event.body, event.headers["content-type"]);
		logger.info("payload:", payload);
		if (payload && payload.type && payload.type === "url_verification") {
			return {
				statusCode: 200,
				body: payload.challenge,
			};
		}

		// process any events coming from Slack
		const slackEvent: ReceiverEvent = {
			body: payload,
			ack: async (response) => {
				return new Promise<void>((resolve, reject) => {
					resolve();
					return {
						statusCode: 200,
						body: response ?? "",
					};
				});
			},
		};
		await app.processEvent(slackEvent);
		return {
			statusCode: 200,
			body: "",
		};
	} catch (e) {
		logger.error("There was an unexpected error: ", e);
		return {
			statusCode: 500,
			body: "There was an unexpected error:" + e,
		};
	}
}
