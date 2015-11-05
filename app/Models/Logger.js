import winston from 'winston';
import { GCL } from 'winston-gcl';
import { Firebase } from 'winston-firebase';
import config from '../config';
import { firebase as FirebaseConfig } from '../config';
import { winston as WinstonConfig } from '../config';
import _ from 'underscore';
import google from 'googleapis';
import os from 'os';

winston.transports.GCL = GCL;

var logger = new winston.Logger(WinstonConfig.global);

for (var transport of WinstonConfig.transports) {

	var transportDetails = transport.details;
	if (transport.type == 'GCL') {
		var jwtClient = new google.auth.JWT(null, null, null, transport.gcloud_endpoint);
		jwtClient.fromJSON(transport.credentials);
		transportDetails.auth = jwtClient;
	} 
	logger.add( winston.transports[transport.type], transportDetails );
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
