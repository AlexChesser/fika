export interface IFikaUserSubscription {
	user_id: String;
	user_name: String;
	team_id: String;
	channel_id: String;
	channel_name: String;

	// user subscription preferences
	frequency: number; // how many pairings does this user want for this channel
}
