const winston = require('winston');

/**
 * Configure Logger
 */
const _logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: 'fika-service' },
	transports: [
		new winston.transports.Console({
			format: winston.format.simple(),
		})
	],
});

export const logger = _logger;
