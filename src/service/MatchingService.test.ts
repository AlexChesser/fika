import * as MatchingService from './MatchingService';
import { IFikaUserSubscription } from '../interface/IFikaUserSubscription'
import { FikaUserSubscriptionModel } from '../model/FikaUserSubscription'
import { IFikaGroup, IFikaGroupMember } from '../interface/IFikaGroup'
import { FikaGroupModel, FikaGroupMemberModel } from '../model/FikaGroup'

let cleanObject=(a:any)=>{
	let x = JSON.parse(JSON.stringify(a));
	delete x["_id"]
	return x;
}
let convertToObject=(a:IFikaGroup[])=>{
	let result = [];
	for (let record of a) {
		let r = cleanObject(record);
		r.members=[];
		for (let member of record.members) {
			let m = cleanObject(member);
			r.members.push(m);
		}
		result.push(r);
	}
	return result;
}

let createUserSubscriptions = (n: number) => {
	let result = [];
	for (var i = 0; i < n; i++) {
		let user = new FikaUserSubscriptionModel({
			team_id: "1",
			channel_id: "1",
			user_id: i.toString()
		});
		result.push(user);
	}
	return result;
};

let createGroup = (ary: string[], aryUsers: IFikaUserSubscription[]) => {
	let a = aryUsers[0];
	let group = new FikaGroupModel({
		team_id: a.team_id,
		channel_id: a.channel_id,
		channel_name: a.channel_name
	}) as IFikaGroup;

	// add all users to members listing
	for (var i = 0; i < ary.length; i++) {
		let member = new FikaGroupMemberModel({
			user_id: ary[i]
			// todo add name of user here
		}) as IFikaGroupMember;
		group.members.push(member);
	}
	return group;
};

let calculateExpectedGroups = (expectedPairs: string[][], users: IFikaUserSubscription[]) => {
	let expected = [];
	for (var pair of expectedPairs) {
		expected.push(createGroup(pair, users));
	}
	return expected;
}

const testsGroups: any = [
	[1, 1, 1, [["0"]]],
	[2, 2, 1, [["0", "1"]]],
	[3, 2, 1, [["0", "1", "2"]]],

	[4, 2, 2, [["0", "1"], ["2", "3"]]],
	[5, 2, 2, [["0", "1"], ["2", "3", "4"]]],

	[6, 2, 3, [["0", "1"], ["2", "3"], ['4', '5']]],
	[7, 2, 3, [["0", "1"], ["2", "3"], ['4', '5', '6']]],

	[4, 3, 1, [["0", "1", "2", "3"]]],
	[5, 3, 2, [["0", "1", "2"], ["3", "4"]]],
	[6, 3, 2, [["0", "1", "2"], ["3", "4", "5"]]],
	[7, 3, 2, [["0", "1", "2"], ["3", "4", "5", "6"]]],
	[8, 3, 3, [["0", "1", "2"], ["3", "4", "5"], ["6", "7"]]],
];
// Given an array of UserDetails, assign the items into groups of size X.  If a group has only one member in it, assign it to another group
testsGroups.forEach((testdata: any) => {
	let i = 0;
	let numOfUsers: number = testdata[i++];
	let groupLength: number = testdata[i++];
	let numOfPairs: number = testdata[i++];
	var expectedPairs: string[][] = testdata[i++];

	let fullTestName = `When calling service with ${numOfUsers} users, with size ${groupLength} then should get ${numOfPairs} matches`;
	test.only(fullTestName, async function () {
		// arrange
		let list = createUserSubscriptions(numOfUsers);

		// act
		let actual = MatchingService.assignGroups(list, groupLength);

		// assert
		let expected = calculateExpectedGroups(expectedPairs, list);

		let actualClean = convertToObject(actual);
		let expectedClean = convertToObject(expected);

		// console.log("actual:", actualClean);
		// console.log("expected:", expectedClean);

		expect(actualClean).toEqual(expectedClean);
		expect(actual.length).toEqual(numOfPairs);
	});
});

