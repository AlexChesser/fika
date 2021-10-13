import { APIGatewayEvent, Context } from "aws-lambda";
import { App, ExpressReceiver, ReceiverEvent } from "@slack/bolt";

import * as FikaUserSubscriptionCommandController from "./controllers/FikaUserSubscriptionCommandController";
import * as MatchingController from "./controllers/MatchingController"

let ROOT_PATH = '/.netlify/functions/index';

// Initializes your app with your bot token and signing secret
const expressReceiver = new ExpressReceiver({
	signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
	processBeforeResponse: true,
});

const app = new App({
	signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
	token: `${process.env.SLACK_BOT_TOKEN}`,
	receiver: expressReceiver
});

let SLASH_COMMANDS = {
	FIKA_SLASH_COMMAND_USERMANAGEMENT: "/tricia",
};
app.command(
	SLASH_COMMANDS.FIKA_SLASH_COMMAND_USERMANAGEMENT,
	async ({ body, ack, respond, client }) => {
		return FikaUserSubscriptionCommandController.processCommand(
			body,
			ack,
			respond,
			client
		);
	}
);

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

export async function handler(event: APIGatewayEvent, context: Context) {
	try {
		// process any events from 3rd party calls
		if (event.httpMethod === 'GET' && event.path === `${ROOT_PATH}/assign-groups`) {
			console.log("process assign-groups")
			return MatchingController.processCommand(app.client);
		}

		// verify incoming request is valid
		const payload = parseRequestBody(event.body, event.headers["content-type"]);
		console.log("payload:", payload);
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
		return {
			statusCode: 500,
			body: "There was an unexpected error:" + e,
		};
	}
}
