export interface IFikaGroupMember {
	user_id: String;
}

export interface IFikaGroup {
	team_id: String;
	channel_id: String;
	channel_name: String;

	members: IFikaGroupMember[];
	members_key: String; // helper field to make sure members.user_ids + team_id + channel_id + expired are unique

	expired: Date; // Indicates how long this group is active
	notified: Date | null; // Indicates when direct message between members has been sent
}
