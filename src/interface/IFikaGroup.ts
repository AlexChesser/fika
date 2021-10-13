export interface IFikaGroupMember {
	user_id: String;
}

export interface IFikaGroup {
	team_id: String;
	channel_id: String;
	channel_name: String;

	members: IFikaGroupMember[];

	// user subscription preferences
	created?: Date;
	expired?: Date;
}
