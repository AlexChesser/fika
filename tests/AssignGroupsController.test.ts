import mongoose = require("mongoose");
import { CONFIG } from './jest-settings';

import { FikaGroupModel } from "../src/model/FikaGroup";
import { FikaUserSubscriptionModel } from "../src/model/FikaUserSubscription"

import * as FikaUserSubscriptionRepository from "../src/repository/FikaUserSubscriptionRepository";
import * as FikaGroupRepository from "../src/repository/FikaGroupRepository";

import * as AssignGroupController from '../src/controllers/AssignGroupsController'


const inspect = (s: any) => JSON.stringify(s, null, ' ')


describe("Assign Groups Controller Integration Tests", () => {
	let TEST_DATE_NOW: Date;
	let TEST_EXPIRED_DATE: Date;
	let TEST_FUTURE_DATE: Date;


	beforeAll(async () => {
		process.env = Object.assign(process.env, CONFIG);

		let connectionURI = (process.env.MONGODB_URI || "");
		if (connectionURI.indexOf("integrationtests")<0) {
			throw "Yikes, invalid test database.  Cannot run tests"
		}

		await mongoose.connect(connectionURI);
	});

	beforeEach(async () => {
		await FikaGroupModel.collection.drop();
		await FikaUserSubscriptionModel.collection.drop();

		TEST_DATE_NOW = new Date();

		TEST_EXPIRED_DATE = new Date(TEST_DATE_NOW);
		TEST_EXPIRED_DATE.setMonth(TEST_DATE_NOW.getMonth() - 1);

		TEST_FUTURE_DATE = (new Date(TEST_DATE_NOW))
		TEST_FUTURE_DATE.setMonth(TEST_DATE_NOW.getMonth() + 1);


		for (let i = 1; i <= 11; i++) {
			// create user 1-11 in team 1/channel 1
			await FikaUserSubscriptionRepository.add({ team_id: "1", channel_id: "1", user_id: i.toString() });
		}

		for (let i = 1; i <= 5; i++) {
			// create user 1-5 in team 1/channel 2
			await FikaUserSubscriptionRepository.add({ team_id: "1", channel_id: "2", user_id: i.toString() });
		}


		// group user 1 and user 2 in the past
		await FikaGroupRepository.upsert({
			team_id: "1",
			channel_id: "1",
			members: [{ user_id: "1" }, { user_id: "2" }],
			expired: TEST_EXPIRED_DATE
		})

		// group user 3 and user 4 in the future
		await FikaGroupRepository.upsert({
			team_id: "1",
			channel_id: "1",
			members: [{ user_id: "3" }, { user_id: "4" }],
			expired: TEST_FUTURE_DATE
		})

		for (var x of ["8", "9", "10", "11"]) {
			// group user 7 and user x in the future
			await FikaGroupRepository.upsert({
				team_id: "1",
				channel_id: "1",
				members: [{ user_id: "7" }, { user_id: x }],
				expired: TEST_FUTURE_DATE
			})
		}
	});

	afterAll(async () => {
		await mongoose.connection.close();
		// await mongoose.connection.dropDatabase()
	});

	test("Active User Subscriptions", async function () {
		// act
		let records = await FikaUserSubscriptionRepository.getActiveSubscriptions(TEST_DATE_NOW);

		// assert
		expect(records.length).toEqual(2);

		let group1 = records.filter(r=>r.team_id=="1" && r.channel_id=="1")[0];
		expect(group1.subscriptions.length).toEqual(10);

		let group2 = records.filter(r => r.team_id == "1" && r.channel_id == "2")[0];
		expect(group2.subscriptions.length).toEqual(5);

	})


	test.only("Assign Groups", async function () {
		// arrange
		let records = await FikaGroupRepository.findPendingDMs();
		expect(records.length).toEqual(6);

		await FikaGroupModel.updateMany({}, [
			{$set:{notified:new Date()}}
		]).exec();

		// act
		let command = await AssignGroupController.processCommand();

		// assert
		expect(command.statusCode).toEqual(200);

		records = await FikaGroupModel.find().exec();
		expect(records.length).toEqual(13);

		records = await FikaGroupRepository.findPendingDMs();
		expect(records.length).toEqual(7);
	})
})
