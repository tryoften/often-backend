var path = require('path');
var args = require('minimist')(process.argv.slice(2));

var config = {
	port: process.env.PORT || '8080',

	worker: "not-set",
	
	/* Secret is used by sessions to encrypt the cookie */
	secret: 'AIzaSyDBCtKaA-7DZeMXfSkIG_C5gDCeQyucc-E',

	logPath: process.env.LOG_PATH || './',

	/*
		dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
		configure the appropriate settings for each storage engine below.
		Note that datastore requires no additional configuration.
		*/
		dataBackend: 'datastore',

	/*
		This can also be your project id as each project has a default
		bucket with the same name as the project id.
		*/
		cloudStorageBucket: 'acoustic-rider-104419',

	/*
		This is the id of your project in the Google Developers Console.
		*/
		gcloud: {
			projectId: 'acoustic-rider-104419',
			bucket_name: 'resized_images',
			key: 'AIzaSyDBCtKaA-7DZeMXfSkIG_C5gDCeQyucc-E'
		},

	/*
		The client ID and secret can be obtained by generating a new Client ID for
		a web application on Google Developers Console.
		*/
		oauth2: {
			clientId: 'your-client-id-here',
			clientSecret: 'your-client-secret-here',
			redirectUrl: process.env.OAUTH2_CALLBACK || 'http://localhost:8080/oauth2callback',
			scopes: ['email', 'profile']
		},

		firebase: {
		 BaseURL: args['firebase-root'] || 'https://often-dev.firebaseio.com',
		 Secret: args['firebase-secret'] || 'kOgz3FhY0HfxeE35HCDOKB9v5BSJ1QWWqje7Yid2'
	 },

	 elasticsearch: {
		 BaseURL: args['elasticsearch-root'] || 'http://1b3ec485645a42fe201d499442877842.us-east-1.aws.found.io:9200'
	 },

	 bitly: {
		clientId: "22a6e134c49f8ccc283660563fb3d4e9d86d42db",
		clientSecret: "0c7321da3281625aa86d6245374ee206c1d6e331",
		accessToken: "caf39699a2f9df44a2c8acb4ab466385753dd228"
	}

};

config.firebase.queues = {
	default: {
		url: `${config.firebase.BaseURL}/queues/default`,
		numWorkers: 1,
		sanitize: false,
		suppressStack: true
	},
	feed: {
		specId: 'feed_ingestion',
		url: `${config.firebase.BaseURL}/queues/feed`,
		numWorkers: 2,
		sanitize: false
	},
	search: {
		specId: 'search_query',
		url: `${config.firebase.BaseURL}/queues/search`,
		numWorkers: 2,
		sanitize: false,
		suppressStack: true
	},
	imageResizing: {
		specId: 'image_resizing',
		url: `${config.firebase.BaseURL}/queues/feed`,
		numWorkers: 2,
		sanitize: false,
		suppressStack: true
	},
	user: {
		url: `${config.firebase.BaseURL}/queues/user`,
		numWorkers: 2,
		sanitize: false,
		suppressStack: true
	}
};


