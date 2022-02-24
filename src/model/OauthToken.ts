import { IOAuthToken } from '../interface/IOAuthToken';
import { Schema } from 'mongoose';
import mongoose from 'mongoose';

/**
 * Database Model to store incoming events from slack for logging purposes
 */

const OauthSchema = new Schema<IOAuthToken>(
	{
		team_id: { type: String, index: true, unique: true },
		access_token: String,
		response: Schema.Types.Mixed
	},
	{ timestamps: true }
);

export const Oauth = mongoose.model("Oauth", OauthSchema);
