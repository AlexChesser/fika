import * as mongoose from 'mongoose';

export async function getMongoose() {
	await mongoose.connect(process.env.MONGODB_URI || '');
    return mongoose;
}

const gracefulExit = function () {
	mongoose.connection.close(function () {
		console.log('Mongoose default connection with DB is disconnected through app termination');
		process.exit(0);
	});
};

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
