import * as winston from 'winston';
import { GCL } from 'winston-gcl';
import config from '../config';
import { firebase as FirebaseConfig } from '../config';
import { winston as WinstonConfig } from '../config';
import * as _ from 'underscore';
import * as google from 'googleapis';
import * as os from 'os';

winston.transports.GCL = GCL;

var logger = new winston.Logger(WinstonConfig.global);

for (var transport of WinstonConfig.transports) {
	var transportDetails = transport.details;
	if (transport.type === 'GCL') {
		var jwtClient = new google.auth.JWT(null, null, null, transport.gcloud_endpoint);
		jwtClient.fromJSON(transport.credentials);
		transportDetails.googleMetadata.id = os.hostname();
		transportDetails.auth = jwtClient;
	}
	if (_.has(winston.transports, transport.type)) {
		logger.add(winston.transports[transport.type], transportDetails);
	}
}

logger.rewriters.push( (level, msg, meta) => {
	return {
		date: new Date(),
		host: os.hostname(),
		env: FirebaseConfig.BaseURL,
		workers: config.workers,
		data: meta
	};

});

export default logger;
