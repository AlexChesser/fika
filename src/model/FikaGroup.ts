
import { model, Schema, Document, Model } from "mongoose";
import { IFikaGroup, IFikaGroupMember } from "../interface/IFikaGroup"

/**
 * Database Model to store matched groups over time
 */
const FikaGroupSchema = new Schema<IFikaGroup>({
	team_id: String,
	channel_id: String,
	channel_name: String,

	members: [{user_id:String}],

	// user subscription preferences
	created: Date,
	expired: Date
});

export interface IFikaGroupDocument extends Document, IFikaGroup { }
export interface IFikaGroupModel extends Model<IFikaGroupDocument> { }
export const FikaGroupModel = model<IFikaGroupDocument>("FikaGroup", FikaGroupSchema) as IFikaGroupModel;

export class FikaGroupMemberModel implements IFikaGroupMember {
	user_id: String=""
	constructor(obj:any) {
		this.user_id = obj.user_id;
	}
}
