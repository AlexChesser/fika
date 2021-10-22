
import { model, Schema, Document, Model } from "mongoose";
import { IFikaGroup, IFikaGroupMember } from "../interface/IFikaGroup"

/**
 * Database Model to store matched groups over time
 */
interface IMatchKey {
	team_id: String;
	channel_id: String;
	members_key: String;
	expired: Date;
}

export function makeFikaGroupKey(req: IFikaGroup): IMatchKey {
	req.members_key = req.members.map(i => i.user_id).join(",");
	return {
		team_id: req.team_id,
		channel_id: req.channel_id,
		members_key: req.members_key,
		expired: req.expired
	};
}


const FikaGroupSchema = new Schema<IFikaGroup>({
	team_id: String,
	channel_id: String,
	channel_name: String,
	members: [{ user_id: String }],
	members_key: String,
	expired: Date,
	notified: {
		type: Date,
		default: null
	}
}, { timestamps: true });

FikaGroupSchema.pre('save', function (next) {
	let tmp = this.members.map((i: any) => i.user_id);
	this.members_key = tmp.join(",");
	next();
})

FikaGroupSchema.index({ team_id: 1, channel_id: 1, expired: 1, members_key: 1 });


export interface IFikaGroupDocument extends Document, IFikaGroup { }
export interface IFikaGroupModel extends Model<IFikaGroupDocument> { }
export const FikaGroupModel = model<IFikaGroupDocument>("FikaGroup", FikaGroupSchema) as IFikaGroupModel;

export class FikaGroupMemberModel implements IFikaGroupMember {
	user_id: String = ""
	constructor(obj: any) {
		this.user_id = obj.user_id;
	}
}
