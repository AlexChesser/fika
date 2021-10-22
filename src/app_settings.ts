let ROOT_PATH = '/.netlify/functions/index';

let SLASH_COMMAND_USAGE = `*Usage*:
\`/fika add [minimum number of weeks between matchups]\` eg: \`/fika add 4\`
\`/fika remove\` remove yourself from the current channel's matchups
\`/fika list\` see a list of all the channels you've joined`;

export const config: any = {

	ASSIGN_GROUPS_PATH: `${ROOT_PATH}/assign-groups`,
	SEND_DMS_PATH: `${ROOT_PATH}/send-dms`,

	FIKA_SLASH_COMMAND_USERMANAGEMENT: "/fika",
	FIKA_COMMAND_ADD: "add",
	FIKA_COMMAND_REMOVE: "remove",
	FIKA_COMMAND_LIST: "list",

	SLASH_COMMAND_USAGE,

	DEFAULT_FREQUENCY: 4,

	GROUP_ASSIGNMENT_SIZE: 2,
	GROUP_ASSIGNMENT_EXPIRATION_DAYS: 7,

	DM_MESSAGE: (users: string[], channel_id: string) => {
		let msgUsersList = users.map(u => `<@${u}>`)
		return `Hey ${msgUsersList}! You've been matched in channel <#${channel_id}>!`;
	},

	ADD_SUCCESS_MESSAGE: (frequency: number, channel_id: number) => ` 👍 Adding you to <#${channel_id}> with frequency ${frequency}.`,
	ADD_FAILURE_MESSAGE: () => "Could not process request",

	REMOVE_SUCCESS_MESSAGE: (channel_id: number) => `Removing you from <#${channel_id}>`,
	REMOVE_FAILURE_MESSAGE: () => "Could not process request"
};
