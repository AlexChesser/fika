
import { model, Schema, Document, Model } from "mongoose";
import { IFikaUserSubscription } from "../interface/IFikaUserSubscription"

/**
 * Database Model to store user subscription preferences
 *
 * TODO:
 * - determine if we need to set preferences based on channels/teams
 * - determine logic to match based on frequency preferences and last/next match times
 */
interface IMatchKey {
	team_id: String;
	channel_id: String;
	user_id: String;
}

export function makeFikaUserSubscriptionKey(req: IFikaUserSubscription): IMatchKey {
	return {
		team_id: req.team_id,
		channel_id: req.channel_id,
		user_id: req.user_id,
	};
}

const FikaUserSubscriptionSchema = new Schema<IFikaUserSubscription>({
	team_id: String,

	channel_id: String,
	channel_name: String,

	user_id: String,
	user_name: String,

	frequency: Number

}, { timestamps: true });
FikaUserSubscriptionSchema.index({ team_id: 1, channel_id: 1, user_id: 1 });

export interface IFikaUserSubscriptionDocument extends Document, IFikaUserSubscription { }
export interface IFikaUserSubscriptionModel extends Model<IFikaUserSubscriptionDocument> { }
export const FikaUserSubscriptionModel = model<IFikaUserSubscriptionDocument>("FikaUserSubscription", FikaUserSubscriptionSchema) as IFikaUserSubscriptionModel;

