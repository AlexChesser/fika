import * as R from 'ramda'
import { IFikaUserSubscription } from '../interface/IFikaUserSubscription'
import { IFikaGroup } from '../interface/IFikaGroup'
import { FikaGroupModel, FikaGroupMemberModel } from '../model/FikaGroup'

/**
 * Matching Service
 * - given a collection of active user subscriptions, randomly assign them by n size groups
 *
 * TODO:
 * - determine if we need to set preferences based on channels/teams
 * - determine logic to match based on frequency preferences and last/next match times
 * - Might need to review Stable Marriage algorithm, or the Room Mate algorithm.
 */


// Given an array, randomly shuffle the elements
export var shuffleArray = (ary: any[]): any[] => {
	var result = [];
	for (let i = 0; i < ary.length; i++) {
		var j = Math.floor(Math.random() * i);
		result[i] = ary[j];
		result[j] = ary[i];
	}
	return result;
}

// Given an array of user subscriptions, create a FikaGroup with all the members
export var createGroup = (ary: IFikaUserSubscription[]): IFikaGroup => {
	let a = ary[0];

	let group = new FikaGroupModel(
		{
			team_id: a.team_id,
			channel_id: a.channel_id,
			channel_name: a.channel_name
		}
	);
	// add all users to members listing
	for (var i = 0; i < ary.length; i++) {
		let member = new FikaGroupMemberModel({
			user_id: ary[i].user_id
			// todo add name of user here
		});
		group.members.push(member);
	}
	return group;
};


// Given an array of users subscriptions, assign the users into groups of size X.
// If a group has only one member in it, assign it to another group
export var assignGroups = (data: IFikaUserSubscription[], groupLength: number = 2): IFikaGroup[] => {
	let pairs = R.splitEvery(groupLength, data);
	let groups = [];
	for (let pair of pairs) {
		let group = createGroup(pair);
		groups.push(group);
	}

	// there's at least 2 groups that can be merged together
	if (groups.length >= 2) {
		// check last pair, see if they are grouped with someone
		let groupLast = groups[groups.length - 1];
		if (groupLast.members.length == 1) {
			// add this pairing to another group
			let group2ndLast = groups[groups.length - 2];
			group2ndLast.members = R.concat(
				group2ndLast.members,
				groupLast.members
			);
			// remove last element
			groups.pop();
		}
	}
	return groups;
};

export var generateMatches = (data: IFikaUserSubscription[], groupLength: number = 2): IFikaGroup[] => {
	let shuffle: IFikaUserSubscription[] = shuffleArray(data);
	return assignGroups(shuffle, groupLength);
};
