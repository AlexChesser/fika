export interface ICommand {
	/* slash command properties */
	token?: String | null;
	command: String;
	text: String;
	response_url: String;
	trigger_id: String;

	user_id: String;
	user_name: String;

	team_id: String;
	team_domain: String;

	channel_id: String;
	channel_name: String;

	api_app_id: String;

	enterprise_id?: String | null;
	enterprise_name?: String | null;

	is_enterprise_install?: String;

	timestamp?: Date | null;
}
