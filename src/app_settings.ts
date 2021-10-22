let ROOT_PATH = '/.netlify/functions/index';

let SLASH_COMMAND_USAGE = `*Usage*:
\`/fika add [minimum number of weeks between matchups]\` eg: \`/fika add 4\`
\`/fika remove\` remove yourself from the current channel's matchups
\`/fika list\` see a list of all the channels you've joined`;

export const config: any = {
	ASSIGN_GROUPS_PATH: `${ROOT_PATH}/assign-groups`,
	SEND_DMS_PATH: `${ROOT_PATH}/send-dms`,
	FIKA_SLASH_COMMAND_USERMANAGEMENT: "/tricia",
	SLASH_COMMAND_USAGE,
	DEFAULT_FREQUENCY:4
};
