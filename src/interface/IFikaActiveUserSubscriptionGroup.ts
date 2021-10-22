import { IFikaUserSubscription } from './IFikaUserSubscription';

export interface IFikaActiveUserSubscriptionGroup {
	team_id: String;
	channel_id: String;
	subscriptions:IFikaUserSubscription[]
}
