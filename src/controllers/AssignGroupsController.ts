import { logger } from '../utils/logger';
import * as FikaUserSubscriptionRepository from "../repository/FikaUserSubscriptionRepository";
import * as FikaGroupRepository from "../repository/FikaGroupRepository";
import * as MatchingService from "../service/MatchingService"
import * as APP_SETTINGS from '../utils/app_settings';


/**
 * - Get Active Subscriptions will query the user subscriptions and partition according to channels/teams
 * - Each child subscriptions array will consist of valid users who can be matched together
 * - Frequency means how many active pairings a user can be pair with.  It no longer means how many pairings each week.  Maybe it should?
 *
 * TODO:
 * - determine logic to match based on frequency preferences and last/next match times
 * - Might need to review Stable Marriage algorithm, or the Room Mate algorithm.
 */
export var processCommand = async () => {
	// get all active subscriptions
	logger.info("fetch subscriptions")
	let channels = await FikaUserSubscriptionRepository.getActiveSubscriptions();

	// randomly assign groups
	logger.info("generate matches")
	for (let data of channels) {
		let random = MatchingService.generateMatches(data.subscriptions, APP_SETTINGS.config.GROUP_ASSIGNMENT_SIZE);

		// for each group
		// - save in DB with expiration date X days from now
		let now = new Date();
		let expiration = new Date();
		expiration.setDate(now.getDate() + APP_SETTINGS.config.GROUP_ASSIGNMENT_EXPIRATION_DAYS);
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