config.winston = {
	global: {
		exitOnError: false,
		level: "info",
		handleExceptions: true,
		humanReadableUnhandledException: true,
		timestamp: true
	},
	transports: [
	{
		type: 'Console',
		details: {
			level: 'silly'
		}
	},
	{
		type: 'File',
		details: {
			filename: 'filelog-info.log'
		}
	},
	{
		type: 'GCL',
		details: {
			logId: '1337',
			projectId: 'acoustic-rider-104419',
			googleMetadata: {
			 "id": "winston-logger",
			 "zone": "us-central1-a",
			 "region": "us-central1"
		 }
	 },
	 credentials: {
		"private_key_id": "827eff2262d5994f6163fdf31bf0fa23b5860447",
		"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEwAIBADANBgkqhkiG9w0BAQEFAASCBKowggSmAgEAAoIBAQDPcngDbnspPSrA\n7r+Y+Qi2NuQohwg97LEaxe2TEOEkGyosgvyhuD59chS2zAKq2MXCVtFo94JDrG+G\nEZSgpxa+sWG69+ubCVPPE5pRoYDg4UO1HSCe24VZ1l0j7YbpG4XikWclFCoISLml\n8gMcrje4Tq6zcaE2Pw638HL4PWu9ABqclPcZVwrlfm9/pk/aGl6BruAfFuYhlwK9\nM6P5YDPR9/GrxPtqk3kiAfU/BkLV7vkbr9Ze4WFvlJr6SvlfO+HliPwRu+qdBpFW\ne84+0YuS1iLKvQwj17kJRCtRW1m17/1QTaiF1Jr6QT6ORv/NO7HQE8SMDkcH6Ico\nG8NgMwr9AgMBAAECggEBAI/tnbLTzoO4OpeNjkV2U0MJJpevyFoehGpM9R5aUbqZ\nVlN3tgwGJuUmZ5TESv16VQsW7Ufkoe6ODvp37CTiiPdZXrM4G7F/cTR1J1aHtUFR\nSYa5ZM6TBBxmjEzHGhlVzTh7JZMmQFtrCdNG7D3T6jjn7nH13qIicfXQ0BPHmZ6Q\n2XyhZCyK/6MXPxEVRJZZZUGCCAs7NaxYTE8f2spOEZ5nM/aIPcPkERmXorsidC5U\nEiML+QTKusNgUNxtgc0FRTed+8N3ggXwoonxvQM8E+2owDAuAqplF/lTe6FyFiuS\nDOctzQqoD4Cahe3aMnEeqRoEJeCEzLodYmR1dzj0GgECgYEA9WjtulJhF7j5ZEqH\nIjB90RnP+l536at4uQ1nLZqT4j6iqB+z8AheluqeRkr2p5Ynpu2702Wu+KUl9ol6\nwh5xcqZRGrKmi9YQSs+M6gYIhLqlKLv89JbwY2Lvy8EDehJJxH3Wt+ssOCzvpF8P\nfXP4ulFCVnLL2U0PsC83JBIgxL0CgYEA2GYpVTkwRs19ed7g1SjliCGCiGYDv5SF\nXBmwO84lJow5Lgo/NaGLxde4BTDQbfHvhGejbvcmI2TKtESuwrUUbH6VcdHrNwsM\nbs0sLNsPiuqhtAZ+22hU++pBBd8QkKmPRWSPtgPPb3GGlBFr9Rf67EbE6MwIjjub\nQUfIWYu8Y0ECgYEAjlrPi8U9jQU/pW2V9b8rPKA8hH9ID8Pnw3CC6XFBV3v93oiF\nWDeCpwhxx1S0v4Hafnpo+beCR7mEy/3zt6bxKBBR+6ql8Xe6+6ppk1bsmhGqvHZP\nxZHI394EO6061xTEtbZJV2aTwAJRAIgj9CHRpkJ8uKjelq6c6xZ4ZfQeDgECgYEA\nuTxCF0x70a+mv8KUDIMUb8HXfbBtdvnIaj0nCRp93JBdhdaJovvkrHbqc68ES4i0\ncU9Rq/PtdpCZn1PHkK32jKSSgjqhsJ1JiDMipEbj+BK+Vl7VCjU1weoUvNTj1iD+\nnfTlu3VphEjWXTrIgaWESeqONYQpsq69SFUM3/HoUcECgYEAqL4ZrltYcmF1K6ZZ\nrre2RYX+eABycPnUckF89vnhIWTibAgCaf6oPQnA/Ihz0Cgb9/HBH3sbyMW9ldP7\n/lUaFr08VnSIAm2jmC9yiksjzltWlMsnKTaFBbvYr500zfXMLTa/gwnGVD/xnyzH\n7UYNdx/IiHGfKQvzA8ZZV3/iP0Q\u003d\n-----END PRIVATE KEY-----\n",
		"client_email": "215408970444-03ulfcdavngo6n4e6itsldmeq39gju7q@developer.gserviceaccount.com",
		"client_id": "215408970444-03ulfcdavngo6n4e6itsldmeq39gju7q.apps.googleusercontent.com",
		"type": "service_account"
	},
	gcloud_endpoint : "https://www.googleapis.com/auth/logging.write"
},
{
	type: 'Firebase',
	details: {
		rootRef: `${ config.firebase.BaseURL }/events`,
		secretKey: `${ config.firebase.Secret }`,
		UID: 'logger',
		admin: true
	}
}
]
};

module.exports = config;
