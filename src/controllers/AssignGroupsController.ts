import { logger } from '../logger';
import * as FikaUserSubscriptionRepository from "../repository/FikaUserSubscriptionRepository";
import * as FikaGroupRepository from "../repository/FikaGroupRepository";
import * as MatchingService from "../service/MatchingService"

export var processCommand = async () => {
	// get all active subscriptions
	logger.info("fetch subscriptions")
	let channels = await FikaUserSubscriptionRepository.getActiveSubscriptions();

	// randomly assign groups
	logger.info("generate matches")
	for (let data of channels) {
		let random = MatchingService.generateMatches(data.subscriptions, 2);

		// for each group
		// - save in DB with expiration date 7 days from now
		let now = new Date();
		let expiration = new Date();
		expiration.setDate(now.getDate()+7);
		for (var group of random) {
			// save group match in db
			group.expired = expiration;
			logger.info("create group:", group);
			await FikaGroupRepository.upsert(group);
		}
	}

	return {
		statusCode: 200,
		body: "assigned",
	};
};
