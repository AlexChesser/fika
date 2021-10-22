import mongoose = require("mongoose");
import { CONFIG } from './jest-settings';

import { FikaGroupModel } from "../src/model/FikaGroup";
import { FikaUserSubscriptionModel } from "../src/model/FikaUserSubscription"

import * as FikaUserSubscriptionRepository from "../src/repository/FikaUserSubscriptionRepository";
import * as FikaGroupRepository from "../src/repository/FikaGroupRepository";

import * as SendDMController from '../src/controllers/SendDMController'
import { App, ExpressReceiver, ReceiverEvent } from "@slack/bolt";


const inspect = (s: any) => JSON.stringify(s, null, ' ')


describe("Send DM Controller Integration Tests", () => {
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
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	test("Send DM to Active group", async function () {
		// act
		let records = await FikaGroupRepository.findPendingDMs();

		// assert
		expect(records.length).toEqual(1);
	})


	test.only("Send DM Controller Test", async function () {
		// arrange
		let records = await FikaGroupRepository.findPendingDMs();
		expect(records.length).toEqual(1);

		/**
		 * Initialize Slack Bot communication with bot token and signing secret
		 */
		const expressReceiver = new ExpressReceiver({
			signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
			processBeforeResponse: true,
		});

		const app = new App({
			signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
			token: `${process.env.SLACK_BOT_TOKEN}`,
			receiver: expressReceiver
		});
		// act
		let command = await SendDMController.processCommand(app.client);

		// assert
		expect(command.statusCode).toEqual(200);

		records = await FikaGroupRepository.findPendingDMs();
		expect(records.length).toEqual(0);
	})
})
