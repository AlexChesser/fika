import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import * as FikaUserSubscriptionRepository from "../repository/FikaUserSubscriptionRepository";
import * as CommandRepository from "../repository/CommandRepository";


let SLASH_COMMAND_USAGE = `*Usage*:
\`/fika add [minimum number of weeks between matchups]\` eg: \`/fika add 4\`
\`/fika remove\` remove yourself from the current channel's matchups
\`/fika list\` see a list of all the channels you've joined`;

const parseNumber = (s: string): number => {
	try {
		return parseInt(s);
	} catch (e) {
		// invalid number of weeks
		throw "Could not parse number of weeks";
	}
};

const logCommand = async (body: SlashCommand) => {
	await CommandRepository.add(body);
};

const processAdd = async (body: SlashCommand, respond: RespondFn, params: string[]) => {
	var numOfWeeks = parseNumber(params[1]);

	if (!(await FikaUserSubscriptionRepository.add(body, numOfWeeks))) {
		await respond("Could not process request");
		return;
	}

	await respond(
		` 👍 Adding you to group at ${numOfWeeks} num of weeks interval`
	);
};

const processRemove = async (body: SlashCommand, respond: RespondFn) => {
	if (!(await FikaUserSubscriptionRepository.remove(body))) {
		await respond("Could not process request");
		return;
	}
	await respond(`Removing you from this meetup channel`);
};

const processList = async (body: SlashCommand, respond: RespondFn) => {
	let data = await FikaUserSubscriptionRepository.getListForUserID(body);

	// TODO build a slack response type
	const list: any = {
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "You have joined the following channels:",
				},
			},
		],
	};
	for (let i = 0; i < data.length; i++) {
		const c = data[i];
		let message = `<#${c.channel_id}> no more than once every *${c.frequency}* weeks.\n`;
		if (c.lastMatch) {
			message += `You last matched on ${c.lastMatch} and your next won't happen before ${c.nextMatch}`;
		}
		list.blocks.push({
			type: "section",
			text: {
				type: "mrkdwn",
				text: message,
			},
			accessory: {
				type: "button",
				text: {
					type: "plain_text",
					text: "This button does nothing :rocket:",
					emoji: true,
				},
				value: c.channel_id,
				action_id: "leave",
			},
		});
	}
	await respond(list);
};

export var processCommand = async (body: SlashCommand, ack: AckFn<string | RespondArguments>, respond: RespondFn, client: WebClient) => {
	await ack();
	await logCommand(body);

	var params: string[] = [];
	if (body.text != "") {
		params = body.text.split(" ");
	}

	// invalid number of arguments, show usage
	if (params.length <= 0) {
		await respond(SLASH_COMMAND_USAGE);
		return;
	}

	var action = params[0].toLowerCase();
	// invalid command, show usage
	if (["add", "remove", "list"].indexOf(action) < 0) {
		await respond(SLASH_COMMAND_USAGE);
		return;
	}

	// else this is a valid command
	try {
		switch (action) {
			case "add":
				await processAdd(body, respond, params);
				break;
			case "remove":
				await processRemove(body, respond);
				break;
			case "list":
				await processList(body, respond);
				break;
			default:
				await respond(SLASH_COMMAND_USAGE);
				break;
		}
	} catch (e) {
		console.log("error:", e);
		await respond(SLASH_COMMAND_USAGE);
		return;
	}
};
